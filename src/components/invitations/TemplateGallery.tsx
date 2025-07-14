import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Crown, Eye, ArrowLeft, DollarSign, Sparkles } from 'lucide-react';
import { invitationTemplates, getLatestTemplates } from '../../data/templates';
import { InvitationTemplate } from '../../types/invitation'; 
import TemplateItem from './TemplateItem';
import { categoryLabels } from '../../data/templates';

interface TemplateGalleryProps {
  onTemplateSelect: (template: InvitationTemplate) => void;
  selectedCategory: string;
  onBackToCategories: () => void;
  onCategoryFilterChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'bar-mitzvah', label: 'בר מצווה' },
 
  { id: 'wedding', label: 'חתונה' },
  { id: 'brit-milah', label: 'ברית מילה' },
  { id: 'vachnacht-u-bris', label: 'וואכנאכט וברית' },
  { id: 'shalom-zachor-vachnacht-u-bris', label: 'שלום זכר וואכנאכט וברית' },
  { id: 'pidyon-haben', label: 'פדיון הבן' },
  { id: 'upsherin', label: 'אפשערניש' },
  { id: 'kiddush', label: 'קידושא רבה' },
  { id: 'tenaim', label: 'תנאים/ווארט' },
  { id: 'sheva-brachot', label: 'שבע ברכות' },
  { id: 'general', label: 'כללי' }
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ 
  onTemplateSelect, 
  selectedCategory,
  onBackToCategories,
  onCategoryFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showLatestOnly, setShowLatestOnly] = useState(false);

  console.log("TemplateGallery rendering with category:", selectedCategory);

  const filteredTemplates = invitationTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPremium = !showPremiumOnly || template.premium;
    const matchesLatest = !showLatestOnly || template.isLatest;
    
    // If a specific subcategory is selected, only show templates for that exact subcategory
    const isMatchingCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return isMatchingCategory && matchesSearch && matchesPremium && matchesLatest;
  }, [selectedCategory]);

  // Get the latest templates for the selected category
  const latestTemplates = getLatestTemplates().filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  return (
    <div className=" max-w-7xl mx-auto ">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBackToCategories}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">חזרה</span>
      </motion.button>
      
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-michroma text-white mb-4 tracking-wider"
        >
          {categoryLabels[selectedCategory] || 'בחר תבנית'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/70 text-lg max-w-2xl mx-auto"
          dir="rtl"
        >
          Choose from our collection of beautiful and customizable invitation templates
        </motion.p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-6">
        {/* Search and Premium Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLatestOnly(!showLatestOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showLatestOnly 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
              }`}
            >
              <Sparkles size={16} />
              <span>Latest Styles</span>
            </button>
            
            <button
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showPremiumOnly 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' 
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
              }`}
            >
              <Crown size={16} />
              <span>Premium Only</span>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center " dir="rtl">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryFilterChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-white/70 hover:bg-gray-700 border border-white/20'
              }`}
            >
              <span className="font-medium">{categoryLabels[category.id] || category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Latest Templates Section */}
      {showLatestOnly && latestTemplates.length > 0 && (
        <div className="mb-10 ">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="mr-2 text-yellow-400" size={24} />
            Latest Designs
          </h3>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {latestTemplates.slice(0, 4).map((template, index) => (
              <TemplateItem 
                key={template.id + '-latest'} 
                template={template} 
                index={index}
                onTemplateSelect={onTemplateSelect}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Templates Grid */}
      <div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 "
      >
        {filteredTemplates.map((template, index) => (
          <TemplateItem 
            key={template.id} 
            template={template} 
            index={index}
            onTemplateSelect={onTemplateSelect}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 "
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-white/60">Try adjusting your search criteria or browse different categories</p>
        </motion.div>
      )}

      
     
    </div>
  );
};

export default TemplateGallery;