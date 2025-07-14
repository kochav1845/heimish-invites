import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { debounce } from '../../utils/debounce';
import { InvitationTemplate, InvitationData } from '../../types/invitation';
import { CustomizationData } from '../../types/customization';
import FieldEditor from './FieldEditor';
import ExportModal from './ExportModal';
import AdminLogin from '../AdminLogin';
import InvitationPreview from './InvitationPreview';
import { createClient } from '@supabase/supabase-js';
import { ArrowUp, ArrowDown } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface InvitationEditorProps {
  template: InvitationTemplate;
  data: InvitationData;
  onDataChange: (data: InvitationData) => void;
  onBack: () => void;
}

const InvitationEditor: React.FC<InvitationEditorProps> = ({
  template,
  data,
  onDataChange,
  onBack
}) => {
  const [placeholders, setPlaceholders] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(true);
  const [userValues, setUserValues] = useState<Record<string, string>>({});
  const [debouncedUserValues, setDebouncedUserValues] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderAttempted, setRenderAttempted] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(0.7);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Create a debounced function to update preview data
  const debouncedUpdateValues = useCallback(
    debounce((newValues: Record<string, string>) => {
      setDebouncedUserValues(newValues);
      
      // Update the parent component's data
      onDataChange({
        ...data,
        values: newValues
      });
    }, 500), // 500ms debounce delay
    [data, onDataChange]
  );

  useEffect(() => {
    // Load placeholders for the template
    const loadPlaceholders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('placeholders')
          .select('id, label, field_type, default_value, placeholder, required, visible, style, text_direction')
          .eq('template_id', template.id)
          .order('style->>y', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} placeholders for template ${template.id}`);
          setPlaceholders(data);
          
          // Initialize userValues with default values from placeholders
          const initialValues: Record<string, string> = {};
          data.forEach(p => {
            initialValues[p.id] = p.default_value || '';
          });
          setUserValues(initialValues);
          setDebouncedUserValues(initialValues);
        } else {
          console.warn(`No placeholders found for template ${template.id}`);
          // Create default empty placeholders as fallback
          setPlaceholders([]);
        }
      } catch (error) {
        console.error('Error loading placeholders:', error);
        setError(`Failed to load template data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlaceholders();
  }, [template.id]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    // Select the field when changing its value
    setSelectedField(fieldId);
    
    // Verify the field exists in placeholders list
    const fieldExists = placeholders.some(p => p.id === fieldId);
    if (!fieldExists) {
      return;
    }

    const newValues = {
      ...userValues,
      [fieldId]: value
    };
    
    // Immediately update local state for responsive UI
    setUserValues(newValues);
    
    // Debounce the update to the preview
    debouncedUpdateValues(newValues);
  }, [placeholders, userValues, debouncedUpdateValues]);

  // Keep this legacy update for backward compatibility
  const legacyUpdateData = useCallback((fieldId: string, value: string) => {
    setUserValues(prev => ({ 
      ...prev,
      [fieldId]: value
    }));
    
    // Update the data prop to reflect changes
    onDataChange({
      ...data,
      values: {
        ...data.values,
        [fieldId]: value
      }
    });
  }, [data, onDataChange, placeholders]);

  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    // Handle admin login logic here
  };

  const handleExport = () => {
    setRefreshKey(prev => prev + 1);
    setShowExportModal(true);
  };

  const handleRenderError = useCallback((error: string) => {
    setPreviewError(error);
    setRenderAttempted(true);
  }, []);
  
  const handleRenderStatusChange = useCallback((isRendering: boolean) => {
    setIsRendering(isRendering);
    if (!isRendering) {
      setRenderAttempted(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <div>Loading template data...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-xl p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Template</div>
          <div className="text-white mb-6">{error}</div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black/50  ">
      {/* Left Panel - User Content Editor */}
      <div className="w-1/5  border-r border-gray-700 overflow-y-auto h-screen pt-16">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </button>

          <h2 className="text-xl font-bold text-white mb-4">Edit Content</h2>
          
          <div className="space-y-4">
            {placeholders
              .sort((a, b) => parseFloat(a.style?.y || "50") - parseFloat(b.style?.y || "50"))
              .map((placeholder) => (
              <FieldEditor
                key={placeholder.id}
                placeholder={placeholder}
                value={userValues[placeholder.id] || ''}
                isSelected={selectedField === placeholder.id}
                
                onValueChange={(value) => handleFieldChange(placeholder.id, value)}
                onSelect={() => {
                  console.log('Field selected from editor:', placeholder.id);
                  setSelectedField(placeholder.id);
                }}
              />
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={handleExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Invitation
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-4/5 relative flex flex-col pt-16">
        <div className="flex-1 overflow-auto pt-4">
          <div className="pdf-preview-container">
            {previewError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-lg mb-4 mx-auto max-w-2xl">
                <h3 className="font-bold text-lg mb-2">Preview Error</h3>
                <p>{previewError}</p>
                <button 
                  onClick={() => {
                    setPreviewError(null);
                    setRefreshKey(prev => prev + 1);
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            <InvitationPreview
              template={template}
              placeholders={placeholders.filter(p => p.visible)}
              data={{ 
                templateId: template.id,
                values: debouncedUserValues
              }}
              selectedField={selectedField}
              editMode={previewMode === 'edit'}
              onFieldSelect={(fieldId) => {
                console.log('Field selected from preview:', fieldId);
                setSelectedField(fieldId);
              }}
              onFieldHover={setHoveredField}
              refreshKey={refreshKey}
              renderMode="canvas"
              renderQuality="high"
              renderOnMount={true}
              onRenderError={handleRenderError}
              onRenderStatusChange={handleRenderStatusChange}
              scale={previewScale}
              ref={previewRef}
            />
          </div>
        </div>

        {/* Admin Access Button */}
        <div className="absolute top-20 right-4">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-lg transition-colors"
            title="Admin Access"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          key={`export-modal-${refreshKey}`}
          template={template as any}
          placeholders={placeholders}
          data={{ templateId: template.id, values: userValues }}
          selectedField={selectedField}
          renderMode="canvas"
          onFieldHover={setHoveredField}
          editMode={previewMode === 'edit'}
          onFieldSelect={(fieldId) => {
            console.log('Field selected from export modal:', fieldId);
            setSelectedField(fieldId);
          }}
          refreshKey={refreshKey}
          scale={previewScale}
          onRenderError={handleRenderError}
          onRenderStatusChange={setIsRendering}
          previewRef={previewRef}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
};

export default InvitationEditor;