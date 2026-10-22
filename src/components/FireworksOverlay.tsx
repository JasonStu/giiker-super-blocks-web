import React, { useEffect, useRef } from 'react';
import { fireworksEngine } from '../fx/fireworks';

export const FireworksOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fireworksEngine.attach(canvasRef.current);
    }
    const handleResize = () => fireworksEngine.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
