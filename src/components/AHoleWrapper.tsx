import React, { useEffect, useRef, useState } from 'react';
import '../ahole.css';

const AHoleWrapper: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Dynamically import AHole component only for desktop
    const loadAHole = async () => {
      const { default: initAHole } = await import('../a-hole.js');
      if (!customElements.get('a-hole')) {
        initAHole();
      }
    };

    loadAHole();
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-blue-900/30 to-purple-900/30 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-ping opacity-75" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div>
      <a-hole>
        <canvas className="js-canvas z-0" ref={canvasRef}></canvas>
        <div className="aura"></div>
        <div className="overlay"></div>
      </a-hole>
    </div>
  );
};

export default AHoleWrapper;