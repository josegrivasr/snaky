"use client";

import React, { useState } from 'react';

function displaySrc(src: string): string {
  try {
    const url = new URL(src);
    if (url.protocol === 'https:' && url.hostname === 'files.stripe.com') {
      return `/api/image?src=${encodeURIComponent(src)}`;
    }
  } catch {
    return src;
  }
  return src;
}

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

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
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src.startsWith('http') || failed) {
    if (!src.startsWith('http')) {
      return <span className={className}>{src}</span>;
    }
    return (
      <div className="flex items-center justify-center w-full h-full">
        {fallback}
      </div>
    );
  }

  return (
    <span className="relative flex h-full w-full items-center justify-center">
      {loaded ? null : (
        <span className="absolute inset-0 flex items-center justify-center">
          {loadingComponent}
        </span>
      )}
      <img
        src={displaySrc(src)}
        alt={alt}
        className={className}
        style={{ ...style, opacity: loaded ? 1 : 0 }}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </span>
  );
};

export default ImageLoader;
