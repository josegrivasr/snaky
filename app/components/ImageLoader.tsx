"use client";

import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

// Custom hook for image loading
const useImageLoader = (src: string) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!src || !src.startsWith('http')) {
      setImageLoaded(false);
      setImageError(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageError(true);
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageLoaded, imageError };
};

export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = "",
  style = {},
  fallback = <span className="text-4xl">🛍️</span>,
  loadingComponent = (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
  )
}) => {
  const { imageLoaded, imageError } = useImageLoader(src);

  if (src.startsWith('http')) {
    if (imageLoaded && !imageError) {
      return (
        <img 
          src={src} 
          alt={alt}
          className={className}
          style={style}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center w-full h-full">
          {imageError ? fallback : loadingComponent}
        </div>
      );
    }
  } else {
    return <span className={className}>{src}</span>;
  }
};

export default ImageLoader;
