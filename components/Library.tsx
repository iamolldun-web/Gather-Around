import React, { useEffect, useState } from 'react';
import { Story, LoadingState, UserProgress, StoryPage } from '../types';
import { generateStoryList, generateStoryContent, generatePageImage, BACKGROUND_IMAGE_URL } from '../services/geminiService';
import { getUserProgress, BADGES, AVATARS, upgradeToPremium, saveReadingProgress } from '../services/gamificationService';
import { saveStoryToOffline, getAllOfflineStories } from '../services/offlineService';
import { BookOpen, MapPin, Loader2, Sparkles, Sun, Trophy, X, Download, WifiOff, Check, Lock, Star, Globe } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

interface LibraryProps {
  onSelectStory: (story: Story) => void;
}

const FREE_STORY_LIMIT = 5;

const Library: React.FC<LibraryProps> = ({ onSelectStory }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [user, setUser] = useState<UserProgress | null>(null);
  const [showPassport, setShowPassport] = useState(false);
  
  // Paywall States
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Offline & Download States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedStoryTitles, setDownloadedStoryTitles] = useState<Set<string>>(new Set());
  const [downloadingStories, setDownloadingStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Load User
    setUser(getUserProgress());

    const initLibrary = async () => {
      setStatus('loading');
      try {
        const offlineStories = await getAllOfflineStories();
        const offlineTitles = new Set(offlineStories.map(s => s.title));
        setDownloadedStoryTitles(offlineTitles);

        let list: Story[] = [];
        if (navigator.onLine) {
          list = await generateStoryList();
        } else {
          list = offlineStories; 
        }

        if (list.length === 0 && navigator.onLine) {
           list = await generateStoryList();
        }
        
        setStories(list);
        setStatus('success');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    initLibrary();
  }, [isOnline]);

  const handleDownload = async (e: React.MouseEvent, story: Story) => {
    e.stopPropagation();
    if (downloadingStories.has(story.title) || downloadedStoryTitles.has(story.title)) return;

    setDownloadingStories(prev => new Set(prev).add(story.title));

    try {
      const pages = await generateStoryContent(story.title, story.region, story.summary);
      const pagesWithImages: StoryPage[] = [];
      for (const page of pages) {
        const imageUrl = await generatePageImage(page.visualDescription);
        pagesWithImages.push({
          ...page,
          imageUrl: imageUrl || undefined
        });
      }

      await saveStoryToOffline({
        ...story,
        pages: pagesWithImages,
        savedAt: Date.now()
      });

      setDownloadedStoryTitles(prev => new Set(prev).add(story.title));
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download story. Please try again.");
    } finally {
      setDownloadingStories(prev => {
        const next = new Set(prev);
        next.delete(story.title);
        return next;
      });
    }
  };

  const handleMockPurchase = async () => {
    setIsProcessingPayment(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedUser = upgradeToPremium();
    setUser(updatedUser);
    setIsProcessingPayment(false);
    setShowPaywall(false);
    
    canvasConfetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D8A859', '#AA4739', '#F6EBDD']
    });
  };

  const getAvatarIcon = (id: string) => AVATARS.find(a => a.id === id)?.icon || '🦁';

  return (
    <div className="w-full p-4 md:p-8 flex flex-col items-center relative min-h-screen bg-gather-brown overflow-x-hidden">
      
      {/* Background Ambience - Global Earthy Tones */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 pattern-dots opacity-5"></div>
         {/* Geometric ambient blurs */}
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gather-red rounded-full blur-[100px] opacity-20"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gather-gold rounded-full blur-[120px] opacity-10"></div>
         <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-gather-red-light rounded-full blur-[150px] opacity-10"></div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-gather-red text-white p-2 text-center z-50 flex items-center justify-center animate-slide-in shadow-lg font-bold">
           <WifiOff className="w-4 h-4 mr-2" />
           <span className="text-xs md:text-sm">Offline Mode: Only downloaded stories available.</span>
        </div>
      )}

      {/* Top Bar with Passport */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-10 relative z-20 mt-6">
         <div className="hidden md:block"></div> 
         
         {user && (
           <button 
             onClick={() => setShowPassport(true)}
             className="ml-auto flex items-center bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-full pl-2 pr-5 py-2 transition-all shadow-layer-1 group"
           >
             <div className="w-10 h-10 bg-gather-red rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-gather-brown mr-3 relative overflow-hidden">
               {getAvatarIcon(user.avatarId)}
               <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
             </div>
             <div className="text-left">
               <div className="text-[10px] text-gather-gold uppercase font-black tracking-wider">Traveler</div>
               <div className="text-gather-linen font-bold leading-none font-serif">{user.username}</div>
             </div>
           </button>
         )}
      </div>

      {/* Header */}
      <header className="relative w-full max-w-4xl text-center mb-16 z-20">
        <div className="relative inline-block mb-4">
           <Globe className="w-12 h-12 text-gather-gold animate-float drop-shadow-[0_0_15px_rgba(216,168,89,0.4)]" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black text-gather-linen drop-shadow-layer-2 mb-4 tracking-tight">
          World Library
        </h1>
        <p className="text-lg md:text-xl text-gather-linen/70 max-w-lg mx-auto font-comic">
          Stories gathered from every corner of the earth.
        </p>
      </header>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in z-20">
          <Loader2 className="w-16 h-16 text-gather-gold animate-spin mb-4" />
          <p className="text-xl text-gather-linen font-bold tracking-wide">Gathering the stories...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-20 bg-gather-red/30 rounded-3xl p-10 border border-white/10 mx-4 z-20">
          <p className="text-gather-gold text-xl font-bold">The path is hidden.</p>
          <p className="text-gather-linen/60 mt-2">Try refreshing to find your way.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl pb-20 relative z-20 px-4">
          {stories.map((story, index) => {
            const isRead = user?.readStoryIds.includes(story.title);
            const isDownloaded = downloadedStoryTitles.has(story.title);
            const isDownloading = downloadingStories.has(story.title);
            
            // PAYWALL LOGIC
            const isPremium = index >= FREE_STORY_LIMIT;
            const isLocked = isPremium && !user?.hasPremiumAccess;
            
            const isAvailable = (isOnline || isDownloaded) && !isLocked;

            return (
              <div 
                key={index}
                onClick={() => {
                  if (isLocked) {
                    setShowPaywall(true);
                  } else if (isAvailable) {
                    if (isRead) {
                        // Reset progress if re-reading a completed story
                        saveReadingProgress(story.title, 0);
                    }
                    onSelectStory(story);
                  }
                }}
                className={`group cursor-pointer relative transition-all duration-500 transform ${isAvailable ? 'hover:-translate-y-3' : 'opacity-80'}`}
              >
                {/* Back Layer (Shadow) */}
                <div className="absolute inset-0 bg-black/40 rounded-3xl transform translate-y-4 blur-md transition-transform group-hover:translate-y-6"></div>
                
                {/* Middle Layer (Red Frame) */}
                <div className={`absolute inset-0 rounded-3xl transform translate-y-1 translate-x-1 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform border border-white/5 pattern-dots ${isLocked ? 'bg-stone-800' : 'bg-gather-red'}`}></div>
                
                {/* Top Layer (The Card Content) - Linen Paper */}
                <div className={`relative rounded-3xl overflow-hidden shadow-layer-2 h-full flex flex-col border border-white/20 ${isLocked ? 'bg-stone-200 grayscale' : 'bg-gather-linen'}`}>
                  
                  {/* Image Area */}
                  <div className={`h-48 relative overflow-hidden transition-all duration-500 ${isLocked ? 'bg-stone-700' : 'bg-gather-brown-dark group-hover:h-52'}`}>
                     <img 
                       src={BACKGROUND_IMAGE_URL} 
                       alt="Story Cover"
                       className={`absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-700 ${!isLocked && 'group-hover:scale-110'}`}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-gather-brown via-transparent to-transparent opacity-90"></div>
                     
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`p-4 rounded-full backdrop-blur-sm border border-white/20 shadow-lg transition-transform duration-300 ${!isLocked && 'group-hover:scale-110'} ${isLocked ? 'bg-stone-800/80' : 'bg-gather-brown/40'}`}>
                           {isLocked ? (
                             <Lock className="w-8 h-8 text-white" />
                           ) : (
                             <BookOpen className={`w-8 h-8 ${isRead ? 'text-gather-gold' : 'text-gather-linen'}`} />
                           )}
                        </div>
                     </div>
                    
                    {isRead && (
                      <div className="absolute top-3 right-3 bg-gather-gold text-gather-brown-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20">
                        <Trophy className="w-3 h-3 mr-1" />
                        READ
                      </div>
                    )}

                    {isDownloaded && !isLocked && (
                      <div className="absolute bottom-3 right-3 bg-gather-red text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20">
                        <Check className="w-3 h-3 mr-1" />
                        SAVED
                      </div>
                    )}

                    {isLocked && (
                      <div className="absolute top-3 right-3 bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20">
                        <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                        PREMIUM
                      </div>
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <div className="p-6 flex flex-col flex-grow relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center text-xs font-black uppercase tracking-widest ${isLocked ? 'text-stone-500' : 'text-gather-red'}`}>
                                <MapPin className={`w-3 h-3 mr-1 ${isLocked ? 'text-stone-400' : 'text-gather-gold'}`} />
                                <span className="truncate max-w-[120px]">{story.region}</span>
                            </div>
                            
                            {isOnline && !isDownloaded && !isLocked && (
                                <button 
                                    onClick={(e) => handleDownload(e, story)}
                                    disabled={isDownloading}
                                    className="text-gather-brown/40 hover:text-gather-red transition-colors"
                                >
                                    {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                        
                        <h3 className={`text-2xl font-serif font-bold mb-3 leading-tight transition-colors ${isLocked ? 'text-stone-600' : 'text-gather-brown group-hover:text-gather-red'}`}>
                        {story.title}
                        </h3>
                        
                        <p className={`text-sm leading-relaxed mb-6 flex-grow line-clamp-3 font-comic font-medium ${isLocked ? 'text-stone-500' : 'text-gather-brown/80'}`}>
                        {story.summary}
                        </p>
                        
                        <button 
                            disabled={!isAvailable && !isLocked}
                            className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 mt-auto ${
                                isLocked 
                                  ? 'bg-stone-800 text-white hover:bg-black' 
                                  : 'bg-gather-brown text-gather-linen group-hover:bg-gather-gold group-hover:text-gather-brown-dark'
                            }`}
                        >
                            {isLocked 
                              ? 'Unlock Story' 
                              : (!isOnline && !isDownloaded ? 'Download Required' : (isRead ? 'Read Again' : 'Read Story'))
                            }
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passport Modal */}
      {showPassport && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gather-brown-dark/95 backdrop-blur-md" onClick={() => setShowPassport(false)}>
           <div 
             className="relative w-full max-w-2xl bg-gather-linen rounded-[2rem] overflow-hidden shadow-2xl animate-pop-in border-8 border-gather-red" 
             onClick={e => e.stopPropagation()}
           >
              <div className="bg-gather-red p-8 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 pattern-dots opacity-20"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-gather-gold rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl">
                     {getAvatarIcon(user.avatarId)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-white">{user.username}</h2>
                    <div className="text-gather-linen text-xs font-bold uppercase tracking-[0.2em] mt-1">Traveler ID No. 00{user.storiesRead}</div>
                    {user.hasPremiumAccess && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-500/20 rounded border border-yellow-500/40 text-yellow-300 text-[10px] font-bold uppercase tracking-wider">
                         <Star className="w-3 h-3 mr-1 fill-current" /> Premium Member
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowPassport(false)} className="relative z-10 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                 <h3 className="text-gather-brown font-serif font-bold text-xl mb-4 border-b-2 border-gather-brown/10 pb-2">Stamps & Badges</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {BADGES.map(badge => {
                      const isEarned = user.badgesEarned.includes(badge.id);
                      return (
                        <div key={badge.id} className={`flex flex-col items-center text-center p-4 rounded-xl border-2 border-dashed ${isEarned ? 'border-gather-red bg-gather-red/5' : 'border-stone-300 opacity-40'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${isEarned ? 'bg-gather-gold text-gather-brown shadow-md' : 'bg-stone-200 grayscale'}`}>
                             {badge.icon}
                           </div>
                           <span className="font-bold text-gather-brown text-xs">{badge.name}</span>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gather-brown/95 backdrop-blur-md" onClick={() => setShowPaywall(false)}>
           <div 
             className="relative w-full max-w-md bg-gradient-to-b from-gather-linen to-[#E8DCCB] rounded-[2rem] overflow-hidden shadow-2xl animate-pop-in border-4 border-gather-gold" 
             onClick={e => e.stopPropagation()}
           >
              <div className="p-8 text-center relative overflow-hidden">
                {/* Decorative Sparkles */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                
                <div className="w-20 h-20 bg-gradient-to-br from-gather-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 border-4 border-white">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-serif font-black text-gather-brown mb-2">Unlock the Full Library</h2>
                <p className="text-gather-brown-dark font-comic mb-8 text-sm leading-relaxed">
                  You've enjoyed the free tales. Unlock the remaining stories and all future additions to become a true Global Explorer.
                </p>

                <div className="bg-white/60 p-4 rounded-xl mb-8 border border-gather-gold/30">
                   <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gather-red">Lifetime Access</span>
                      <span className="font-black text-xl text-gather-gold">$4.99</span>
                   </div>
                   <div className="text-xs text-stone-500 text-left">
                     • Unlimited Stories<br/>
                     • Offline Downloads<br/>
                     • Support the Storytellers
                   </div>
                </div>

                <button 
                  onClick={handleMockPurchase}
                  disabled={isProcessingPayment}
                  className="w-full bg-gather-red text-white text-lg font-bold py-4 rounded-xl hover:bg-gather-red-light transition-all shadow-xl hover:shadow-red-500/30 hover:-translate-y-1 relative overflow-hidden"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <span>Unlock Now</span>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowPaywall(false)}
                  className="mt-4 text-stone-400 text-sm font-bold hover:text-gather-brown transition-colors"
                >
                  Maybe Later
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Library;