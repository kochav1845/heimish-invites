import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import InvitationPlatform from './invitations/InvitationPlatform'; 

const IntegrationsPage: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const examples3D = [
    {
      title: "Interactive Object",
      url: "https://my.spline.design/nexbotrobotcharacterconcept-VleXvms8aNX7BxplTfQdY4Mr/",
      description: "A dynamic 3D object that responds to mouse movement"
    },
    {
      title: "Night View",
      url: "https://my.spline.design/moonparallax-gJx6ZxtpZ5mfHgrNrIPYZ9oJ/",
      description: "An immersive 3D night scene with dynamic lighting"
    },
    {
      title: "Orbit Triangle",
      url: "https://my.spline.design/orbittriangle-UAAh25Elr7sXfIgaoBGYPkU5/",
      description: "A mesmerizing 3D masterpiece with orbital motion"
    }
  ];

  const videoShowcases = [
    {
      title: "Traditional Chasidic Video",
      video: "https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/stardevchjasidishavator.mp4",
      description: "A meticulously crafted video featuring authentic Chasidic details and natural movements",
      features: ["Authentic clothing details", "Natural expressions", "Fluid movements"]
    },
    {
      title: "Modern Chasidic Video",
      video: "https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/avator2.mp4",
      description: "Contemporary interpretation of Chasidic characters with enhanced features",
      features: ["Modern styling", "Enhanced expression", "High-quality rendering"]
    },
    {
      title: "Donald Trump Digital Video",
      video: "https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/trump.mp4", 
      description: "Highly detailed digital recreation with signature mannerisms",
      features: ["Accurate mapping", "Signature gestures", "Voice synchronization"]
    },
    {
      title: "Marketing Video",
      video: "https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/StarDev_Digital_Impact_Solutions%20(1).mp4.mp4", 
      description: "Professional video designed for marketing and promotional content",
      features: ["Professional appearance", "Engaging presence", "Brand-friendly design"]
    }
  ];

  // Load AI-generated videos from Supabase
  useEffect(() => {
    const loadAiVideos = async () => {
      try {
        // Load AI videos logic can be simplified - we're just showing video showcases now
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('*')
          .eq('type', 'ai')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!imageError && imageData && imageData.length > 0) {
          // Just set a few videos for the AI section
          setAiVideos([
            {
              url: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/StarDev_Digital_Impact_Solutions%20(1).mp4.mp4',
              prompt: 'Digital marketing video'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading AI media:', error);
      }
    };
    
    if (selectedCategory === 'ai' && aiOption === null) {
      loadAiVideos();
    }
  }, [selectedCategory, aiOption]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash) {
      setIsLoading(true);
      setSelectedCategory(hash);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }

    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [location.hash]);

            }
          }
        }}
      />
    );
  };

  const LoadingScreen = () => (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/3dintro.png"
        alt="Loading"
        className="w-64 h-64 object-contain"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.h2
        className="text-2xl font-michroma text-white mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        The future is loading...
      </motion.h2>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black/90 p-8">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/3dintro.png"
              alt="Loading"
              className="w-64 h-64 object-contain"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.h2
              className="text-2xl font-michroma text-white mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              The future is loading...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {!showOptions ? (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-michroma text-white mb-4">
              StarDev Integrations
            </h1>
            <p className="text-gray-400">Loading integration options...</p>
          </motion.div>
        </div>
      ) : selectedCategory === 'ai' ? ( 
        renderAIContent()
      ) : selectedCategory === 'video' ? ( 
        renderVideoContent()
      ) : selectedCategory === 'invitations' ? (
        <InvitationPlatform />
      ) : selectedCategory === '3d' ? (
        <div className="min-h-screen bg-black/90 p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <button
              onClick={() => navigate('/')}
              className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Back to Home
            </button>
            <h2 className="text-3xl font-michroma text-white mb-12 text-center">
              3D Objects Showcase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {examples3D.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div className="aspect-video">
                    <iframe
                      src={example.url}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {example.title}
                    </h3>
                    <p className="text-gray-400">
                      {example.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : selectedCategory === 'videos' ? (
        <div className="min-h-screen bg-black/90 p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center justify-between mb-12">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Home
              </button>
              <h2 className="text-3xl font-michroma text-white text-center">
                Video Showcase
              </h2>
              <div className="w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videoShowcases.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700"
                >
                  <div className="aspect-video bg-black">
                    <video 
                      src={video.video} 
                      className="w-full h-full object-contain"
                      controls
                      muted
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => { 
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {video.description}
                    </p>
                    <div className="space-y-2"> 
                      {video.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        // Default main integrations page
        <div className="min-h-screen bg-black/90 p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto text-center"
          >
            <button
              onClick={() => navigate('/')}
              className="mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Back to Home
            </button>
            <h1 className="text-4xl font-michroma text-white mb-8">
              StarDev Integrations
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
              Choose from our powerful integration options to enhance your digital experience
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.1 }}
                onClick={() => setSelectedCategory('ai')}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-michroma text-white mb-2">AI Integration</h3>
                <p className="text-gray-400 group-hover:text-gray-300">
                  Chat, image generation, and video creation
                </p>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedCategory('invitations')}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-michroma text-white mb-2">Invitations</h3>
                <p className="text-gray-400 group-hover:text-gray-300">
                  Create beautiful digital invitations
                </p>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.3 }}
                onClick={() => setSelectedCategory('videos')}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <h3 className="text-xl font-michroma text-white mb-2">Video Showcase</h3>
                <p className="text-gray-400 group-hover:text-gray-300">
                  Check out our video examples
                </p>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;