import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';
import Typed from 'typed.js';
import { images } from '../assets/images';

interface PortfolioItem {
  title: string;
  description: string;
  image: string;
  liveUrl: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    title: "Gabei Tzdukeh",
    description: "A comprehensive charity management platform with secure payment processing, donor management, and real-time reporting. Features include Face ID authentication, instant search, and campaign tracking.",
    image: images.portfolio.gabeitzdukeh,
    liveUrl: "https://gabeitzdukeh.netlify.app"
  },
  {
    title: "Strade",
    description: "A sleek, real-time trading platform built for strategy-driven investors. Trade lets users execute custom strategies, track live market prices, and analyze performance—all in one streamlined dashboard. With built-in stock lookup tools and live data feeds, it's the smart way to trade with clarity and confidence.",
    image: images.portfolio.strade,
    liveUrl: "https://stradedev.netlify.app"
  },
  {
    title: "Monticello Retreat",
    description: "Elegant retreat center website showcasing amenities, event spaces, and booking capabilities. Features stunning photography and an intuitive reservation system.",
    image: images.portfolio.monticello,
    liveUrl: "https://monticelloretreat.com"
  },
  {
    title: "Onstage Studio",
    description: "A stunning marketing platform for a live on-stage studio show, featuring immersive video and audio embeds. This beautifully designed website highlights shows, behind-the-scenes content, and rich Yiddish articles.",
    image: images.portfolio.onstage,
    liveUrl: "https://studioshow.com"
  },
  {
    title: "Keren Hachesed",
    description: "Charitable organization platform with donation processing, campaign management, and impact reporting. Multi-language support and donor dashboard included.",
    image: images.portfolio.kerenhachesed,
    liveUrl: "https://kerenhachesedny.org"
  },
  {
    title: "Donai",
    description: "Crowdfunding platform designed for campaigns, featuring real-time analytics, customizable dashboards, and multi-language support. Built to empower organizations with powerful tools for donation tracking and impact reporting.",
    image: images.portfolio.donai,
    liveUrl: "https://donai.netlify.app"
  }
];

const Portfolio: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typedRef.current) {
      typed.current = new Typed(typedRef.current, {
        strings: ['websites', 'software', 'creativity', 'experiences'],
        typeSpeed: 50,
        backSpeed: 50,
        backDelay: 1000,
        startDelay: 300,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      });
    }

    return () => {
      typed.current?.destroy();
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === portfolioItems.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? portfolioItems.length - 3 : prevIndex - 1
    );
  };

  const visibleItems = portfolioItems.slice(currentIndex, currentIndex + 3);

  return (
    <section className="relative py-24 px-4">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent to-black/80"></div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-transparent to-black/80"></div>
      
      <div className="container mx-auto relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-michroma tracking-wider text-center mb-12"
        >
          Crafting: <span ref={typedRef} className="text-primary-400 glow"></span>
        </motion.h2>

        <div className="relative">
          {!isMobile && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full text-white z-10 hover:scale-110 transition-transform"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full text-white z-10 hover:scale-110 transition-transform"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-3 gap-6'}`}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm"
              >
                <div className="relative h-[300px] overflow-hidden">
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={800}
                    height={600}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-michroma tracking-wider text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {item.description}
                      </p>
                      <motion.a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
                      >
                        View Live Site
                        <ExternalLink size={18} />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: portfolioItems.length - 2 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;