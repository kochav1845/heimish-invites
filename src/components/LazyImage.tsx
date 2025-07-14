import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, width, height }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      effect="blur"
      width={width}
      height={height}
      loading="lazy"
      placeholderSrc={`${src}?blur=200`}
    />
  );
};

export default LazyImage;