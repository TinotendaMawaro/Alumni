import { useEffect, useRef } from 'react';

/**
 * Full-screen background picture with:
 *  - a slow Ken Burns zoom/drift so the photo never feels static
 *  - drifting SVG wave layers for depth
 *  - soft floating light orbs
 *  - a readability tint so glass cards and white text stay legible
 */
const ImageBackground = () => {
  const wrapRef = useRef(null);

  useEffect(() => {
    // Respect users who prefer reduced motion.
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (wrapRef.current) {
        wrapRef.current.dataset.static = mq?.matches ? 'true' : 'false';
      }
    };
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="bg-root"
      style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none', backgroundColor: '#1e1b4b' }}
    >
      {/* Photograph */}
      <div className="bg-photo" style={{ backgroundImage: 'url(/background.jpeg)' }} />

      {/* Readability tint */}
      <div className="bg-tint" />
      <div className="bg-tint bg-tint--bottom" />

      {/* Floating light orbs */}
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />

      {/* Wave layers */}
      <div className="bg-waves">
        <svg className="bg-wave bg-wave--far" viewBox="0 0 2880 320" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,160 C120,100 240,220 360,160 C480,100 600,220 720,160 C840,100 960,220 1080,160 C1200,100 1320,220 1440,160 C1560,100 1680,220 1800,160 C1920,100 2040,220 2160,160 C2280,100 2400,220 2520,160 C2640,100 2760,220 2880,160 L2880,320 L0,320 Z" />
        </svg>
        <svg className="bg-wave bg-wave--mid" viewBox="0 0 2880 320" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,190 C160,130 320,250 480,190 C640,130 800,250 960,190 C1120,130 1280,250 1440,190 C1600,130 1760,250 1920,190 C2080,130 2240,250 2400,190 C2560,130 2720,250 2880,190 L2880,320 L0,320 Z" />
        </svg>
        <svg className="bg-wave bg-wave--near" viewBox="0 0 2880 320" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,225 C180,175 360,275 540,225 C720,175 900,275 1080,225 C1260,175 1440,275 1620,225 C1800,175 1980,275 2160,225 C2340,175 2520,275 2880,225 L2880,320 L0,320 Z" />
        </svg>
      </div>
    </div>
  );
};

export default ImageBackground;
