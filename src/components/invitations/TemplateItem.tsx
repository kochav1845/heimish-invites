import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles } from 'lucide-react';
import { InvitationTemplate } from '../../types/invitation';
import { categoryLabels } from '../../data/templates';

interface TemplateItemProps {
  template: InvitationTemplate;
  index: number;
  onTemplateSelect: (template: InvitationTemplate) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, index, onTemplateSelect }) => {
  return (
    <motion.div
      key={template.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
    >
      {/* Template Preview */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Latest Badge */}
        {template.isLatest && (
          <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles size={12} />
            <span>Latest</span>
          </div>
        )}

        {/* Preview Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
            onClick={(e) => {
              console.log('Template select button clicked:', template.id);
              e.preventDefault();
              e.stopPropagation(); 
              // Ensure the parent handler gets called
              try {
                onTemplateSelect(template);
              } catch (error) {
                console.error('Error selecting template:', error);
                alert('Failed to load template. Please try again.');
              }
            }}
          >
            <Eye size={16} />
            <span>Use Template</span>
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{template.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm capitalize">
            {categoryLabels[template.category] || template.category.replace('-', ' ')}
          </span>
          <span className="text-xs text-white/40 font-mono">
            {template.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateItem;