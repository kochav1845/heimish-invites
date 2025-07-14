import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Typed from 'typed.js';

interface HeroProps {
  onCustomize?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCustomize }) => {
  const typedRef = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    // Delay typed.js initialization to prevent blocking
    const timer = setTimeout(() => {
      if (typedRef.current) {
        typed.current = new Typed(typedRef.current, {
          strings: ['You dream it, we build it'],
          typeSpeed: 50,
          backSpeed: 50,
          startDelay: 500, // Reduced from 1000ms
          showCursor: true,
          cursorChar: '|'
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      typed.current?.destroy();
    };
  }, []);

  return (
    <div className="relative h-[100vh] w-full flex items-center">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        preload="metadata"
      >
        <source src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/hero.mp4" type="video/mp4" />
      </video>
      
      <div className="relative z-30 px-4 ml-[10%] hero-content">
        {/* Simplified STARDEV title without motion */}
        <h1 className="text-7xl font-bold font-michroma text-white mb-4  ">
          STARDEV
        </h1>
        
        {/* Simplified tagline container */}
        <div className="mb-8 ">
          <span
            ref={typedRef}
            className="text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-michroma"
          ></span>
        </div>
       
        {/* Simplified button */}
        <button
          onClick={onCustomize}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 opacity-0 animate-fade-in-delay-2"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;