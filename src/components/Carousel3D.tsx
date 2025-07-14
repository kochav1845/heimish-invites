import React, { useEffect, useState } from 'react';
import { images } from '../assets/images';

const Carousel3D = ({ images: carouselImages }: { images: string[] }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="relative w-full">
        <img 
          src={carouselImages[currentIndex]} 
          alt={`carousel-img-${currentIndex}`}
          className="w-full rounded-lg shadow-lg"
          loading="lazy"
        />
        <div className="flex justify-center mt-4 gap-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === idx ? 'bg-purple-500 w-4' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div id="carousel">
        {carouselImages.map((src, i) => (
          <figure
            key={i}
            style={{ transform: `rotateY(${i * 40}deg) translateZ(288px)` }}
            className="relative flex flex-col items-center"
          >
            <img
              src={src}
              alt={`carousel-img-${i}`}
              className="w-full block"
              loading="lazy"
            />
            <img
              src={images.stand}
              alt="stand"
              className="absolute bottom-[-51px] w-3/5 translate-y-[10px] scale-90 pointer-events-none"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </div>
  );
};

export default Carousel3D;