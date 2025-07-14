import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import WebFont from 'webfontloader';
import IntegrationsPage from './components/IntegrationsPage';
import { Suspense } from 'react';
import Navigation from './components/Navigation';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
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
  if (!fontsLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl font-michroma">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="relative">
        <Navigation />
        <Routes>
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/" element={<Suspense fallback={<div>Loading...</div>}>
            <IntegrationsPage />
          </Suspense>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;