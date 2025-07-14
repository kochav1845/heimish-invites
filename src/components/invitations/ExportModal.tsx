import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileImage, FileText, Settings, Loader2, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';
import { InvitationTemplate, InvitationData } from '../../types/invitation';
import PaymentModal from './PaymentModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Font {
  id: string;
  name: string;
  url: string;
  type: 'ttf' | 'otf' | 'woff' | 'woff2';
  is_hebrew: boolean;
}

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

interface ExportModalProps {
  template: InvitationTemplate;
  placeholders?: DatabasePlaceholder[];
  data: InvitationData;
  previewRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onRenderError?: (error: string) => void;
}

// Cache for loaded fonts to avoid re-downloading
const fontCache = new Map<string, string>();

const ExportModal: React.FC<ExportModalProps> = ({
  template,
  placeholders = [],
  data,
  previewRef,
  onClose,
  onRenderError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpeg'>('pdf');
  const [exportQuality, setExportQuality] = useState(1);
  const [exportProgress, setExportProgress] = useState(0); 
  const [isExportReady, setIsExportReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [fonts, setFonts] = useState<Font[]>([]); 
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const exportTimeoutRef = useRef<number | null>(null);

  // Load available fonts from database
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const { data, error } = await supabase
          .from('fonts')
          .order('name');
        
        if (error) throw error;
        setFonts(data || []);
        
        // Preload the most common fonts
        const fontFamilies = new Set<string>();
        placeholders.forEach(placeholder => {
          if (placeholder.style?.fontFamily) {
            fontFamilies.add(placeholder.style.fontFamily);
          }
        });
        
        console.log('Preloading fonts for export:', Array.from(fontFamilies));
        
        // Start preloading the fonts
        const preloadPromises = Array.from(fontFamilies).map(fontFamily => {
          const font = data?.find(f => f.name === fontFamily);
          if (font) {
            console.log(`Preloading font: ${fontFamily} from ${font.url}`);
            return loadFont(font.name, font.url).catch(error => {
              console.warn(`Failed to preload font ${fontFamily}:`, error);
              return '';
            });
          }
          console.warn(`Font ${fontFamily} not found in database, will use system fallback`);
          return Promise.resolve();
        });
        
        await Promise.allSettled(preloadPromises);
        setFontsLoaded(true);
        console.log('All fonts loaded for export');
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };
    
    loadFonts();
  }, [placeholders]);

  // Calculate preview dimensions when modal opens
  useEffect(() => {
    if (previewRef.current) {
      const aspectRatio = 3/4; // Standard invitation aspect ratio
      const maxWidth = Math.min(window.innerWidth * 0.8, 400); // Limit width
      const width = maxWidth;
      const height = width / aspectRatio;
      
      setPreviewSize({ width, height });
    }
  }, [previewRef]);

  // Force canvas rendering for export
  useEffect(() => {
    if (previewRef.current) {
      const previewComponent = previewRef.current.querySelector('canvas.pdf-render-canvas');
      if (!previewComponent) {
        console.log('Canvas element not found, forcing canvas rendering');
        // Force a refresh to ensure canvas is rendered
        setRefreshKey(prev => prev + 1);
      }
    }
  }, [previewRef.current]);

  // Load a font and return it as base64
  const checkPaymentStatus = async () => {
    try {
      // Check if the user has an active subscription or has purchased exports
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .eq('order_status', 'completed')
        .limit(1);
      
      if (error) throw error;
      
      // If they have a completed order, allow export without payment
      if (data && data.length > 0) {
        return true;
      }
      
      // Otherwise, require payment
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Default to requiring payment if there's an error
      return false;
    }
  };

  const loadFont = async (fontName: string, fontUrl: string): Promise<string> => {
    if (fontCache.has(fontName)) {
      console.log(`Using cached font: ${fontName}`);
      return fontCache.get(fontName)!;
    }

    try {
      console.log(`Fetching font: ${fontName} from ${fontUrl}`);
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Failed to load font: ${fontName} - HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          fontCache.set(fontName, base64data);
          resolve(base64data);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return '';
    }
  };

  // Get font URL from our database
  const getFontUrl = (fontFamily: string): string | null => {
    const font = fonts.find(f => f.name === fontFamily);
    if (font) {
      console.log(`Found font URL for ${fontFamily}: ${font.url}`);
      return font.url;
    }
    
    const forceRender = () => {
      const event = new CustomEvent('force-canvas-render');
      document.dispatchEvent(event);
    };
    
    // Only force render if we don't already have a canvas
    if (!previewRef.current?.querySelector('canvas.pdf-render-canvas')) {
      console.log('Canvas not found in ExportModal, forcing render');
      forceRender();
    } else {
      console.log('Canvas already exists in ExportModal, no need to force render');
    }
    
    // Clean up any pending timeouts
    return () => {
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  };

  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    setShowPaymentModal(false);
    
    // Proceed with export after payment
    processExport();
  };

  const initiateExport = async () => {
    // First check if the user has already paid
    const hasPaid = await checkPaymentStatus();
    
    if (hasPaid || paymentComplete) {
      processExport();
    } else {
      // Show payment modal
      setShowPaymentModal(true);
    }
  };
  
  const processExport = async () => {
    if (!previewRef.current) {
      setError('Preview element not found');
      return;
    }

    setIsExporting(true);
    setExportProgress(10);
    setError(null);

    // Clear any existing timeout
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current);
      exportTimeoutRef.current = null;
    }
    
    // Make sure we have a valid preview reference
    if (!previewRef.current) {
      setError('לא נמצא אלמנט תצוגה מקדימה. אנא נסה שוב.');
      setIsExporting(false);
      return;
    }

    try {
      // Force a render before export
      setExportProgress(20);
      
      setExportProgress(40);
      
      // Get the canvas from the preview ref - ensure we're using canvas mode
      let canvas = previewRef.current.querySelector('canvas.pdf-render-canvas');
      
      if (!canvas) {
        console.error('Canvas element not found in ExportModal');
        
        throw new Error('לא נמצא אלמנט קנבס. אנא רענן את התצוגה המקדימה ונסה שוב.');
      }
      
      // Clear the timeout since we found the canvas
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
        exportTimeoutRef.current = null;
      }
      
      setExportProgress(80);
      
      if (exportFormat === 'pdf') {
        // Create PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95); // High quality but slightly compressed
        const pdf = new jsPDF({ 
          orientation: 'portrait', 
          unit: 'mm',
          format: 'a4'
        }); 
        
        // Add the image to fill the entire A4 page
        pdf.addImage({
          imageData: imgData,
          format: 'JPEG',
          x: 0,
          y: 0,
          width: 210, // Full A4 width
          height: 297, // Full A4 height
          compression: 'FAST' // Faster compression for better performance
        }); 

        pdf.save(`${template.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      } else {
        // Export as image
        const imgData = canvas.toDataURL(`image/${exportFormat}`, exportQuality);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${template.title.replace(/\s+/g, '-').toLowerCase()}.${exportFormat}`;
        link.click();
      }

      setExportProgress(100);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Try refreshing the preview and try again.`;
      setError(errorMessage);
      if (onRenderError) {
        onRenderError(errorMessage);
      }
    } finally {
      setIsExporting(false);
      // Clear any remaining timeout
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
        exportTimeoutRef.current = null;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Export Invitation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  exportFormat === 'pdf'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <FileText size={24} className="mb-2" />
                <span className="text-sm">PDF</span>
              </button>
              <button
                onClick={() => setExportFormat('png')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  exportFormat === 'png'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <FileImage size={24} className="mb-2" />
                <span className="text-sm">PNG</span>
              </button>
              <button
                onClick={() => setExportFormat('jpeg')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  exportFormat === 'jpeg'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <FileImage size={24} className="mb-2" />
                <span className="text-sm">JPEG</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-300">
                <FileText size={16} className="text-purple-400" />
                <span className="text-sm font-medium">תצוגה מקדימה</span>
              </div>
              <span className="text-xs text-gray-400">
                {exportFormat === 'pdf' ? 'A4 לאורך' : 'גודל מקורי'}
              </span>
            </div>
            
            <div className="flex justify-center">
              <div 
                className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-600"
                style={{ width: '210mm', height: '297mm', transform: 'scale(0.25)', transformOrigin: 'top center', margin: '-80px 0' }}
              >
                <img 
                  src={template.background} 
                  alt="Template preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs text-center text-gray-800 bg-white/70 px-2 py-1 rounded">
                    {placeholders.length} fields will be exported
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(exportFormat === 'png' || exportFormat === 'jpeg') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                איכות: {Math.round(exportQuality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportQuality}
                onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Settings size={16} />
              <span className="text-sm font-medium">הגדרות ייצוא</span>
              <span className="text-xs text-purple-400 ml-2">(html2canvas)</span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1 mt-2">
              <li>• פורמט: {exportFormat.toUpperCase()}</li>
              {(exportFormat === 'png' || exportFormat === 'jpeg') && (
                <li>• איכות: {Math.round(exportQuality * 100)}%</li>
              )}
              <li>• גודל: A4 לאורך מלא (210×297 מ"מ)</li>
              <li>• תוכן: כל השדות הגלויים</li>
              <li>• רזולוציה: איכות גבוהה</li>
              <li>• ללא שוליים (כיסוי דף מלא)</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {isExporting && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400">
                {exportProgress < 100 ? 'מייצא...' : 'הייצוא הושלם!'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors" 
            >
              ביטול
            </button>
            <button
              onClick={initiateExport}
              disabled={isExporting || !fontsLoaded}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors relative"
            >
              {isExporting ? (
                <> 
                  <Loader2 size={16} className="animate-spin" />
                  <span>מייצא...</span>
                </>
              ) : paymentComplete ? (
                <>
                  <Download size={16} />
                  <span>ייצוא</span>
                </>
              ) : !fontsLoaded ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>טוען גופנים...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>תשלום וייצוא</span>
                  <span className="text-xs absolute right-2 top-1 bg-yellow-500 text-black px-1 rounded-sm">$22</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onPaymentComplete={handlePaymentComplete}
            templateId={template.id}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExportModal;