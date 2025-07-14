import { useEffect, useState } from 'react';
import { imagePreloader } from '../assets/images';

export const useImagePreloader = () => {
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);
  const [carouselImagesLoaded, setCarouselImagesLoaded] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    // Start preloading critical images immediately
    const preloadCritical = async () => {
      try {
        await imagePreloader.preloadCriticalImages();
        setCriticalImagesLoaded(true);
      } catch (error) {
        console.warn('Critical images preload failed:', error);
        setCriticalImagesLoaded(true); // Continue anyway
      }
    };

    preloadCritical();
  }, []);

  useEffect(() => {
    // Preload carousel images after critical images
    if (criticalImagesLoaded) {
      const preloadCarousel = async () => {
        try {
          await imagePreloader.preloadCarouselImages();
          setCarouselImagesLoaded(true);
        } catch (error) {
          console.warn('Carousel images preload failed:', error);
          setCarouselImagesLoaded(true);
        }
      };

      // Delay carousel preloading slightly
      setTimeout(preloadCarousel, 500);
    }
  }, [criticalImagesLoaded]);

  useEffect(() => {
    // Preload remaining images after carousel
    if (carouselImagesLoaded) {
      const preloadAll = async () => {
        try {
          await imagePreloader.preloadAllImages();
          setAllImagesLoaded(true);
        } catch (error) {
          console.warn('All images preload failed:', error);
          setAllImagesLoaded(true);
        }
      };

      // Delay remaining images preloading
      setTimeout(preloadAll, 1000);
    }
  }, [carouselImagesLoaded]);

  return {
    criticalImagesLoaded,
    carouselImagesLoaded,
    allImagesLoaded
  };
};