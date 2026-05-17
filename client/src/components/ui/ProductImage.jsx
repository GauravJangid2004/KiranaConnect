import { useState } from 'react';

/**
 * ProductImage — Displays a product image with fallback to emoji.
 * If imageUrl is set, renders an optimized <img>; otherwise shows the emoji.
 * Includes a smooth fade-in on load and graceful fallback on error.
 */
export default function ProductImage({ imageUrl, imageEmoji = '📦', size = 48, style = {}, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);

  const showImage = imageUrl && !error;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size > 40 ? 14 : 10,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: showImage ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))',
    border: showImage ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,107,53,0.15)',
    position: 'relative',
    ...style,
  };

  if (!showImage) {
    return (
      <div style={containerStyle} className={className}>
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{imageEmoji}</span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {!loaded && (
        <span style={{
          position: 'absolute',
          fontSize: size * 0.4,
          lineHeight: 1,
          opacity: 0.5,
        }}>
          {imageEmoji}
        </span>
      )}
    </div>
  );
}
