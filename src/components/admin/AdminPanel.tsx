import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Save, Plus, Trash2, Eye, Copy, RefreshCw, Edit, FileText, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { invitationTemplates } from '../../data/templates';
import TemplateAdmin from './TemplateAdmin';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AdminPanelProps {
  onBack: () => void;
}

type AdminView = 'dashboard' | 'template-admin';

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const renderDashboard = () => (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-michroma text-white mb-4">Template Administration</h2>
        <p className="text-gray-400">Manage template configurations, placeholders, and styling</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invitationTemplates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {template.premium && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                  Premium
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-white font-semibold mb-2">{template.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{template.id}</p>
              
              <div className="flex gap-2">
                <div className="flex-1 text-center py-2 px-3 bg-gray-700/50 rounded text-xs">
                  <div className="text-white font-medium">
                    {template.fields.length > 0 ? 'Pre-configured' : 'Needs Setup'}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-gray-400">
                      {template.fields.length > 0 ? 
                        `${template.fields.length} example fields` : 
                        'No database fields yet'}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(template.id);
                          // Show a temporary "Copied" message
                          const button = e.currentTarget;
                          const originalText = button.innerHTML;
                          button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                          setTimeout(() => {
                            button.innerHTML = originalText;
                          }, 2000);
                        }}
                        className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                        title="Copy template ID"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(template.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 rounded-full bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setCurrentView('template-admin');
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Fields
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-300 font-medium mb-2">📋 How it works:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• <strong>Admin Panel:</strong> Configure fields, positioning, and styling for each template</li>
            <li>• <strong>Database Storage:</strong> All field configurations are saved to Supabase</li>
            <li>• <strong>User Editor:</strong> Users can only edit content, not field positions or styling</li>
            <li>• <strong>Live Sync:</strong> Changes in admin panel immediately affect user experience</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-colors">
            <Plus size={20} />
            <span>Create New Template</span>
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 p-4 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-600/30 transition-colors"
          >
            <RefreshCw size={20} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Delete all placeholders for this template
      const { error } = await supabase
        .from('placeholders')
        .delete()
        .eq('template_id', templateToDelete);

      if (error) throw error;
      
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
      
      // Show success message
      alert(`Template ${templateToDelete} has been deleted successfully`);
      
      // Refresh the page to show updated template list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'template-admin':
        const template = invitationTemplates.find(t => t.id === selectedTemplate);
        return (
          <TemplateAdmin
            templateId={selectedTemplate!}
            templateBackground={template?.background || ''}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 p-4 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={currentView === 'dashboard' ? onBack : () => setCurrentView('dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{currentView === 'dashboard' ? 'Back to Integrations' : 'Back to Dashboard'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Settings size={24} className="text-purple-400" />
            <h1 className="text-2xl font-michroma text-white">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            {selectedTemplate && currentView === 'template-admin' && (
              <div className="text-white/60 text-sm">
                Template: {selectedTemplate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-semibold">Delete Template</h3>
            </div>
            <p className="text-white mb-6">
              Are you sure you want to delete template <span className="font-mono font-bold">{templateToDelete}</span>? 
              This action cannot be undone and will remove all placeholders associated with this template.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full h-screen pt-16 overflow-hidden">
        <div className="h-full overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;