import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const ConfettiEffect = ({ duration = 5000, active = true }) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (active) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isActive) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.2}
      colors={['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']}
    />
  );
};

export default ConfettiEffect;
