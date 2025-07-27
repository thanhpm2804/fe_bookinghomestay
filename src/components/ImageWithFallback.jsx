import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, fallbackSrc = "/placeholder-image.svg" }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleError}
    />
  );
};

export default ImageWithFallback; 