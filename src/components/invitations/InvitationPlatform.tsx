import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Palette, FileText, Download, Settings, ChevronRight } from 'lucide-react';
import TemplateGallery from './TemplateGallery';
import InvitationEditor from './InvitationEditor';
import { useNavigate, useLocation } from 'react-router-dom';

import AdminLogin from '../AdminLogin'; 
import AdminPanel from '../admin/AdminPanel';

import { InvitationTemplate, InvitationData } from '../../types/invitation';

type ViewMode = 'gallery' | 'editor' | 'admin';
type EventCategory = 'all' | 'bar-mitzvah' | 'bat-mitzvah' | 'wedding' | 'brit-milah' | 'pidyon-haben' | 'general' | 'sheva-brachot' | 'tenaim' | 'upsherin' | 'kiddush' | string;

const InvitationPlatform: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<ViewMode>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState<boolean>(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState<boolean>(true);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  // Hide the main navigation when component mounts
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }

    // Show the navbar again when component unmounts
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, []);

  // Get font URL from our database
  const getFontUrl = (fontFamily: string): string | null => {
    // Placeholder for font URL lookup
    return null;
  };

  const handleTemplateSelect = (template: InvitationTemplate) => {
    console.log("Template select handler called with:", template.id);
    setSelectedTemplate(template);
    
    // Make sure template has defaultValues to prevent undefined errors
    const safeDefaultValues = template.defaultValues || {};
    
    setInvitationData({
      templateId: template.id,
      values: safeDefaultValues
    });
    
    setCurrentView('editor');
    
    // Add a fallback timeout in case of errors to prevent blank screen
    const timeoutId = setTimeout(() => {
      if (document.body.contains(document.querySelector('.h-screen.flex.items-center.justify-center.bg-gray-900'))) {
        console.error('Possible timeout while loading template:', template.id);
        handleBackToGallery();
      }
    }, 10000); // 10 second timeout
    
    // Clear timeout on component unmount
    return () => clearTimeout(timeoutId);
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    setSelectedTemplate(null);
    setShowWelcomePrompt(false);
    setInvitationData(null);
  };

  const handleCategoryFilterChange = (category: EventCategory) => {
    setSelectedCategory(category);
    setShowWelcomePrompt(false);
    setShowSubcategories(false);
    
    console.log("Filtered by category:", category);
  };

  const handleDataChange = (newData: InvitationData) => {
    setInvitationData(newData);
  };

  const handleCategorySelect = (category: EventCategory) => {
    setSelectedCategory(category);
    setShowWelcomePrompt(false);
    
    // Check if the selected category has subcategories
    const mainCategory = eventCategories.find(c => c.id === category);
    if (mainCategory && mainCategory.subCategories && mainCategory.subCategories.length > 0) {
      setSelectedMainCategory(category);
      setShowSubcategories(true);
    } else {
      setShowSubcategories(false);
      setSelectedMainCategory(null);
    }
    
    console.log("Selected category:", category);
  };
  
  const handleSubcategorySelect = (subcategory: string) => {
    // Comprehensive mapping of Hebrew subcategory names to precise category IDs
    const subcategoryMap: Record<string, string> = {
      'ברית מילה': 'brit-milah',
      'שלום זכר': 'shalom-zachor',
      'וואכנאכט': 'vachnacht',
      'וואכנאכט וברית': 'vachnacht-u-bris',
      'שלום זכר וואכנאכט וברית': 'shalom-zachor-vachnacht-u-bris',
      'בר מצוה': 'bar-mitzvah',
      'קידוש': 'kiddush',
      'תנאים': 'tenaim',
      'באווארפן': 'bavorfn',
      'חתונה': 'wedding',
      'שבע ברכות': 'sheva-brachot'
    };

    // Get the specific category ID for the selected subcategory
    const subcategoryId = subcategoryMap[subcategory] || selectedMainCategory;

    if (!subcategoryId) {
      console.error('No category ID found for subcategory:', subcategory);
      return;
    }
    
    setSelectedCategory(subcategoryId);
    setSelectedSubcategory(subcategory);
    setShowSubcategories(false);
    setShowWelcomePrompt(false);
    console.log("Selected subcategory:", subcategory, "using category ID:", subcategoryId);
  };
  
  const handleBackToCategories = () => {
    if (showSubcategories) {
      setShowSubcategories(false);
      setSelectedSubcategory(null);
      setSelectedMainCategory(null);
    } else {
      setShowWelcomePrompt(true);
    }
  };

  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = (success: boolean) => {
    setShowAdminLogin(false);
    if (success) {
      setCurrentView('admin');
    }
  };

  const renderTemplateGallery = () => {
    return (
      <div className="min-h-screen">
        {selectedSubcategory && (
          <div className="max-w-7xl mx-auto mb-4 pt-4">
            <h3 className="text-2xl font-semibold text-white text-center">
              {selectedSubcategory}
            </h3>
          </div>
        )}
        <TemplateGallery 
          onTemplateSelect={handleTemplateSelect}
          selectedCategory={selectedCategory}
          onBackToCategories={handleBackToCategories}
          onCategoryFilterChange={handleCategoryFilterChange}
        />
      </div>
    );
  };

  // Event categories with Hebrew names and images
  const eventCategories = [
    { 
      id: 'brit-milah', 
      label: "ברית",
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/baby%20boy-Photoroom.png',
      subCategories: ['ברית מילה', 'שלום זכר', 'וואכנאכט', 'וואכנאכט וברית', 'שלום זכר וואכנאכט וברית']
    },
    { 
      id: 'bar-mitzvah', 
      label: 'בר מצווה',
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/barmitzve-Photoroom.png',
      subCategories: ['בר מצוה','קידוש'] 
    },
    { 
      id: 'upsherin', 
      label: 'אפשערן',
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/upsherin-Photoroom.png',
      subCategories: [] 
    },
    { 
      id: 'pidyon-haben', 
      label: 'פדיון הבן',
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/pidyon%20haban-Photoroom.png',
      subCategories: [] 
    },
    { 
      id: 'kiddush', 
      label: 'קידושא רבה',
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/baby%20girl-Photoroom.png',
      subCategories: [] 
    },
    { 
      id: 'wedding', 
      label: 'חתונה',
      image: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/shtreimel.png',
      subCategories: ['תנאים', 'באווארפן', 'חתונה', 'שבע ברכות'] 
    },
  ];

  const renderSubcategoriesScreen = () => {
    const mainCategory = eventCategories.find(c => c.id === selectedMainCategory);
    
    if (!mainCategory) return null;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 ">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={currentView === 'gallery' ? () => navigate('/integrations') : 
                  currentView === 'admin' ? () => setCurrentView('gallery') : 
                  handleBackToGallery}
          className="max-w-4xl w-full"
        >
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">חזרה לקטגוריות</span>
          </button>
          
          <h2 className="text-3xl font-michroma text-white mb-8 text-center">
            {mainCategory.label} - בחר סוג אירוע
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mainCategory.subCategories.map((subcategory) => (
              <motion.button
                key={subcategory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubcategorySelect(subcategory)}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all duration-300 text-right h-full"
                dir="rtl"
              >
                <div className="relative">
                  {/* Category Image */}
                  <div className="overflow-hidden h-36">
                    <img 
                      src={mainCategory.image} 
                      alt={subcategory} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Overlay with text */}
                  <div className="p-4 bg-gray-900/80 h-24">
                    <h3 className="text-xl font-bold text-white mb-1">{subcategory}</h3>
                    
                    <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>{mainCategory.label}</span>
                      </div>
                      <ChevronRight className="text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderWelcomeScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <h2 className="text-8xl text-blue-900 mb-8 text-center" style={{ fontFamily: 'FbMelatefMudgash', direction: 'rtl', textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
         
         מזל טוב! וואס איז די שמחה היינט?
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {eventCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategorySelect(category.id as EventCategory)}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all duration-300 text-right h-full"
              dir="rtl"
            >
              <div className="relative">
                {/* Category Image */}
                <div className={`overflow-hidden ${
                  category.id === 'wedding' ? 'h-36' : 
                  category.id === 'brit-milah' ? 'h-32' : 
                  category.id === 'bar-mitzvah' ? 'h-32' : 
                  category.id === 'pidyon-haben' ? 'h-36' : 
                  category.id === 'kiddush' ? 'h-36' : 
                  category.id === 'upsherin' ? 'h-32' : 
                  'h-32'
                }`}>
                  {category.id === 'brit-milah' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/baby%20boy-Photoroom.png" 
                      alt="ברית מילה" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  {category.id === 'bar-mitzvah' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/barmitzve-Photoroom.png" 
                      alt="בר מצווה" 
                      className="w-full h-full object-contain"
                    />
                  )}
                
                  {category.id === 'pidyon-haben' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/pidyon%20haban-Photoroom.png" 
                      alt="פדיון הבן" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  {category.id === 'wedding' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/shtreimel.png" 
                      alt="חתונה" 
                      className="w-full h-full object-contain scale-90"
                    />
                  )}
                   {category.id === 'kiddush' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/baby%20girl-Photoroom.png" 
                      alt="קידוש" 
                      className="w-full h-full object-contain"
                    />
                  )}
                    {category.id === 'upsherin' && (
                    <img 
                      src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20images/upsherin-Photoroom.png" 
                      alt="אפשערן" 
                      className="w-full h-full object-contain"
                    />
                  )}
             
                </div>
                
                {/* Overlay with text */}
                <div className="p-4 bg-gray-900/80 h-24">
                  <h3 className="text-xl font-bold text-white mb-1">{category.label}</h3>
                  
                  {category.subCategories.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                      <div>{category.subCategories.join(' • ')}</div>
                      <ChevronRight className="text-gray-400" size={16} />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (

    <>
      <div className="fixed inset-0 z-[0] overflow-hidden">
        <img 
          src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/main%20simcha%20posters3.jpg"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform'
          }} 
        />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-[70] p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"> 
            <button
              onClick={currentView === 'gallery' 
                ? () => navigate('/integrations') 
                : currentView === 'admin' 
                  ? () => setCurrentView('gallery')
                  : handleBackToGallery}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">
                {currentView === 'gallery' ? 'Back to Integrations' : 
                 currentView === 'admin' ? 'Back to Gallery' :
                 'Back to Gallery'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <FileText size={24} className="text-purple-400" />
              <h1 className="text-2xl font-michroma tracking-wider">
                Digital Invitations
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentView === 'gallery' && (
              <button
                onClick={handleAdminAccess}
                className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Settings size={16} />
                <span>Admin</span>
              </button>
            )}
            {currentView === 'editor' && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Palette size={16} />
                <span>Template: {selectedTemplate?.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 h-screen pt-16 w-full overflow-auto ">
        <AnimatePresence mode="wait">
          {currentView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto"
            >
              {showWelcomePrompt ? (
                renderWelcomeScreen()
              ) : showSubcategories ? (
                renderSubcategoriesScreen()
              ) : (
                renderTemplateGallery()
              )}
            </motion.div>
          )}

          {currentView === 'editor' && selectedTemplate && invitationData && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-visible"
            >
              <InvitationEditor
                template={selectedTemplate}
                data={invitationData}
                onDataChange={handleDataChange}
                onBack={handleBackToGallery}
              />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto"
            >
              <AdminPanel onBack={() => setCurrentView('gallery')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      {currentView !== 'admin' && (
        <div className="relative z-10 p-4 border-t border-white/10 ">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white/60 text-sm gap-2">
            <div className="flex items-center gap-4">
              <span>© 2025 StarDev Digital Invitations</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span>Professional Event Invitations</span>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <span>Hebrew & English Support</span>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <span>High-Quality PDF Export</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InvitationPlatform;