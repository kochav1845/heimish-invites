import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import { InvitationTemplate, InvitationData } from '../../types/invitation';
import { createClient } from '@supabase/supabase-js';
import { useFontLoader } from '../../hooks/useFontLoader'; 
import { useCallback, useMemo, useRef as useReactRef } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface DatabasePlaceholder {
  id: string;
  template_id: string;
  label: string;
  description?: string;
  field_type: string;
  default_value: string;
  placeholder: string;
  required: boolean;
  visible: boolean;
  style: any;
  text_direction?: string;
}

interface InvitationPreviewProps {
  template: InvitationTemplate;
  placeholders: DatabasePlaceholder[];
  data: InvitationData;
  width?: number;
  height?: number;
  scale?: number;
  renderOnMount?: boolean;
  selectedField?: string | null;
  editMode?: boolean;
  onFieldSelect?: (fieldId: string) => void;
  onFieldHover?: (fieldId: string | null) => void;
  refreshKey?: number;
  renderMode?: 'dom' | 'canvas';
  onRenderStatusChange?: (isRendering: boolean) => void;
  onRenderError?: (error: string) => void;
  renderQuality?: 'low' | 'medium' | 'high';
}

const InvitationPreview = forwardRef<HTMLDivElement, InvitationPreviewProps>(({
  template, 
  placeholders,
  data,
  width = 210 * 3.779527559, // Convert mm to px at 96 DPI (A4 width)
  height = 297 * 3.779527559, // Convert mm to px at 96 DPI (A4 height)
  scale = 1,
  renderOnMount = false,
  selectedField,
  editMode = false,
  onFieldSelect,
  onFieldHover,
  refreshKey = 0,
  renderMode = 'canvas',
  onRenderStatusChange,
  onRenderError,
  renderQuality = 'medium'
}, ref) => {
  
  const [fontDetails, setFontDetails] = useState<Record<string, string>>({});
  const [canvasRendered, setCanvasRendered] = useState(false);
  const tempDivRef = useRef<HTMLDivElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderAttempted, setRenderAttempted] = useState(renderOnMount);
  const [domRendered, setDomRendered] = useState(false); 
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderingTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const domContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Cache for loaded images to prevent reloading
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);
  
  // Define visiblePlaceholders at the top to avoid initialization errors
  const visiblePlaceholders = placeholders.filter(p => p.visible);
  
  // Memoize font families to prevent continuous reloading
  const fontFamilies = useMemo(() => 
    Array.from(new Set(
      visiblePlaceholders.map(p => p?.style?.fontFamily || 'Noto Sans Hebrew')
    )), 
    [visiblePlaceholders]
  );
  
  // Reset error state when template or refreshKey changes
  useEffect(() => {
    setRenderError(null);
    setRenderAttempted(false); 
    setCanvasRendered(false); 
  }, [template.id, refreshKey]);
  
  // Force render on mount if needed
  useEffect(() => {
    if (renderOnMount) {
      setRenderAttempted(true);

      // Only render if not already rendering
      if (!isRendering) {
        // Use a longer delay to ensure fonts are loaded
        const timer = setTimeout(() => {
          // Always use canvas rendering for consistency
          renderToCanvas();
        }, 500);
        
        return () => clearTimeout(timer);
      }
      
      return undefined;
    }
  }, [renderOnMount, refreshKey]);
    
  // Use the font loader hook to preload fonts
  const { isLoading: fontsLoading } = useFontLoader(fontFamilies);
  
  // Log font usage when a field is clicked
  const logFontUsage = async (placeholder: DatabasePlaceholder) => {
    try {
      const fontName = placeholder?.style?.fontFamily;
      await supabase.from('font_usage_logs').insert({
        template_id: template.id,
        placeholder_id: placeholder.id,
        font_name: fontName
      });
    } catch (error) {
    }
  };

  // Function to render the preview to canvas
  const renderToCanvas = useCallback(async () => {
    if (!tempDivRef.current) return;

    // If already rendering, don't start another render
    if (isRendering) return;
    
    // Reset error state
    setRenderError(null);
    setRenderAttempted(true); // Mark that we've attempted to render

    setIsRendering(true); 
    onRenderStatusChange?.(true);
    
    // Set a timeout to prevent hanging
    if (renderingTimeoutRef.current) {
      clearTimeout(renderingTimeoutRef.current);
    }
    
    renderingTimeoutRef.current = window.setTimeout(() => {
      setIsRendering(false);
      setRenderError('Rendering timed out. Please try again.'); 
      onRenderStatusChange?.(false);
      renderingTimeoutRef.current = null;
    }, 15000); // 15 second timeout

    try { 
      let renderScale = 1.5; // Default scale for better quality
       {
        switch (renderQuality) {
          case 'low':
            renderScale = 0.5;
            break;
          case 'medium':
            renderScale = 1.0;
            break;
          case 'high':
            renderScale = 1.5;
            break;
          default:
            renderScale = 1.0;
        }
      }
      
      // Use html2canvas to render the temp div to a canvas
      // Ensure the temp div has the correct background image
      if (tempDivRef.current) {
        tempDivRef.current.style.backgroundImage = `url(${template.background})`;
      }
      
      const canvas = await html2canvas(tempDivRef.current, {
        scale: renderScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: false,
        width: width,
        height: height,
        foreignObjectRendering: false,
        onclone: (document, element) => {
          // This helps with font rendering
          const allTextElements = element.querySelectorAll('div');
          allTextElements.forEach(el => {
            if (el.style.fontFamily) {
              el.style.fontSmoothing = 'antialiased';
              el.style.textRendering = 'geometricPrecision';
            }
          });
        }
      });
      
      // If we have a canvas ref from the parent, draw to it
      if (canvasRef.current) { 
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Clear the canvas first
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw the new canvas content
          ctx.drawImage(canvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      setCanvasRendered(true);
      
      // Mark that we've attempted rendering
      setRenderAttempted(true);
      setRenderError(null);
      
      // Delay setting isRendering to false to prevent rapid re-renders
      if (renderingTimeoutRef.current) {
        // Clear the timeout since we finished successfully
        clearTimeout(renderingTimeoutRef.current); 
        renderingTimeoutRef.current = null;
        renderingTimeoutRef.current = null;
      }
      
      renderingTimeoutRef.current = window.setTimeout(() => {
        setIsRendering(false);
        onRenderStatusChange?.(false);
        renderingTimeoutRef.current = null;
      }, 500);
      
    } catch (error) { 
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during rendering';
      setRenderError(errorMessage);
      setRenderAttempted(true);
      setCanvasRendered(false);
      if (onRenderError) {
        onRenderError(errorMessage);
      }
      setIsRendering(false);
      if (renderingTimeoutRef.current) {
        clearTimeout(renderingTimeoutRef.current);
        renderingTimeoutRef.current = null;
      }
      onRenderStatusChange?.(false);
    }
  }, [height, width, template.id, isRendering, onRenderStatusChange, onRenderError, renderQuality]);
  
  // Memoize the background image URL to prevent unnecessary re-renders
  const backgroundImageUrl = useMemo(() => template.background, [template.background]);

  // Function to render directly to DOM (faster but less accurate for export) 
  const renderToDom = () => {
    if (!domContainerRef.current) return; 
    setIsRendering(true); 
    onRenderStatusChange?.(true);
    
    try {
      // Clear previous content
      domContainerRef.current.innerHTML = '';
      
      // Apply background image as CSS property
      if (domContainerRef.current) {
        domContainerRef.current.style.backgroundImage = `url(${template.background})`;
        domContainerRef.current.style.backgroundSize = 'cover';
        domContainerRef.current.style.backgroundPosition = 'center';
        domContainerRef.current.style.backgroundRepeat = 'no-repeat';
      }
      
      // Add placeholders
      visiblePlaceholders.forEach(placeholder => {
        const userValue = data.values[placeholder.id];
        const value = userValue !== undefined && userValue !== ''
          ? userValue 
          : placeholder.default_value || placeholder.placeholder || 'Sample Text';
        
        const placeholderDiv = document.createElement('div');
        
      
        
        
        placeholderDiv.dataset.id = placeholder.id;
        
        // Apply all style properties
        placeholderDiv.style.position = 'absolute';
        placeholderDiv.style.left = `${placeholder?.style?.x || 50}%`;
        placeholderDiv.style.top = `${placeholder?.style?.y || 50}%`;
        placeholderDiv.style.transform = `translate(-50%, -50%) ${placeholder?.style?.rotation ? `rotate(${placeholder.style.rotation}deg)` : ''}`;
        placeholderDiv.style.width = `${placeholder?.style?.width || 30}%`;
        placeholderDiv.style.fontSize = `${placeholder?.style?.fontSize || 16}px`;
        placeholderDiv.style.fontFamily = placeholder?.style?.fontFamily || 'Noto Sans Hebrew';
        placeholderDiv.style.fontWeight = placeholder?.style?.fontWeight || 'normal';
        placeholderDiv.style.color = placeholder?.style?.color || '#000000';
        placeholderDiv.style.textAlign = placeholder?.style?.textAlign || 'center';
        placeholderDiv.style.lineHeight = `${placeholder?.style?.lineHeight || 1.4}`;
        placeholderDiv.style.letterSpacing = `${placeholder?.style?.letterSpacing || 0}px`;
        placeholderDiv.style.direction = placeholder.text_direction || 'rtl';
        placeholderDiv.style.zIndex = `${placeholder?.style?.zIndex || 1}`;
        placeholderDiv.style.whiteSpace = placeholder.field_type === 'textarea' ? 'pre-wrap' : 'normal';
        placeholderDiv.style.textRendering = 'geometricPrecision';
        
        // Set the content
        placeholderDiv.textContent = value;
        
        // Add data attributes for easier selection
        placeholderDiv.dataset.placeholderId = placeholder.id;
        placeholderDiv.dataset.placeholderLabel = placeholder.label;
        
        // Add click handler for edit mode
         {
          placeholderDiv.style.cursor = 'pointer';
          placeholderDiv.onclick = () => {
            if (onFieldSelect) {
              onFieldSelect(placeholder.id);
              logFontUsage(placeholder);
            }
          };
          
          // Highlight selected field
          if (selectedField === placeholder.id) {
            placeholderDiv.style.outline = '2px solid #9333ea';
            placeholderDiv.style.outlineOffset = '2px';
            placeholderDiv.style.background = 'rgba(147, 51, 234, 0.1)';
          }
        }
        
        domContainerRef.current.appendChild(placeholderDiv);
      });
      
      setDomRendered(true);
      setIsRendering(false);
      onRenderStatusChange?.(false);
    } catch (error) { 
      setIsRendering(false);
      onRenderStatusChange?.(false);
    }
  };

  // Load font details from database when component mounts
  useEffect(() => {
    const loadFontDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('fonts')
          .select('name, url');
        
        if (error) throw error;
        
        const fontMap: Record<string, string> = {};
        data?.forEach(font => {
          fontMap[font.name] = font.url;
        });
        
        setFontDetails(fontMap);
      } catch (error) {
        console.error('Error loading font details:', error);
      }
    };
    
    loadFontDetails();
  }, []);
  
  // Set up the canvas and temp div when component mounts
  useEffect(() => {
    // Create a canvas element if we don't have a ref from parent
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvasRef.current = canvas;
    }
    
    // Create a temporary div for rendering
    if (!tempDivRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${width}px`;
      tempDiv.style.height = `${height}px`;
      tempDiv.style.overflow = 'hidden';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.backgroundSize = 'cover';
      tempDiv.style.backgroundPosition = 'center';
      tempDiv.style.backgroundRepeat = 'no-repeat';
      tempDiv.style.backgroundImage = `url(${template.background})`;
      tempDiv.className = 'pdf-export-ready';
      document.body.appendChild(tempDiv);
      tempDivRef.current = tempDiv;
      console.log('Created temp div for rendering template:', template.id);
    }
    
    return () => {
      // Clean up the temp div when component unmounts
      if (tempDivRef.current && document.body.contains(tempDivRef.current)) {
        document.body.removeChild(tempDivRef.current);
      }
    };
  }, [width, height]);
  
  // Render whenever relevant props change
  useEffect(() => {
    if (!renderOnMount && refreshKey === 0 && !renderAttempted) {
      console.log('Skipping initial render for template:', template.id);
      return; // Skip rendering on initial mount if not requested
    }
    
    // Skip rendering if already in progress
    if (isRendering) {
      return;
    }
    
    // Debounce rendering to prevent too many rapid updates
    const debounceTime = 500; // Use longer debounce to prevent excessive renders

    // Prepare the temp div for rendering
    if (tempDivRef.current) {
      // Clear previous content
      while (tempDivRef.current.firstChild) {
        tempDivRef.current.removeChild(tempDivRef.current.firstChild);
      }
      
      // Add background image
      const backgroundImg = document.createElement('img');
      backgroundImg.src = template.background;
      backgroundImg.crossOrigin = 'anonymous';
      backgroundImg.className = 'background-image';
      backgroundImg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      `;
      backgroundImg.crossOrigin = 'anonymous';
      tempDivRef.current.appendChild(backgroundImg);
      
      // Add placeholders
      visiblePlaceholders.forEach(placeholder => {
        const userValue = data.values[placeholder.id];
        const value = userValue !== undefined && userValue !== '' 
          ? userValue 
          : placeholder.default_value || placeholder.placeholder || 'Sample Text';
        
        const placeholderDiv = document.createElement('div');
        
        // Apply all style properties
        placeholderDiv.style.cssText = `
          position: absolute;
          left: ${placeholder?.style?.x || 50}%;
          top: ${placeholder?.style?.y || 50}%;
          transform: translate(-50%, -50%) ${placeholder?.style?.rotation ? `rotate(${placeholder.style.rotation}deg)` : ''};
          width: ${placeholder?.style?.width || 30}%;
          font-size: ${placeholder?.style?.fontSize || 16}px;
          font-family: ${placeholder?.style?.fontFamily || 'Noto Sans Hebrew'};
          font-weight: ${placeholder?.style?.fontWeight || 'normal'};
          color: ${placeholder?.style?.color || '#000000'};
          text-align: ${placeholder?.style?.textAlign || 'center'};
          line-height: ${placeholder?.style?.lineHeight || 1.4};
          letter-spacing: ${placeholder?.style?.letterSpacing || 0}px;
          direction: ${placeholder.text_direction || 'rtl'};
          z-index: ${placeholder?.style?.zIndex || 1};
          white-space: ${placeholder.field_type === 'textarea' ? 'pre-wrap' : 'normal'};
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          ${selectedField === placeholder.id ? 'background-color: rgba(0,0,0,0,); border-radius: 4px; padding: 2px;' : ''}
        `;
        
        // Set the content
        placeholderDiv.textContent = value;
        
        // Add class for selected field highlighting
        if (selectedField === placeholder.id) {
          placeholderDiv.classList.add('field-text-selected');
        }
        
        // Add data attributes for debugging
        placeholderDiv.dataset.id = placeholder.id;
        placeholderDiv.dataset.label = placeholder.label;
        placeholderDiv.dataset.selected = selectedField === placeholder.id ? 'true' : 'false';
        
        tempDivRef.current.appendChild(placeholderDiv);
      });
      
      // Trigger the appropriate rendering method
      const renderTimer = setTimeout(() => {
        if (!isRendering) {
          console.log('Executing debounced render for template:', template.id, 'refreshKey:', refreshKey);
          setRenderAttempted(true);
          renderToCanvas();
        }
      }, debounceTime);
      
      return () => clearTimeout(renderTimer);
    }
  }, [template, placeholders, data, selectedField, editMode, refreshKey, renderOnMount]); 
  
  // Set up the canvas and temp div when component mounts
  useEffect(() => {
    // Create a canvas element if we don't have a ref from parent
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.className = 'pdf-render-canvas';
      canvasRef.current = canvas;
    }

    // Create a temporary div for rendering if it doesn't exist
    if (!tempDivRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        background-color: white;
      `;
      tempDiv.className = 'pdf-export-ready rtl';
      document.body.appendChild(tempDiv);
      tempDivRef.current = tempDiv;
    }

    // Clean up any pending rendering timeouts when component unmounts
    return () => {
      if (renderingTimeoutRef.current) {
        clearTimeout(renderingTimeoutRef.current);
      }
    };
  }, [width, height, renderOnMount, template.id]);
    
  // Apply background image directly as CSS property
  useEffect(() => {
    if (tempDivRef.current) {
      if (tempDivRef.current.style.backgroundImage !== `url(${template.background})`) {
        tempDivRef.current.style.backgroundImage = `url(${template.background})`;
        tempDivRef.current.style.backgroundSize = 'cover';
        tempDivRef.current.style.backgroundPosition = 'center';
        tempDivRef.current.style.backgroundRepeat = 'no-repeat';
      }
    }
  }, [template.background, tempDivRef.current]);
  
  return (
    <div 
      ref={containerRef} 
      className="relative bg-white rounded-lg shadow-2xl overflow-hidden mx-auto pdf-export-ready invitation-preview-container" 
      style={{
        width: `${width}px`, 
        height: `${height}px`,
        transform: `scale(${scale || 1})`,
        transformOrigin: 'top center',
        margin: '0 auto 80px auto',
        maxWidth: '100%',
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* DOM rendering container */}
      {/* Removed DOM rendering container since we're always using canvas */}
      {false && ( 
        <div
          ref={domContainerRef}
          className="dom-preview-container"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: domRendered ? 'block' : 'none'
          }}
        />
      )}
      
      {/* Canvas rendering container */} 
      {/* Always show canvas container */}
      {true && ( 
        <canvas
          ref={canvasRef} 
          className="pdf-render-canvas"
          width={width}
          height={height}
          style={{ 
            width: '100%', 
            height: '100%',
            display: canvasRendered ? 'block' : 'none'
          }}
        />
      )}
      
      {/* Edit Mode Overlay */}
      {editMode && (renderMode === 'canvas' ? canvasRendered : domRendered) && (
        <>
          <div className="absolute inset-0 pointer-events-none z-50 select-none">
            <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg flex flex-col">
              <span className="font-medium">Edit Mode - {visiblePlaceholders.length} fields</span>
              <span className="text-[10px] opacity-80">Rendered at: {new Date().toLocaleTimeString()}</span>
              {fontsLoading && <span className="text-[10px] opacity-80">Loading fonts...</span>}
              {selectedField && <span className="text-[10px] text-purple-200">Selected: {visiblePlaceholders.find(p => p.id === selectedField)?.label || selectedField}</span>}
            </div>
          </div> 

          {/* Clickable overlay for field selection */}
          <div className="absolute inset-0 rtl" style={{ zIndex: 10, pointerEvents: 'all' }}>
            {visiblePlaceholders.map(placeholder => {
              const isSelected = selectedField === placeholder.id;
              return (
                <div
                  key={`${placeholder.id}-${refreshKey}-overlay`}
                  style={{
                    position: 'absolute',
                    left: `${placeholder.style?.x || 50}%`,
                    top: `${placeholder.style?.y || 50}%`,
                    width: `${placeholder.style?.width || 30}%`,
                    height: `${placeholder.style?.height || 10}%`,
                    transform: `translate(-50%, -50%) ${placeholder.style?.rotation ? `rotate(${placeholder.style.rotation}deg)` : ''}`,
                    cursor: 'pointer',
                    zIndex: 20
                  }}
                  className={`field-selectable ${isSelected ? 'field-selected shadow-glow' : ''}`}
                  onClick={() => {
                    if (onFieldSelect) {
                      onFieldSelect(placeholder.id);
                      logFontUsage(placeholder);
                    }
                  }}
                  onMouseEnter={() => onFieldHover && onFieldHover(placeholder.id)}
                  onMouseLeave={() => onFieldHover && onFieldHover(null)}
                >
                  {isSelected && (
                    <div className="absolute -top-8 left-0 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-30 shadow-lg">
                      <div className="font-medium">{placeholder.label}</div>
                      <div className="text-[10px] opacity-90">Font: {placeholder?.style?.fontFamily || 'Default'}</div>
                      <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-purple-600 transform rotate-45 -translate-x-1/2 translate-y-1/2"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Loading indicator */}
      {!canvasRendered ? ( 
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"> 
          <div className="text-gray-700 flex flex-col items-center gap-3 z-50 bg-white/90 p-6 rounded-xl shadow-lg">
            {renderError ? (
              <>
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="text-lg font-medium text-red-500">Rendering Error</div>
                <div className="text-sm text-gray-700 max-w-md text-center">{renderError}</div>
                <button 
                  onClick={() => {
                    setRenderError(null);
                    setTimeout(() => renderToCanvas(), 100);
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-2"></div>
                <div className="text-lg font-medium">Loading preview...</div>
                { <div className="text-sm text-gray-500">Loading fonts...</div>}
              </>
            )}
          </div>
        </div>
      ) : null}
      
   
      
      {/* Render button for manual rendering - shown when canvas is not yet rendered */}
      {!canvasRendered && !isRendering && !renderAttempted && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="text-gray-500 mb-2">Click to load preview</div>
            <button
              onClick={renderToCanvas}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Show Preview
            </button>
          </div>
        </div>
      )}
      
      {/* Show error state if rendering was attempted but failed */}
      {renderError && !canvasRendered && !isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 bg-white/90 rounded-xl shadow-lg"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div className="text-lg font-medium text-red-500">Rendering Error</div>
            <div className="text-sm text-gray-700">{renderError}</div>
            <button
              onClick={() => {
                setRenderError(null);
                setRenderAttempted(true);
                setTimeout(() => renderToCanvas(), 100);
              }}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )} 
    </div>
  );
});

// Set display name for debugging
InvitationPreview.displayName = 'InvitationPreview';
export default InvitationPreview;