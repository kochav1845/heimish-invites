import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, X, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const isIntegrationsPage = location.pathname === '/integrations';

  useEffect(() => {
    const handleScroll = () => {
      if (isIntegrationsPage) return;
      
      const sections = ['home', 'about', 'integrations', 'work', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isIntegrationsPage]);

  const handleNavigation = (id: string) => {
    if (isIntegrationsPage) {
      if (id === 'home') {
        navigate('/');
      } else {
        setSelectedCategory(id);
      }
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const setSelectedCategory = (category: string) => {
    const hash = category === '3d' ? '#3d' : 
                category === 'video' ? '#video' : 
                category === 'avatar' ? '#avatar' : 
                category === 'ai' ? '#ai' :
                category === 'invitations' ? '#invitations' : '';
    
    if (location.pathname === '/integrations') {
      window.location.hash = hash;
    } else {
      navigate(`/integrations${hash}`);
    }
  };

  return (
    <div className="fixed w-full z-50 px-4 md:px-[15%] pt-4">
      <nav className="bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
            >
              <Code size={20} />
              <h1 className="text-lg font-michroma tracking-wider">StarDev</h1>
            </button>
            
            {isIntegrationsPage ? (
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setSelectedCategory('ai')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  AI
                </button>
                <button 
                  onClick={() => setSelectedCategory('videos')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  VIDEOS
                </button>
                <button 
                  onClick={() => setSelectedCategory('invitations')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  INVITATIONS
                </button>
                <button 
                  onClick={() => setSelectedCategory('3d')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  3D OBJECTS
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => handleNavigation('home')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  HOME
                </button>
                <button 
                  onClick={() => handleNavigation('about')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  ABOUT
                </button>
                <motion.button 
                  onClick={() => navigate('/integrations')}
                  className={`relative text-sm font-michroma tracking-wider`}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: activeSection === 'integrations' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: activeSection === 'integrations' ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  <span className={`bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent transition-all duration-500 ${
                    activeSection === 'integrations' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}>
                    INTEGRATIONS
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-lg -z-10"
                    initial={false}
                    animate={{
                      background: activeSection === 'integrations' 
                        ? [
                            'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
                            'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                          ]
                        : 'none',
                      boxShadow: activeSection === 'integrations'
                        ? [
                            '0 0 20px rgba(139, 92, 246, 0.5)',
                            '0 0 30px rgba(59, 130, 246, 0.5)',
                            '0 0 20px rgba(139, 92, 246, 0.5)'
                          ]
                        : 'none'
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  {activeSection === 'integrations' && (
                    <motion.div
                      className="absolute inset-0 rounded-lg -z-20 blur-lg"
                      animate={{
                        background: [
                          'linear-gradient(45deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5))',
                          'linear-gradient(45deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))',
                        ],
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
                <button 
                  onClick={() => handleNavigation('work')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  WORK
                </button>
                <button 
                  onClick={() => handleNavigation('contact')}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider"
                >
                  CONTACT
                </button>
              </div>
            )}
            
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white hover:text-white/80 focus:outline-none p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg z-50 border-l border-white/10"
            >
              <div className="p-5">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-white/80"
                >
                  <X size={24} />
                </button>
                <div className="flex flex-col space-y-6 mt-12">
                  {isIntegrationsPage ? (
                    <>
                      <button 
                        onClick={() => setSelectedCategory('ai')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        AI INTEGRATION
                      </button>
                      <button 
                        onClick={() => setSelectedCategory('videos')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        VIDEOS
                      </button>
                      <button 
                        onClick={() => setSelectedCategory('invitations')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        INVITATIONS
                      </button>
                      <button 
                        onClick={() => setSelectedCategory('3d')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        3D OBJECTS
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleNavigation('home')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        HOME
                      </button>
                      <button 
                        onClick={() => handleNavigation('about')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        ABOUT
                      </button>
                      <motion.button 
                        onClick={() => navigate('/integrations')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                        whileHover={{ scale: 1.1 }}
                        animate={{
                          scale: activeSection === 'integrations' ? [1, 1.1, 1] : 1,
                        }}
                      >
                        INTEGRATIONS
                      </motion.button>
                      <button 
                        onClick={() => handleNavigation('work')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        WORK
                      </button>
                      <button 
                        onClick={() => handleNavigation('contact')}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-michroma tracking-wider text-left"
                      >
                        CONTACT
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navigation;