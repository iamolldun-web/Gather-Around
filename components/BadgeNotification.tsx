import React, { useEffect, useState } from 'react';
import { Badge } from '../types';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose }) => {
  useEffect(() => {
    // Fire confetti when component mounts
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D8A859', '#AA4739', '#5C3B27']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D8A859', '#AA4739', '#5C3B27']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gather-brown-dark/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-gather-linen rounded-[2rem] p-8 text-center animate-pop-in shadow-2xl border-4 border-gather-gold">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-gather-brown transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl animate-pulse"></div>
          <div className={`relative w-24 h-24 ${badge.color} rounded-full flex items-center justify-center text-6xl shadow-lg mx-auto border-4 border-white`}>
            {badge.icon}
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gather-gold animate-bounce" />
        </div>

        <h2 className="text-gather-gold text-xs font-bold uppercase tracking-[0.2em] mb-2">New Badge Unlocked!</h2>
        <h3 className="text-3xl font-serif font-bold text-gather-red mb-3">{badge.name}</h3>
        <p className="text-stone-600 font-comic mb-6 leading-relaxed">
          {badge.description}
        </p>

        <button 
          onClick={onClose}
          className="w-full bg-gather-red text-white font-bold py-3 rounded-xl hover:bg-gather-red-light transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default BadgeNotification;