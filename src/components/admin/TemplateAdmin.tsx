import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, Type, Palette, Move, RotateCcw, RefreshCw, Info, Copy, Check, FileText, AlertCircle, Download, Image, FolderIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import InvitationPreview from '../invitations/InvitationPreview';
import html2canvas from 'html2canvas';
import { categoryLabels } from '../../data/templates';

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

interface Font {
  id: string;
  name: string;
  url: string;
  type: string;
  is_hebrew: boolean;
  is_system: boolean;
}

interface TemplateAdminProps {
  templateId: string;
  templateBackground: string;
  onBack: () => void;
}

// Field types
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Multi-line Text' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' }
];

const TEXT_DIRECTIONS = [
  { value: 'rtl', label: 'Right to Left (Hebrew)' },
  { value: 'ltr', label: 'Left to Right (English)' }
];

const TemplateAdmin: React.FC<TemplateAdminProps> = ({
  templateId,
  templateBackground,
  onBack
}) => {
  const [placeholders, setPlaceholders] = useState<DatabasePlaceholder[]>([]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);
  const [availableFonts, setAvailableFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [autoRender, setAutoRender] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [renderMode, setRenderMode] = useState<'dom' | 'canvas'>('dom');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [fontStyleElements, setFontStyleElements] = useState<HTMLStyleElement[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const fontSelectRef = useRef<HTMLSelectElement>(null);
  const selectedField = placeholders.find(p => p.id === selectedPlaceholder);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [newTemplateId, setNewTemplateId] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [copyError, setCopyError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load placeholders and fonts when component mounts
  useEffect(() => {
    loadPlaceholders();
    loadFonts();
  }, [templateId]);

  // Dynamically load fonts when availableFonts changes
  useEffect(() => {
    if (availableFonts.length === 0) return;
    
    console.log('Loading fonts dynamically for TemplateAdmin preview');
    
    // Remove any previously created style elements
    fontStyleElements.forEach(element => {
      if (document.head.contains(element)) {
        document.head.removeChild(element);
      }
    });
    
    const newFontStyleElements: HTMLStyleElement[] = [];
    
    // Create style elements for each font
    availableFonts.forEach(font => {
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.url}') format('${font.type === 'ttf' ? 'truetype' : 
                                          font.type === 'otf' ? 'opentype' : 
                                          font.type}');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
      newFontStyleElements.push(style);
    });
    
    setFontStyleElements(newFontStyleElements);
    
    // Force refresh after fonts are loaded
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      console.log('Refreshed preview after loading fonts');
    }, 300);
    
    // Cleanup function to remove style elements when component unmounts
    return () => {
      newFontStyleElements.forEach(element => {
        if (document.head.contains(element)) {
          document.head.removeChild(element);
        }
      });
    };
  }, [availableFonts]);

  // Update font select value when selected placeholder changes
  useEffect(() => {
    if (selectedField && fontSelectRef.current) {
      fontSelectRef.current.value = selectedField.style.fontFamily;
    }
  }, [selectedPlaceholder, selectedField]);

  const loadFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('fonts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setAvailableFonts(data || []);
    } catch (error) {
      console.error('Error loading fonts:', error);
      setAvailableFonts([]);
    }
  };

  const loadPlaceholders = async () => {
    setLoading(true);
    try {
      // Get template info including category
      try {
        const templateInfo = await supabase.rpc('get_template_info', { 
          template_id: templateId 
        });
        
        if (templateInfo.data && templateInfo.data.length > 0) {
          setCurrentCategory(templateInfo.data[0].category || 'general');
        } else {
          // Default to general if no data found
          setCurrentCategory('general');
        }
      } catch (error) {
        console.warn('Error fetching template category:', error);
        setCurrentCategory('general');
      }
      
      // Load placeholders
      try {
        const { data, error } = await supabase
          .from('placeholders')
          .select('*')
          .eq('template_id', templateId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        
        setPlaceholders(data || []);
      } catch (error) {
        console.error('Error loading placeholders:', error);
        setPlaceholders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewPlaceholder = async () => {
    const newPlaceholder = {
      template_id: templateId,
      label: 'New Field',
      description: '',
      field_type: 'text',
      default_value: 'Sample Text',
      placeholder: 'Enter text...',
      required: false,
      visible: true,
      text_direction: 'rtl',
      style: {
        x: 50,
        y: 50,
        width: 30,
        height: 10,
        fontSize: 16,
        fontFamily: 'LiaYeffet-Regular',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.4,
        letterSpacing: 0,
        wordSpacing: 0,
        textTransform: 'none',
        textDecoration: 'none',
        textShadow: 'none',
        rotation: 0,
        visible: true,
        opacity: 1,
        zIndex: 1,
        overflow: 'visible',
        whiteSpace: 'normal',
        textRendering: 'geometricPrecision'
      }
    };

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('placeholders')
        .insert([newPlaceholder])
        .select()
        .single();

      if (error) throw error;
      
      setPlaceholders(prev => [...prev, data]);
      setSelectedPlaceholder(data.id);
    } catch (error) {
      console.error('Error creating placeholder:', error);
      alert('Failed to create new field');
    } finally {
      setSaving(false);
    }
  };

  const updatePlaceholder = async (id: string, updates: Partial<DatabasePlaceholder>) => {
    try {
      setSaving(true);
      setPendingChanges(true);
      
      const { error } = await supabase
        .from('placeholders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setPlaceholders(prev => 
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      
      // Force refresh preview
      if (autoRender) {
        setTimeout(() => setRefreshKey(prev => prev + 1), 50);
        setPendingChanges(false);
      }
    } catch (error) {
      console.error('Error updating placeholder:', error);
      alert('Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  const handleRenderPreview = () => {
    setRefreshKey(prev => prev + 1);
    setPendingChanges(false);
  };

  const deletePlaceholder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('placeholders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPlaceholders(prev => prev.filter(p => p.id !== id));
      if (selectedPlaceholder === id) {
        setSelectedPlaceholder(null);
      }
    } catch (error) {
      console.error('Error deleting placeholder:', error);
      alert('Failed to delete field');
    } finally {
      setSaving(false);
    }
  };

  const handleFontChange = (id: string, fontFamily: string) => {
    console.log(`Changing font for placeholder ${id} to ${fontFamily}`);
    updatePlaceholder(id, {
      style: {
        ...selectedField!.style,
        fontFamily
      }
    });
    
    // Log font usage
    try {
      supabase.from('font_usage_logs').insert({
        template_id: templateId,
        placeholder_id: id,
        font_name: fontFamily
      });
    } catch (error) {
      console.error('Error logging font usage:', error);
    }
  };

  const handleCopyField = (placeholder: DatabasePlaceholder) => {
    navigator.clipboard.writeText(placeholder.default_value || '');
    setCopiedField(placeholder.id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const checkFontDetails = (fontFamily: string) => {
    try {
      const font = availableFonts.find(f => f.name === fontFamily);
      if (font) {
        console.log('Font details:', font);
        alert(`Font details:\nName: ${font.name}\nURL: ${font.url}\nType: ${font.type}\nHebrew: ${font.is_hebrew ? 'Yes' : 'No'}`);
      } else {
        console.log('Font not found in database:', fontFamily);
        alert(`Font "${fontFamily}" not found in the database.`);
      }
    } catch (error) {
      console.error('Error checking font details:', error);
    }
  };

  const resetToDefaults = () => {
    if (!confirm('Reset all fields to default positions and styles?')) return;
    
    const defaultFields = [
      {
        label: 'כותרת ראשית',
        field_type: 'text',
        default_value: 'הזמנה',
        style: { x: 50, y: 15, fontSize: 32, fontFamily: 'Noto Sans Hebrew', color: '#2c3e50' }
      },
      {
        label: 'סוג האירוע',
        field_type: 'text',
        default_value: 'לבר מצווה',
        style: { x: 50, y: 25, fontSize: 24, fontFamily: 'Noto Sans Hebrew', color: '#8b4513' }
      },
      {
        label: 'שם הילד',
        field_type: 'text',
        default_value: 'יעקב בן אברהם',
        style: { x: 50, y: 35, fontSize: 26, fontFamily: 'Noto Sans Hebrew', color: '#d4af37' }
      }
    ];

    // Implementation would reset fields to defaults
    console.log('Reset to defaults requested');
  };

  const handleDeleteTemplate = async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      
      // Delete all placeholders for this template
      const { error: deleteError } = await supabase
        .from('placeholders')
        .delete()
        .eq('template_id', templateId);

      if (deleteError) throw deleteError;
      
      setShowDeleteConfirm(false);
      onBack(); // Go back to template gallery
      
      // Show success message
      alert(`Template ${templateId} has been deleted successfully`);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = async () => {
    if (!templateId || !newTemplateId) {
      setCopyError('Please enter a valid template ID');
      return;
    }
    
    // Validate new template ID format
    const templateIdRegex = /^[A-Z0-9-]+$/;
    if (!templateIdRegex.test(newTemplateId)) {
      setCopyError('Template ID must contain only uppercase letters, numbers, and hyphens');
      return;
    }
    
    try {
      setLoading(true);
      setCopyError(null);
      
      // Check if template with this ID already exists
      const { data: existingTemplate, error: checkError } = await supabase
        .from('placeholders')
        .select('id')
        .eq('template_id', newTemplateId)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (existingTemplate && existingTemplate.length > 0) {
        setCopyError(`Template with ID ${newTemplateId} already exists`);
        return;
      }
      
      // Get all placeholders for the current template
      const { data: placeholdersData, error: fetchError } = await supabase
        .from('placeholders')
        .select('*')
        .eq('template_id', templateId);
        
      if (fetchError) throw fetchError;
      
      if (!placeholdersData || placeholdersData.length === 0) {
        setCopyError('No placeholders found to copy');
        return;
      }
      
      // Create new placeholders with the new template ID
      const newPlaceholders = placeholdersData.map(placeholder => {
        const { id, created_at, updated_at, ...rest } = placeholder;
        return {
          ...rest,
          template_id: newTemplateId
        };
      });
      
      // Insert the new placeholders
      const { error: insertError } = await supabase
        .from('placeholders')
        .insert(newPlaceholders);
        
      if (insertError) throw insertError;
      
      setShowCopyModal(false);
      setNewTemplateId('');
      
      // Show success message
      alert(`Template copied successfully to ${newTemplateId}`);
    } catch (error) {
      console.error('Error copying template:', error);
      setCopyError('Failed to copy template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateCategory = async (category: string) => {
    try {
      setSaving(true);
      
      // Update template category in database
      // Note: In a real implementation, you would have a templates table
      // Here we're using a custom RPC function for demo purposes
      const { error } = await supabase.rpc('update_template_category', {
        template_id: templateId,
        new_category: category
      });
      
      if (error) {
        console.error('Error updating template category:', error);
        alert(`Failed to update category: ${error.message}`);
      } else {
        setCurrentCategory(category);
        alert('Template category updated successfully');
      }
    } catch (error) {
      console.error('Error updating template category:', error);
      alert('Failed to update template category');
    } finally {
      setSaving(false);
    }
  };

  const downloadAsJpg = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Find the canvas element inside the preview container
      const previewCanvas = previewRef.current.querySelector('canvas.pdf-render-canvas');
      
      if (!previewCanvas) {
        // If canvas not found, render the preview div to canvas
        const canvas = await html2canvas(previewRef.current, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white',
          logging: false,
        });
        
        // Convert canvas to jpg
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        
        // Create download link
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `template-${templateId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // If canvas already exists, use it directly
        const imgData = previewCanvas.toDataURL('image/jpeg', 0.92);
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `template-${templateId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading template as JPG:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading template configuration...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Panel - Field List & Controls */}
      <div className="w-1/5 bg-gray-800 border-r border-gray-700 overflow-y-auto h-screen">
        <div className="p-4">
          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCopyModal(true)}
              disabled={saving || isRendering} 
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50" 
            >
              <Copy size={16} />
              <span>Copy Template</span>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || isRendering}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Delete Template</span>
            </button>
            
            <button
              onClick={createNewPlaceholder}
              disabled={saving || isRendering}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              <span>Add Field</span>
            </button>
            <button
              onClick={handleRenderPreview}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              disabled={isRendering}
            >
              <RefreshCw size={16} className={isRendering ? 'animate-spin' : ''} />
              <span>{pendingChanges ? 'Render Changes' : 'Refresh'}</span>
            </button>
            
            <button
              onClick={() => setRenderMode(prev => prev === 'dom' ? 'canvas' : 'dom')}
              className={`flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50`}
              disabled={isRendering}
            >
              <span>{renderMode === 'dom' ? 'DOM Rendering' : 'Canvas Rendering'}</span>
            </button>
            
            {/* Other buttons... */}
            <button
              onClick={downloadAsJpg}
              disabled={isRendering || isDownloading}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Image size={16} />
                  <span>Save as JPG</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setAutoRender(!autoRender)}
              className={`flex items-center gap-2 px-3 py-2 ${
                autoRender ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              } text-white rounded-lg text-sm transition-colors`}
              disabled={saving || isRendering}
            >
              {autoRender ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{autoRender ? 'Auto Render' : 'Manual Render'}</span>
            </button>
            <button
              onClick={() => setPreviewMode(prev => prev === 'edit' ? 'preview' : 'edit')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              disabled={saving || isRendering}
            >
              {previewMode === 'edit' ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{previewMode === 'edit' ? 'Preview' : 'Edit'}</span>
            </button>
          </div>

          {/* Field List */}
          <div className="space-y-2 pb-4">
            <h3 className="text-white font-medium mb-4">Fields ({placeholders.length})</h3>
            {placeholders.map((placeholder) => (
              <div
                key={placeholder.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlaceholder === placeholder.id ? 'border-purple-500 bg-purple-500/10 shadow-glow'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                } field-selectable`}
                onClick={() => setSelectedPlaceholder(placeholder.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type size={16} className="text-purple-400" />
                    <span className="text-white font-medium">{placeholder.label}</span>
                    {placeholder.required && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        handleCopyField(placeholder);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-white"
                      title="Copy text"
                    >
                      {copiedField === placeholder.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        updatePlaceholder(placeholder.id, { visible: !placeholder.visible });
                      }}
                      className={`p-1 rounded ${placeholder.visible ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      {placeholder.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        deletePlaceholder(placeholder.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  <div className="flex justify-between items-center mt-1">
                    <span>y: {placeholder.style.y} • {placeholder.style.fontSize}px</span>
                    <span style={{ 
                      fontFamily: placeholder.style.fontFamily || 'Noto Sans Hebrew', 
                      direction: 'rtl', 
                      display: 'inline-block',
                      padding: '3px 6px',
                      backgroundColor: selectedPlaceholder === placeholder.id ? 'rgba(147, 51, 234, 0.2)' : 'transparent',
                      borderRadius: '3px',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      border: selectedPlaceholder === placeholder.id ? '1px solid rgba(147, 51, 234, 0.5)' : 'none'
                    }}>
                      {placeholder.style.fontFamily}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-700/70 p-2 rounded-md mt-1 text-sm text-white">
                  <div className="text-xs text-gray-400 mb-1">Value:</div>
                  <div className="truncate" dir={placeholder.text_direction || 'rtl'} style={{
                    fontFamily: placeholder.style?.fontFamily || 'Noto Sans Hebrew',
                    maxHeight: '32px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    direction: placeholder.text_direction || 'rtl'
                  }}>
                    {placeholder.default_value || 'Empty'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Position: {placeholder.style.x}%, {placeholder.style.y}%
                  </div>
                </div>
                {selectedPlaceholder === placeholder.id && (
                  <div className="text-xs text-purple-400 mt-1">
                    ✓ Currently selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - Preview */}
      <div className="w-3/5 bg-gray-900 relative flex flex-col">
        <div className="flex-1 overflow-auto pt-4">
          <div className="pdf-preview-container">
            <InvitationPreview
              ref={previewRef}
              key={`preview-${refreshKey}`}
              template={{
                id: templateId,
                title: 'Template Preview',
                category: 'general' as any,
                background: templateBackground,
                thumbnail: templateBackground,
                rtl: true,
                premium: false,
                defaultValues: {},
                fields: []
              }}
              renderOnMount={autoRender}
              renderMode={renderMode}
              placeholders={placeholders.filter(p => p.visible)}
              data={{ 
                templateId: templateId,
                values: placeholders.reduce((acc, p) => {
                  // Create a map of placeholder IDs to their default values
                  acc[p.id] = p.default_value || '';
                  return acc;
                }, {} as Record<string, string>)
              }}
              onFieldSelect={(id) => {
                setSelectedPlaceholder(id);
                console.log('clicked', id);
              }}
              refreshKey={refreshKey}
              scale={0.7}
              onRenderStatusChange={setIsRendering}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Field Editor */}
      <div className="w-1/5 bg-gray-800 border-l border-gray-700 overflow-y-auto h-screen">
        <div className="p-4 pt-0">
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 pt-4 pb-2 mb-4 z-10">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Template Configuration</h2>
              <p className="text-gray-400 text-sm">Template: {templateId}</p>
              
              {/* Category selector */}
              <div className="ml-4 flex items-center">
                <div className="text-sm text-gray-400 mr-2">Category:</div>
                <select
                  value={currentCategory}
                  onChange={(e) => updateTemplateCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    key !== 'all' && (
                      <option key={key} value={key}>{label}</option>
                    )
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-400 text-sm">✓ {placeholders.length} fields configured</span>
            </div>
          </div>
          
          {selectedField ? (
            <div className="space-y-4 pb-4">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Field</h3>
              
              {/* Basic Properties */}
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-white">Content</h4>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updatePlaceholder(selectedField.id, { label: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              
              {/* Position Controls */}
              <div className="space-y-3 mt-6">
                <h4 className="text-lg font-medium text-white">Position & Size</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">X Position (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={selectedField.style.x}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, x: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Y Position (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedField.style.y}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, y: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Width (%)</label>
                    <input 
                      type="number"
                      min="5"
                      max="100"
                      value={selectedField.style.width || 30}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, width: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Height (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={selectedField.style.height || 10}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, height: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                
                {/* Rotation Control */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Rotation (degrees)</label>
                  <input 
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={selectedField.style.rotation !== undefined ? selectedField.style.rotation : 0}
                    onChange={(e) => updatePlaceholder(selectedField.id, {
                      style: { 
                        ...selectedField.style, 
                        rotation: parseInt(e.target.value),
                        transform: `translate(-50%, -50%) rotate(${parseInt(e.target.value)}deg)` 
                      }
                    })}
                    className="w-full bg-gray-700 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-white mt-1">{selectedField.style.rotation !== undefined ? selectedField.style.rotation : 0}°</div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3 mt-6">
                <h4 className="text-lg font-medium text-white">Typography</h4>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Field Type</label>
                  <select
                    value={selectedField.field_type}
                    onChange={(e) => updatePlaceholder(selectedField.id, { field_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Default Value</label>
                  {selectedField.field_type === 'textarea' ? (
                    <textarea 
                      value={selectedField.default_value}
                      onChange={(e) => updatePlaceholder(selectedField.id, { default_value: e.target.value })}
                      className={`w-full bg-gray-700 border ${selectedPlaceholder === selectedField.id ? 'border-purple-500' : 'border-gray-600'} rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 h-20`}
                      dir={selectedField.text_direction || 'rtl'}
                    />
                  ) : (
                    <input 
                      type="text"
                      value={selectedField.default_value}
                      onChange={(e) => updatePlaceholder(selectedField.id, { default_value: e.target.value })}
                      className={`w-full bg-gray-700 border ${selectedPlaceholder === selectedField.id ? 'border-purple-500' : 'border-gray-600'} rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500`}
                      dir={selectedField.text_direction || 'rtl'}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Text Direction</label>
                  <select
                    value={selectedField.text_direction || 'rtl'}
                    onChange={(e) => updatePlaceholder(selectedField.id, { text_direction: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {TEXT_DIRECTIONS.map(dir => (
                      <option key={dir.value} value={dir.value}>{dir.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Position */}

              {/* Typography */}
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-white flex items-center gap-2">
                  <Type size={18} className="text-purple-400" />
                  Typography
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Font Family</label>
                  <select
                    ref={fontSelectRef}
                    value={selectedField.style.fontFamily || 'Noto Sans Hebrew'}
                    onChange={(e) => handleFontChange(selectedField.id, e.target.value)} 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    style={{ fontFamily: selectedField.style.fontFamily || 'Noto Sans Hebrew', textRendering: 'geometricPrecision' }}
                  >
                    {availableFonts.map(font => (
                      <option 
                        key={font.id} 
                        value={font.name}
                        style={{ fontFamily: font.name, textRendering: 'geometricPrecision' }}
                      >
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Font Size (px)</label>
                    <input 
                      type="number"
                     min="8"
                     max="500"
                      value={selectedField.style.fontSize}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Font Weight</label>
                    <select
                      value={selectedField.style.fontWeight || 'normal'}
                      onChange={(e) => updatePlaceholder(selectedField.id, {
                        style: { ...selectedField.style, fontWeight: e.target.value }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="600">Semi Bold</option>
                      <option value="500">Medium</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Text Align</label>
                  <select
                    value={selectedField.style?.textAlign || 'center'}
                    onChange={(e) => updatePlaceholder(selectedField.id, {
                      style: { ...selectedField.style, textAlign: e.target.value }
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                
                {/* Line Height Control */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Line Height ({selectedField.style.lineHeight || 1.4})</label>
                  <input 
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.1"
                    value={selectedField.style.lineHeight || 1.4}
                    onChange={(e) => updatePlaceholder(selectedField.id, {
                      style: { ...selectedField.style, lineHeight: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-gray-700 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Letter Spacing Control */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Letter Spacing ({selectedField.style.letterSpacing || 0}px)</label>
                  <input 
                    type="range"
                    min="-5"
                    max="20"
                    step="0.5"
                    value={selectedField.style.letterSpacing || 0}
                    onChange={(e) => updatePlaceholder(selectedField.id, {
                      style: { ...selectedField.style, letterSpacing: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-gray-700 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Color</label>
                  <input
                    type="color" 
                    value={selectedField.style.color || '#000000'}
                    onChange={(e) => updatePlaceholder(selectedField.id, {
                      style: { ...selectedField.style, color: e.target.value }
                    })}
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Font Preview */}
              <div className="space-y-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Font Preview</label>
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-white" style={{ 
                      fontFamily: selectedField.style.fontFamily || 'Noto Sans Hebrew',
                      verticalAlign: selectedField.style.fontFamily === 'LiaBatkol-regular' ? 'top' : 'middle',
                      marginTop: selectedField.style.fontFamily === 'LiaBatkol-regular' ? '-0.5em' : '0',
                      paddingBottom: selectedField.style.fontFamily === 'LiaBatkol-regular' ? '0.5em' : '0',
                      fontSize: '16px',
                      textRendering: 'geometricPrecision',
                      fontWeight: selectedField.style.fontWeight || 'normal',
                      direction: 'rtl'
                    }}>
                      שלום עולם - דוגמה לטקסט בעברית
                    </p>
                    <p className="mt-2 text-white" style={{ 
                      fontFamily: selectedField.style.fontFamily || 'Noto Sans Hebrew',
                      fontSize: '16px',
                      textRendering: 'geometricPrecision',
                      fontWeight: selectedField.style.fontWeight || 'normal',
                      direction: 'ltr'
                    }}>
                      Hello World - English Text Example
                    </p>
                    <button
                      onClick={() => checkFontDetails(selectedField.style.fontFamily || 'Noto Sans Hebrew')}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Info size={12} />
                      Font Details
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Field Options */}
              <div className="space-y-3 mt-6">
                <h4 className="text-lg font-medium text-white">Options</h4>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => updatePlaceholder(selectedField.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white text-sm">Required</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedField.visible}
                      onChange={(e) => updatePlaceholder(selectedField.id, { visible: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white text-sm">Visible</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleRenderPreview}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" 
                >
                  <RefreshCw size={16} />
                  <span>Refresh Preview</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <Type size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Select a field to edit its properties</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-xl font-semibold">Delete Template</h3>
            </div>
            <p className="text-white mb-6">
              Are you sure you want to delete template <span className="font-mono font-bold">{templateId}</span>? 
              This action cannot be undone and will remove all placeholders associated with this template.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Copy Template Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 text-blue-400 mb-4">
              <FileText size={24} />
              <h3 className="text-xl font-semibold">Copy Template</h3>
            </div>
            <p className="text-white mb-4">
              This will create a copy of template <span className="font-mono font-bold">{templateId}</span> with all its placeholders.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">New Template ID</label>
              <input
                type="text"
                value={newTemplateId}
                onChange={(e) => setNewTemplateId(e.target.value.toUpperCase())}
                placeholder="e.g., NEW-TEMPLATE-101"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Use uppercase letters, numbers, and hyphens only</p>
            </div>
            
            {copyError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{copyError}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setNewTemplateId('');
                  setCopyError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyTemplate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateAdmin;