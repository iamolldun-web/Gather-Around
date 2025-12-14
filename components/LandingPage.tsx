import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Cloud, Star, Sparkles, Music, MapPin, Smile } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gather-sky to-[#A5E7FA]">
      
      {/* --- SKY LAYER --- */}
      {/* Sun */}
      <div className={`absolute top-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-gather-yellow rounded-full shadow-[0_0_100px_rgba(255,209,102,0.8)] z-0 animate-spin-slow transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
         {/* Sun Rays */}
         <div className="absolute inset-0 border-[16px] border-dashed border-white/20 rounded-full"></div>
      </div>

      {/* Floating Clouds */}
      <div className="absolute top-[10%] left-[5%] text-white/80 animate-float z-0">
         <Cloud className="w-24 h-24 fill-current drop-shadow-md" />
      </div>
      <div className="absolute top-[20%] right-[20%] text-white/60 animate-float-delayed z-0 scale-75">
         <Cloud className="w-32 h-32 fill-current drop-shadow-md" />
      </div>
      <div className="absolute top-[5%] left-[40%] text-white/40 animate-float z-0 scale-50">
         <Cloud className="w-20 h-20 fill-current" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-50 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        
        {/* Hero Title */}
        <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="mb-2 relative inline-block">
               <div className="absolute -top-8 -left-8 text-gather-yellow animate-bounce-gentle">
                  <Star className="w-12 h-12 fill-current drop-shadow-md" />
               </div>
               <div className="absolute -bottom-4 -right-8 text-gather-pink animate-wiggle">
                  <Sparkles className="w-10 h-10 fill-current drop-shadow-md" />
               </div>
               
               <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] leading-[0.9] font-bouncy font-black text-white drop-shadow-pop filter">
                 <span className="block transform -rotate-3 text-gather-pink stroke-black">Gather</span>
                 <span className="block transform rotate-2 text-gather-yellow mt-2">Around</span>
               </h1>
            </div>

            {/* Redesigned Subtitle: Minimalistic Pill */}
            <div className="mt-8 flex justify-center">
                <div className="bg-white/25 backdrop-blur-md border border-white/40 rounded-full px-6 py-2 shadow-lg animate-pop-in flex items-center gap-2 max-w-lg">
                    <Sparkles className="w-4 h-4 text-white animate-pulse flex-shrink-0" />
                    <p className="text-lg md:text-xl text-white font-comic font-bold tracking-wide leading-tight">
                        A magical library of folk stories from around the world
                    </p>
                    <Sparkles className="w-4 h-4 text-white animate-pulse delay-100 flex-shrink-0" />
                </div>
            </div>
        </div>

        {/* Action Button: Updated Text */}
        <div className={`mt-12 transition-all duration-1000 delay-300 transform ${mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
           <button 
             onClick={onStart}
             className="group relative bg-gather-green hover:bg-gather-green-dark text-white text-xl md:text-3xl font-bouncy font-black py-5 px-12 rounded-[2.5rem] shadow-[0_10px_0_rgb(5,130,95)] active:shadow-[0_4px_0_rgb(5,130,95)] active:translate-y-[6px] transition-all duration-150 flex items-center gap-4 hover:-translate-y-1"
           >
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 fill-white/20" />
              <span className="tracking-wide uppercase">Once Upon a Time</span>
              <div className="bg-white/20 p-2 rounded-full group-hover:rotate-12 transition-transform">
                 <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              
              {/* Button Shine */}
              <div className="absolute top-2 left-6 right-6 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none"></div>
           </button>
        </div>

        {/* Feature Bubbles: Minimalistic Redesign */}
        <div className={`mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0'}`}>
           
           {[
             { icon: <MapPin className="w-8 h-8 text-white" />, bg: "bg-gather-pink", title: "Global Tales", text: "Explore the world" },
             { icon: <Music className="w-8 h-8 text-white" />, bg: "bg-gather-blue", title: "Listen Along", text: "Magical narration" },
             { icon: <Smile className="w-8 h-8 text-white" />, bg: "bg-gather-yellow", title: "Kid Friendly", text: "Safe & whimsical" },
           ].map((item, idx) => (
             <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center border-4 border-white/50 backdrop-blur-sm group">
                <div className={`w-20 h-20 ${item.bg} rounded-3xl flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300 rotate-0`}>
                   {item.icon}
                </div>
                <h3 className="text-2xl font-black text-gather-brown mb-2 font-bouncy">{item.title}</h3>
                <p className="text-stone-400 font-bold font-comic text-lg">{item.text}</p>
             </div>
           ))}

        </div>
      </div>

      {/* --- SCENE LAYERS (Bottom Hills) --- */}
      <div className="absolute bottom-0 w-full h-[35vh] pointer-events-none z-10">
         {/* Back Hill */}
         <div className="absolute bottom-0 right-[-10%] w-[120%] h-[90%] bg-[#05AC80] rounded-tl-[100%] shadow-lg opacity-90"></div>
         
         {/* Front Hill */}
         <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[80%] bg-gather-green rounded-tr-[100%] shadow-lg border-t-8 border-[#4ADE80]/30">
            {/* Decor */}
            <div className="absolute top-12 left-[20%] w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-24 left-[28%] w-3 h-3 bg-white/20 rounded-full"></div>
         </div>
      </div>

    </div>
  );
};

export default LandingPage;