import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import WebFont from 'webfontloader';
import Hero from './components/Hero';
import Navigation from './components/Navigation';
import AHoleWrapper from './components/AHoleWrapper';
import AlternatingSection from './components/AlternatingSection';
import TechShowcase from './components/TechShowcase';
import FAQSection from './components/FAQSection';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomizationPanel from './components/CustomizationPanel';
import IntegrationsPage from './components/IntegrationsPage';
import { Globe } from 'lucide-react';
import World from './components/world';
import TunnelBackground from './components/TunnelBackground';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Carousel3D from './components/Carousel3D';
import { CustomizationOptions } from './types/customization';
import WaterWaves from './components/WaterWaves';
import MachineGunText from './components/MachineGunText';
import FeatureReel from './components/FeatureReel';
import { images } from './assets/images';
import { useImagePreloader } from './hooks/useImagePreloader';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [showCustomization, setShowCustomization] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { criticalImagesLoaded, carouselImagesLoaded } = useImagePreloader();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const [options, setOptions] = useState<CustomizationOptions>({
    font: {
      main: 'Inter',
      secondary: 'Michroma'
    },
    primaryColor: JSON.stringify({ r: 59, g: 130, b: 246, a: 1 }),
    secondaryColor: JSON.stringify({ r: 107, g: 114, b: 128, a: 1 }),
    accentColor: JSON.stringify({ r: 245, g: 158, b: 11, a: 1 }),
    companyName: '',
    companyTagline: '',
    companyDescription: '',
    sections: {
      hero: true,
      about: true,
      contact: true,
      faq: true,
      pricing: true,
      testimonials: true,
      ecommerce: false
    },
    animations: {
      scroll: {
        fadeIn: true,
        slideUp: true
      },
      hover: {
        scale: true,
        glow: false
      }
    },
    layout: {
      maxWidth: 'default',
      spacing: 'comfortable',
      contentAlignment: 'center'
    },
    navbarStyle: 'sticky'
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load fonts asynchronously to prevent blocking
    const loadFonts = async () => {
      try {
        await document.fonts.ready;
        
        // Load Hebrew fonts specifically
        const hebrewFonts = [
          new FontFace('Noto Sans Hebrew', 'url(https://fonts.gstatic.com/s/notosanshebrew/v43/nwpBtKU3IiRrk_-9SjqS8V3lqgEoWNa3JQS_Ew.woff2)', {
            display: 'swap'
          }),
          new FontFace('Heebo', 'url(https://fonts.gstatic.com/s/heebo/v22/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiS2cckOnz02SXQ.woff2)', {
            display: 'swap'
          }),
          new FontFace('Frank Ruhl Libre', 'url(https://fonts.gstatic.com/s/frankruhllibre/v15/j8_v6-DK1XtLDgIaQ8PuvqtMWg.woff2)', {
            display: 'swap'
          }),
          new FontFace('David Libre', 'url(https://fonts.gstatic.com/s/davidlibre/v14/snfus0W_99N64iuYSvp4W_l86p6TYS-Y.woff2)', {
            display: 'swap'
          }),
          new FontFace('Miriam Libre', 'url(https://fonts.gstatic.com/s/miriamlibre/v13/DdTh798HsHwubBAqfkcBTL_vYJn_Teun9g.woff2)', {
            display: 'swap'
          }),
          new FontFace('Tinos', 'url(https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwgX8dGVh8TI-.woff2)', {
            display: 'swap'
          })
        ];
        
        // Load Hebrew fonts
        const hebrewFontPromises = hebrewFonts.map(font => font.load());
        const loadedHebrewFonts = await Promise.all(hebrewFontPromises);
        loadedHebrewFonts.forEach(font => document.fonts.add(font));
        
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading failed:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadFonts);
    } else {
      setTimeout(loadFonts, 100);
    }

    // Load additional fonts with WebFont after initial render
    setTimeout(() => {
      WebFont.load({
        google: {
          families: ['Roboto:400,500,700', 'Noto Sans Hebrew:400,500,600,700']
        }
      });
    }, 1000);
  }, []);

  // Show loading state until critical resources are ready
  if (!fontsLoaded || !criticalImagesLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl font-michroma">Loading...</div>
      </div>
    );
  }

  const handleOptionsChange = (newOptions: CustomizationOptions) => {
    setOptions(newOptions);
  };

  const handleCloseCustomization = () => {
    setShowCustomization(false);
  };

  const faqs = [
    {
      question: "What technologies do you specialize in?",
      answer: "We specialize in cutting-edge web technologies, including React, Leet, TypeScript, Node.js, and PostgreSQL. Our team also focuses on modern UI/UX design principles and mobile-first development to ensure your app looks amazing on every screen!"
    },
    {
      question: "How long does a typical project take?",
      answer: "Timelines vary based on scope. A sleek, branded portfolio website can be completed in as little as one week. Larger-scale projects, like full-featured e-commerce platforms or enterprise dashboards, typically take 3 to 4 weeks. We balance speed with perfection to deliver world-class quality, fast."
    },
    {
      question: "Do you offer ongoing support?",
      answer: "Absolutely! We provide comprehensive support and long-term maintenance plans tailored to your business needs. From performance optimization to feature enhancements, we're with you every step of the way."
    },
    {
      question: "How does your pricing work?",
      answer: "Our pricing starts at $80 an hour — yes, we take our work seriously. But in reality, rates depend on project complexity, feature sets, integrations, and deadlines. Whether you're launching a simple landing page or a full-stack platform, we'll create a custom quote that fits your goals and budget."
    },
    {
      question: "Can you help with branding and modern design?",
      answer: "Yes! Our team is passionate about crafting stunning, modern designs that convert. From logos and brand kits to animated UI elements and responsive layouts, we bring your vision to life with style and precision."
    }
  ];

  return (
    <Router>
      <ScrollToTop />
      <div className="relative">
        <Navigation />
        <Routes>
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/" element={
            <>
              <div id="home" className="h-[90vh] relative overflow-hidden">
                <div className="relative z-10">
                  <Hero onCustomize={() => setShowCustomization(true)} />
                </div>
              </div>

              <div className="bg-black">
                <section id="about" className="scroll-mt-24">
                  {!isMobile && (
                    <section className="mt-[100px] z-1000 flex items-center justify-center overflow-visible" style={{ position: 'relative', height: '50vh', alignItems:'center' }}>
                      <WaterWaves />
                      <div className="relative z-20">
                        <div className="flex text-left items-center justify-center">
                          <MachineGunText text="StarDev. We got you covered. You name it we build it. Websites. Software. AI powered, systems. Automation. Done." />
                        </div>
                      </div>
                    </section>
                  )}

                  <AlternatingSection
                    title="Smart Design, Seamless Experience"
                    description="Design is more than looks — it's about flow, clarity, and conversion. We build interfaces your users will enjoy and trust, backed by clean performance-driven design."
                    imageSrc={images.alternating.organize}
                    imageAlt="User interface design"
                    isImageLeft={true}
                  />

                  <AlternatingSection
                    title="Integrated Software Systems"
                    description="We create powerful software platforms that connect seamlessly with your business operations. From data collection to phone and SMS systems, email automation, and real-time updates — our solutions are built for scale and reliability."
                    isImageLeft={true}
                    customComponent={
                      carouselImagesLoaded ? (
                        <Carousel3D images={images.carousel} />
                      ) : (
                        <div className="w-full h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                          <span className="text-gray-400">Loading carousel...</span>
                        </div>
                      )
                    }
                  />

                  <div className="py-20 px-4 md:px-8 bg-[#0b0b0b]">
                    <div className="container mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
                      <div className="w-full md:w-1/2">
                        <World />
                      </div>
                      <div className="w-full md:w-1/2">
                        <h2 className="text-4xl font-michroma tracking-wider mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                          Global & Industry-Wide Reach
                        </h2>
                        <p className="text-gray-300 text-lg mb-6">
                          We work with clients from all over the world — across industries like healthcare, education, nonprofits, real estate, logistics, and private investments. Whether it's streamlining operations, integrating communication systems, or building powerful data tools, our solutions are tailored to each unique need.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    {!isMobile && (
                      <>
                        <div className="absolute top-0 left-0 w-full h-32 z-20 pointer-events-none bg-gradient-to-t from-transparent to-black" />
                        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                          <Suspense fallback={null}>
                            <Canvas 
                              style={{ width: '100%', height: '100%' }}
                              camera={{ position: [0, 0, 1], fov: 75 }}
                            >
                              <TunnelBackground/>
                            </Canvas>
                          </Suspense>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-32 z-20 pointer-events-none bg-gradient-to-b from-transparent to-black" />
                      </>
                    )}

                    <TechShowcase />

                    <section id="services" className="scroll-mt-24 relative z-10">
                      <FeatureReel />
                    </section>
                  </div>

                  <AlternatingSection
                    title="Always exciting, Always interesting"
                    description="We help turn visitors into customers with stunning websites that highlight your product's value."
                    imageSrc={images.alternating.computer}
                    imageAlt="User interface design"
                    isImageLeft={true}
                  />

                  <section id="work" className="scroll-mt-24">
                    <Portfolio />
                  </section>

                  <AlternatingSection
                    title="Powered by PostgreSQL real-time DataBase"
                    description="We use PostgreSQL to deliver secure, scalable, and high-performance data storage. It supports advanced queries, real-time analytics, and flexible data structures. Your data is always optimized, protected, and ready to grow with your business."
                    imageSrc={images.alternating.database}
                    imageAlt="Database design"
                    isImageLeft={false}
                  />

                  <FAQSection faqs={faqs} />

                  <div id="contact" className="h-[90vh] relative overflow-hidden">
                    <AHoleWrapper />
                    <div className="relative z-10">
                      <Contact/>
                    </div>
                  </div>

                  <Footer />
                </section>
              </div>

              {showCustomization && (
                <CustomizationPanel 
                  options={options} 
                  onOptionsChange={handleOptionsChange}
                  onClose={handleCloseCustomization}
                />
              )}
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;