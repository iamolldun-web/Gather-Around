import React, { useState } from 'react';
import { ArrowRight, Globe2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gather-brown font-sans selection:bg-gather-red selection:text-white perspective-1000">

      {/* --- BACKGROUND SCENE --- */}
      <div className="absolute inset-0 w-full h-full z-0">
         
         {/* 1. Primary Option: Local Asset Image */}
         {!imageError && (
            <img 
              src="/assets/landing-page.png" 
              alt="Global Landscape" 
              className="absolute inset-0 w-full h-full object-cover z-10 opacity-60 mix-blend-overlay"
              onError={() => setImageError(true)}
            />
         )}

         {/* 2. Fallback Option: CSS/SVG 3D Scene */}
         <div className="absolute inset-0 w-full h-full">
            
            {/* Sky Gradient - Warm and Earthy */}
            <div className="absolute inset-0 bg-gradient-to-b from-gather-brown-dark via-gather-brown to-gather-red"></div>

            {/* Sun / Light Source */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] bg-gather-gold rounded-full blur-[100px] opacity-30 animate-pulse"></div>

            {/* Layer: Back Mountains */}
            <div className="absolute bottom-0 left-0 w-full h-[60%] z-10 opacity-40">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                   <path fill="#5C3B27" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Layer: Mid Hills - Clay Red */}
            <div className="absolute bottom-0 left-0 w-full h-[45%] z-20 opacity-80">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                   <path fill="#AA4739" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Layer: Foreground - Dark Earth */}
            <div className="absolute bottom-0 left-0 w-full h-[25%] z-30">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                   <path fill="#3A2518" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
         </div>

         {/* Vignette Overlay (Applies to both) */}
         <div className="absolute inset-0 bg-radial-gradient from-transparent to-gather-brown-dark/80 pointer-events-none z-40"></div>
         
         {/* Texture Overlay */}
         <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none z-50"></div>
      </div>

      {/* --- CENTERED TEXT OVERLAY --- */}
      <div className="relative z-50 flex flex-col items-center justify-center p-4 mb-16 w-full h-full">

            {/* 3D Title */}
            <h1 className="relative text-center text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] font-serif font-black text-gather-linen leading-[0.9] tracking-tighter"
                style={{
                  textShadow: `
                    0 1px 0 #D8A859, 
                    0 2px 0 #D8A859, 
                    0 3px 0 #AA4739, 
                    0 4px 0 #AA4739, 
                    0 5px 0 #5C3B27, 
                    0 6px 1px rgba(0,0,0,.1), 
                    0 0 5px rgba(0,0,0,.1), 
                    0 1px 3px rgba(0,0,0,.3), 
                    0 3px 5px rgba(0,0,0,.2), 
                    0 5px 10px rgba(0,0,0,.25), 
                    0 10px 10px rgba(0,0,0,.2), 
                    0 20px 20px rgba(0,0,0,.15)
                  `
                }}>
              Gather<br/>Around
            </h1>

            {/* Subtitle Badge */}
            <div className="relative mt-8 md:mt-12 inline-flex items-center gap-3 bg-gather-brown-dark/60 backdrop-blur-md text-gather-gold px-8 py-3 rounded-full border border-gather-gold/30 shadow-2xl animate-float">
              <Globe2 className="w-5 h-5 text-gather-red" />
              <span className="text-sm md:text-xl font-bold uppercase tracking-[0.2em] font-comic">Global Folktales</span>
              <Globe2 className="w-5 h-5 text-gather-red" />
            </div>

            {/* 3D Button */}
            <div className="relative mt-12 md:mt-16">
              <button 
              onClick={onStart}
              className="group relative inline-flex items-center justify-center bg-gather-red text-gather-linen text-xl md:text-3xl font-black py-5 px-16 rounded-2xl shadow-[0_12px_0_#5C3B27] active:shadow-[0_4px_0_#5C3B27] active:translate-y-[8px] transition-all duration-150 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-3 tracking-wide drop-shadow-md">
                  JOIN THE CIRCLE
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
                </span>
                {/* Inner bevel shine */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10 rounded-2xl pointer-events-none"></div>
              </button>
            </div>
      </div>
    </div>
  );
};

export default LandingPage;