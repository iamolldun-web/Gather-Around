
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gather-sky via-gather-blue to-gather-purple relative overflow-hidden p-4">
       {/* Background Ambience */}
       <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none"></div>
       <div className="absolute -top-20 -right-20 w-96 h-96 bg-gather-pink rounded-full blur-[120px] opacity-30 animate-float"></div>
       <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gather-gold rounded-full blur-[120px] opacity-30 animate-float-delayed"></div>

       {/* Main Card Container */}
       <div className="w-full max-w-2xl relative z-10 animate-slide-in">
         
         {/* Title above card */}
         <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-white drop-shadow-md mb-2">
              {step === 1 ? "Enter the Circle" : "Choose Your Guide"}
            </h1>
            <div className="flex justify-center items-center gap-2">
               <div className="h-1 w-12 bg-white/50 rounded-full"></div>
               <Sparkles className="w-5 h-5 text-gather-gold animate-spin-slow" />
               <div className="h-1 w-12 bg-white/50 rounded-full"></div>
            </div>
         </div>

         {/* The Card */}
         <div className="bg-white p-3 md:p-4 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative">
            
            {/* Inner Layer */}
            <div className="bg-stone-50 rounded-[2rem] p-6 md:p-10 relative overflow-hidden min-h-[400px] flex flex-col shadow-inner border border-stone-100">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gather-gold to-gather-red"></div>

               <div className="relative z-10 flex-grow flex flex-col">
                  
                  {/* Step 1: Name Input */}
                  {step === 1 && (
                    <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
                      <div className="w-20 h-20 bg-gather-gold rounded-full flex items-center justify-center mb-6 shadow-lg rotate-3">
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
                           className="w-full bg-white border-4 border-stone-200 rounded-2xl px-6 py-5 text-center text-2xl md:text-3xl text-gather-brown font-serif placeholder:text-stone-300 focus:border-gather-blue focus:bg-white focus:outline-none transition-all shadow-sm focus:shadow-lg focus:scale-105"
                           autoFocus
                           onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                         />
                      </div>

                      <button 
                        onClick={() => name.trim() && setStep(2)}
                        disabled={!name.trim()}
                        className="group bg-gather-blue text-white text-lg font-bold py-4 px-12 rounded-full hover:bg-gather-sky transition-all shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:-translate-y-1"
                      >
                        <span>Continue Journey</span>
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Avatar Selection */}
                  {step === 2 && (
                    <div className="animate-slide-in flex flex-col h-full">
                      <p className="text-stone-400 text-center mb-6 font-comic font-bold uppercase tracking-wider text-xs">
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
                                  ? 'bg-blue-50 border-gather-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] scale-105' 
                                  : 'bg-white border-stone-100 hover:border-gather-blue/30 hover:bg-white hover:shadow-md hover:-translate-y-1'
                              }`}
                            >
                              <div className={`text-5xl md:text-6xl mb-3 transition-transform duration-500 ${isSelected ? 'scale-110 rotate-6' : 'grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105'}`}>
                                {avatar.icon}
                              </div>
                              <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-gather-blue' : 'text-stone-400 group-hover:text-gather-blue'}`}>
                                {avatar.label.split(' ')[1]}
                              </span>
                              
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-5 h-5 bg-gather-blue rounded-full shadow-sm flex items-center justify-center animate-pop-in">
                                   <div className="w-2 h-2 bg-white rounded-full"></div>
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
