import React, { useState } from 'react';
import { AVATARS, createProfile } from '../services/gamificationService';
import { BACKGROUND_IMAGE_URL } from '../services/geminiService';
import { ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

  const handleFinish = () => {
    if (name.trim()) {
      createProfile(name, selectedAvatar);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gather-brown relative overflow-hidden p-4">
       {/* Immersive Background */}
       <div className="absolute inset-0 z-0">
          <img 
            src={BACKGROUND_IMAGE_URL} 
            alt="Background" 
            className="w-full h-full object-cover opacity-30 blur-md scale-110"
          />
          <div className="absolute inset-0 bg-gather-brown-dark/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 pattern-dots opacity-10"></div>
       </div>

       {/* Main Card Container */}
       <div className="w-full max-w-2xl relative z-10 animate-slide-in">
         
         {/* Title above card */}
         <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-black text-gather-linen drop-shadow-md mb-2">
              {step === 1 ? "Enter the Circle" : "Choose Your Guide"}
            </h1>
            <div className="flex justify-center items-center gap-2">
               <div className="h-1 w-12 bg-gather-gold rounded-full"></div>
               <Sparkles className="w-4 h-4 text-gather-gold animate-spin-slow" />
               <div className="h-1 w-12 bg-gather-gold rounded-full"></div>
            </div>
         </div>

         {/* The Card - Matching Library Aesthetics */}
         <div className="bg-gather-red p-3 md:p-4 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative">
            
            {/* Inner Paper Layer */}
            <div className="bg-gather-linen rounded-[2rem] p-6 md:p-10 relative overflow-hidden min-h-[400px] flex flex-col shadow-inner border-2 border-[#E8DCCB]">
               {/* Paper Texture Overlay */}
               <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gather-gold/40 to-gather-red/40"></div>

               <div className="relative z-10 flex-grow flex flex-col">
                  
                  {/* Step 1: Name Input */}
                  {step === 1 && (
                    <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
                      <div className="w-20 h-20 bg-gather-gold/20 rounded-full flex items-center justify-center mb-6 border-2 border-gather-gold/40">
                         <span className="text-4xl">✍️</span>
                      </div>
                      
                      <p className="text-gather-brown text-lg md:text-xl text-center mb-8 font-comic max-w-md font-bold">
                        Welcome to the circle of stories.<br/>
                        What is your name, traveler?
                      </p>
                      
                      <div className="relative w-full max-w-md mb-12 group">
                         <input 
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="Type your name..."
                           className="w-full bg-white border-2 border-[#e0d5c5] rounded-2xl px-6 py-5 text-center text-2xl md:text-3xl text-gather-brown font-serif placeholder:text-gather-brown/20 focus:border-gather-gold focus:bg-white focus:outline-none transition-all shadow-inner"
                           autoFocus
                           onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                         />
                      </div>

                      <button 
                        onClick={() => name.trim() && setStep(2)}
                        disabled={!name.trim()}
                        className="group bg-gather-brown-dark text-gather-linen text-lg font-bold py-4 px-12 rounded-full hover:bg-gather-red transition-all shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <span>Continue Journey</span>
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Avatar Selection */}
                  {step === 2 && (
                    <div className="animate-slide-in flex flex-col h-full">
                      <p className="text-gather-brown/60 text-center mb-6 font-comic font-bold uppercase tracking-wider text-xs">
                        Select your companion
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {AVATARS.map((avatar) => {
                          const isSelected = selectedAvatar === avatar.id;
                          return (
                            <button
                              key={avatar.id}
                              onClick={() => setSelectedAvatar(avatar.id)}
                              className={`relative group rounded-2xl p-4 transition-all duration-300 border-2 flex flex-col items-center justify-center aspect-square ${
                                isSelected 
                                  ? 'bg-gather-gold/20 border-gather-gold shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]' 
                                  : 'bg-white border-stone-100 hover:border-gather-red/30 hover:bg-white hover:shadow-md hover:-translate-y-1'
                              }`}
                            >
                              <div className={`text-5xl md:text-6xl mb-3 transition-transform duration-500 ${isSelected ? 'scale-110 rotate-3' : 'grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105'}`}>
                                {avatar.icon}
                              </div>
                              <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-gather-brown' : 'text-stone-400 group-hover:text-gather-red'}`}>
                                {avatar.label.split(' ')[1]}
                              </span>
                              
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-4 h-4 bg-gather-gold rounded-full shadow-sm flex items-center justify-center">
                                   <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                         <button 
                           onClick={() => setStep(1)}
                           className="text-stone-400 hover:text-gather-brown font-bold py-3 px-4 rounded-xl transition-colors flex items-center text-sm uppercase tracking-wider"
                         >
                           <ArrowLeft className="w-4 h-4 mr-1" /> Back
                         </button>
                         
                         <button 
                           onClick={handleFinish}
                           className="bg-gather-red text-white font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gather-red-light shadow-xl hover:shadow-red-500/30 hover:-translate-y-1 transition-all flex items-center"
                         >
                           Start Adventure
                           <Sparkles className="w-5 h-5 ml-2 text-gather-gold animate-pulse" />
                         </button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default Onboarding;