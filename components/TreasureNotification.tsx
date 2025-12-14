
import React, { useEffect, useState } from 'react';
import { Badge, Treasure, CollectedCharacter } from '../types';
import { X, Sparkles, Map, Gem, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TreasureNotificationProps {
  badges: Badge[];
  treasure: Treasure;
  character: CollectedCharacter | null;
  onClose: () => void;
}

const TreasureNotification: React.FC<TreasureNotificationProps> = ({ badges, treasure, character, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Delay opening slightly for effect
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti when chest opens
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FDCB6E', '#FF6B6B', '#74b9ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FDCB6E', '#FF6B6B', '#74b9ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className={`relative w-full max-w-md bg-white rounded-[2rem] text-center transition-all duration-700 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} shadow-2xl border-[6px] border-gather-gold overflow-hidden`}>
        
        {/* Background Rays */}
        <div className="absolute inset-0 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-yellow-50 via-white to-yellow-50 opacity-60 animate-spin-slow"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-300 hover:text-stone-500 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10 p-8">
            {/* Header Icon */}
            <div className="mb-4 inline-block relative">
                 <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl animate-pulse"></div>
                 <div className="relative text-6xl bounce-gentle">
                    🎁
                 </div>
            </div>

            <h2 className="text-gather-red font-black text-2xl uppercase tracking-widest mb-1">Treasures Found!</h2>
            <p className="text-stone-400 font-bold font-comic text-sm mb-6">Added to your Treasure Chest</p>

            <div className="space-y-4">
                
                {/* 1. The Message Treasure */}
                <div className="bg-white p-4 rounded-xl border-2 border-gather-gold shadow-sm transform hover:scale-105 transition-transform">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gather-gold text-white p-2 rounded-full shadow-sm">
                         <Map className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gather-brown text-sm uppercase">Wisdom Scroll</span>
                   </div>
                   <p className="font-serif italic text-gather-brown text-lg leading-snug">
                     "{treasure.message}"
                   </p>
                </div>

                {/* 2. Character Drop (Rare) */}
                {character && (
                    <div className="bg-gradient-to-r from-gather-red to-pink-500 p-1 rounded-xl shadow-lg animate-pop-in">
                        <div className="bg-white p-3 rounded-lg flex flex-col items-center gap-3">
                            <div className="w-full aspect-square bg-stone-50 rounded-lg overflow-hidden border-2 border-stone-100">
                                {character.imageUrl ? (
                                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">{character.icon}</div>
                                )}
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase text-gather-red tracking-wider flex items-center justify-center gap-1 mb-1">
                                    <Sparkles className="w-3 h-3" /> Rare Find!
                                </div>
                                <div className="font-black text-gather-brown text-xl leading-tight">{character.name}</div>
                                <div className="text-stone-400 text-xs mt-1">From: {character.storyTitle}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Badges */}
                {badges.length > 0 && (
                     <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                        <div className="text-left text-xs font-bold text-gather-blue uppercase mb-2">New Badges</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {badges.map(b => (
                                <div key={b.id} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-blue-100">
                                    <span>{b.icon}</span>
                                    <span className="font-bold text-gather-brown text-sm">{b.name}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                )}

            </div>

            <button 
            onClick={onClose}
            className="mt-8 w-full bg-gather-blue text-white font-bold py-4 rounded-xl hover:bg-gather-sky transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border-b-4 border-blue-600 hover:border-blue-400"
            >
            <Gem className="w-5 h-5 text-white" />
            Put in Treasure Chest
            </button>
        </div>
      </div>
    </div>
  );
};

export default TreasureNotification;
