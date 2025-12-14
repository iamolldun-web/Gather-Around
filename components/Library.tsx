import React, { useEffect, useState, useRef } from 'react';
import { Story, LoadingState, UserProgress, StoryPage } from '../types';
import { generateStoryList, generateStoryContent, generatePageImage, BACKGROUND_IMAGE_URL, STORY_CATALOG } from '../services/geminiService';
import { getUserProgress, BADGES, REGION_BADGES, AVATARS, upgradeToPremium, saveReadingProgress, updateUserProfile, shareApp } from '../services/gamificationService';
import { saveStoryToOffline, getAllOfflineStories } from '../services/offlineService';
import { BookOpen, MapPin, Loader2, Sun, Trophy, X, Download, WifiOff, Check, Lock, Star, Globe, ExternalLink, Gem, Scroll, Map, User, Gift, Heart, Coffee, Search, Edit2, Save, Bookmark, Plane, ChevronRight, Share2, Camera, Upload, ImagePlus, Trash2 } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import BadgeNotification from './BadgeNotification';

// Using Stripe's public demo key for frontend testing/rendering
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface LibraryProps {
  onSelectStory: (story: Story, initialPage?: number) => void;
}

const Library: React.FC<LibraryProps> = ({ onSelectStory }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [user, setUser] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [showPassport, setShowPassport] = useState(false);
  const [passportTab, setPassportTab] = useState<'passport' | 'treasures' | 'bookmarks'>('passport');
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // New Badge Notification State
  const [earnedBadge, setEarnedBadge] = useState<any | null>(null);
  
  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | undefined>(undefined);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Offline & Download States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedStoryTitles, setDownloadedStoryTitles] = useState<Set<string>>(new Set());
  const [downloadingStories, setDownloadingStories] = useState<Set<string>>(new Set());

  // Check for successful payment return URL parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment') === 'success') {
      const updatedUser = upgradeToPremium();
      setUser(updatedUser);
      setShowSupportModal(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FDCB6E', '#FF6B6B', '#F5F6FA']
      });
    }
  }, []);

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

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          alert("Could not access camera. Please check permissions.");
          setIsCameraOpen(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const handleCameraCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Get base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCustomAvatarPreview(dataUrl);
        setIsCameraOpen(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      canvasConfetti({
        particleCount: 30,
        spread: 50,
        origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
        },
        colors: ['#FF6B6B', '#FDCB6E'],
        disableForReducedMotion: true,
        shapes: ['circle']
      });

    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download story. Please try again later.");
    } finally {
      setDownloadingStories(prev => {
        const next = new Set(prev);
        next.delete(story.title);
        return next;
      });
    }
  };

  const handleShareApp = async () => {
      const newBadge = await shareApp();
      // Refresh user to update state (e.g. hasSharedApp)
      setUser(getUserProgress());
      
      if (newBadge) {
          setEarnedBadge(newBadge);
      }
  };

  const handleDonationSuccess = () => {
     // Mock redirect/success
     const updatedUser = upgradeToPremium(); // Mark as supporter
     setUser(updatedUser);
     setShowSupportModal(false);
     canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
     alert("Thank you for your generous support! You are helping us grow.");
  };

  const handleSaveProfile = () => {
    if (tempUsername.trim()) {
        const updated = updateUserProfile(tempUsername, tempAvatar, customAvatarPreview);
        setUser(updated);
        setIsEditingProfile(false);
    }
  };

  const getAvatarIcon = (id: string) => AVATARS.find(a => a.id === id)?.icon || '🦁';

  // Helper to render current user avatar (custom or preset)
  const renderUserAvatar = (currentUser: UserProgress) => {
      if (currentUser.customAvatar) {
          return <img src={currentUser.customAvatar} alt="avatar" className="w-full h-full object-cover" />;
      }
      return getAvatarIcon(currentUser.avatarId);
  };

  const handleBookmarkClick = (bookmark: { storyTitle: string, pageIndex: number }) => {
      const story = stories.find(s => s.title === bookmark.storyTitle) || STORY_CATALOG.find(s => s.title === bookmark.storyTitle);
      if (story) {
          setShowPassport(false);
          onSelectStory(story, bookmark.pageIndex);
      } else {
          alert("Story not found.");
      }
  };

  // Filtered stories logic
  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inner Form Component for Stripe
  const StripeCheckoutForm: React.FC<{ onSuccess: () => void, onCancel: () => void }> = ({ onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [amount, setAmount] = useState<number>(5); // Default donation $5
    const [customAmount, setCustomAmount] = useState<string>('');

    const handleAmountChange = (val: number) => {
      setAmount(val);
      setCustomAmount('');
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomAmount(e.target.value);
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
          setAmount(val);
      }
    };

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setProcessing(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);

      if (cardElement) {
          const { error, paymentMethod } = await stripe.createPaymentMethod({
              type: 'card',
              card: cardElement,
          });

          if (error) {
              console.error('[Stripe Error]', error.message);
              setError(error.message || 'Payment failed');
              setProcessing(false);
          } else {
              console.log('[PaymentMethod]', paymentMethod, 'Amount:', amount);
              setTimeout(() => {
                  setProcessing(false);
                  onSuccess();
              }, 1500);
          }
      }
    };

    return (
      <div className="w-full">
          {/* Donation Presets */}
          <div className="flex gap-2 mb-4 justify-center">
              {[3, 5, 10].map((val) => (
                  <button
                      key={val}
                      type="button"
                      onClick={() => handleAmountChange(val)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                          amount === val && !customAmount
                              ? 'bg-gather-blue text-white border-gather-blue shadow-lg scale-105'
                              : 'bg-white text-stone-500 border-stone-200 hover:border-gather-blue/50'
                      }`}
                  >
                      ${val}
                  </button>
              ))}
              <div className={`flex-1 relative rounded-xl border-2 transition-all bg-white overflow-hidden flex items-center ${
                  customAmount ? 'border-gather-blue ring-2 ring-blue-100' : 'border-stone-200'
              }`}>
                  <span className="pl-3 text-stone-400 font-bold">$</span>
                  <input 
                      type="number" 
                      placeholder="Other"
                      value={customAmount}
                      onChange={handleCustomChange}
                      className="w-full h-full p-2 outline-none font-bold text-gather-brown bg-transparent"
                  />
              </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full animate-fade-in">
              <div className="mb-6 bg-white p-4 rounded-xl border border-stone-200 shadow-inner">
                  <CardElement 
                      options={{
                          style: {
                              base: {
                                  fontSize: '16px',
                                  color: '#2d3436',
                                  '::placeholder': {
                                      color: '#aab7c4',
                                  },
                                  fontFamily: '"Comic Neue", cursive',
                              },
                              invalid: {
                                  color: '#FF6B6B',
                              },
                          },
                      }}
                  />
              </div>
              
              {error && (
                  <div className="text-red-500 text-sm mb-4 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                      {error}
                  </div>
              )}

              <button 
                  type="submit" 
                  disabled={!stripe || processing || amount <= 0}
                  className="w-full bg-gather-red text-white text-lg font-bold py-4 rounded-xl hover:bg-gather-red-light transition-all shadow-lg hover:shadow-red-200/50 relative overflow-hidden active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  {processing ? (
                  <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </span>
                  ) : (
                  <span>❤️ Donate ${amount.toFixed(2)}</span>
                  )}
              </button>

              <p className="mt-4 text-[10px] text-stone-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secured by Stripe
              </p>

              <button 
                  type="button"
                  onClick={onCancel}
                  className="mt-4 w-full text-stone-400 text-sm font-bold hover:text-gather-blue transition-colors py-2"
              >
                  No thanks, I'll read for free
              </button>
          </form>
      </div>
    );
  };

  return (
    <div className="w-full p-4 md:p-8 flex flex-col items-center relative min-h-screen bg-gradient-to-br from-gather-sky via-gather-blue to-gather-purple overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 pattern-dots opacity-10"></div>
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gather-pink rounded-full blur-[100px] opacity-20"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gather-gold rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-white rounded-full blur-[150px] opacity-10"></div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-gather-red text-white p-2 text-center z-50 flex items-center justify-center animate-slide-in shadow-lg font-bold">
           <WifiOff className="w-4 h-4 mr-2" />
           <span className="text-xs md:text-sm">Offline Mode: Only downloaded stories available.</span>
        </div>
      )}

      {/* Top Bar with Passport and Treasure Chest */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-10 relative z-20 mt-6 px-4 md:px-0">
         {/* Left Side: Support Button & Share */}
         <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setShowSupportModal(true)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur text-white border border-white/40 px-4 md:px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gather-red hover:text-white hover:border-gather-red transition-all transform hover:scale-105 active:scale-95 group min-w-[140px] md:min-w-[160px] justify-center"
              >
                <Heart className={`w-4 h-4 fill-current ${user?.hasPremiumAccess ? 'text-gather-red group-hover:text-white' : 'animate-pulse text-white'}`} />
                <span className="text-xs md:text-sm">{user?.hasPremiumAccess ? 'Thanks!' : 'Support Us'}</span>
              </button>

              <button 
                onClick={handleShareApp}
                className="bg-white/20 backdrop-blur text-white border border-white/40 p-2 rounded-full hover:bg-white/40 transition-all hover:scale-105 active:scale-95"
                title="Share App"
              >
                <Share2 className="w-5 h-5" />
              </button>
         </div>
         
         {/* Right Side: Profile & Chest */}
         <div className="flex items-center gap-4">
            {user && (
              <>
               {/* 1. TREASURE CHEST BUTTON */}
               <button 
                 onClick={() => {
                    setPassportTab('treasures');
                    setShowPassport(true);
                 }}
                 className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full pl-2 pr-6 py-2 transition-all shadow-layer-1 group relative"
               >
                  <div className="w-10 h-10 bg-gradient-to-br from-gather-gold to-orange-400 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white mr-3">
                     💎
                  </div>
                  <div className="text-left">
                     <div className="text-[10px] text-white/80 uppercase font-black tracking-wider">Rewards</div>
                     <div className="text-white font-bold leading-none font-serif">Treasures</div>
                  </div>
                  {user.treasures.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gather-red text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {user.treasures.length + user.collectedCharacters.length}
                    </div>
                  )}
               </button>

               {/* 2. PROFILE BUTTON */}
               <button 
                 onClick={() => {
                    setPassportTab('passport');
                    setTempUsername(user.username);
                    setTempAvatar(user.avatarId);
                    setCustomAvatarPreview(user.customAvatar);
                    setIsEditingProfile(false);
                    setShowPassport(true);
                 }}
                 className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full pl-2 pr-6 py-2 transition-all shadow-layer-1 group"
               >
                 <div className="w-10 h-10 bg-gather-red rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white mr-3 relative overflow-hidden">
                   {renderUserAvatar(user)}
                 </div>
                 <div className="text-left hidden sm:block">
                   <div className="text-[10px] text-white/80 uppercase font-black tracking-wider">Traveler</div>
                   <div className="text-white font-bold leading-none font-serif">{user.username}</div>
                 </div>
               </button>
              </>
            )}
         </div>
      </div>

      {/* Header */}
      <header className="relative w-full max-w-4xl text-center mb-8 z-20">
        <div className="relative inline-block mb-4">
           <Globe className="w-12 h-12 text-gather-gold animate-float drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black text-white drop-shadow-layer-2 mb-4 tracking-tight">
          Gather Around
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto font-comic font-bold">
          Stories gathered from the vast savannahs to the deep oceans.
        </p>
      </header>

      {/* Search Bar */}
      <div className="w-full max-w-md mx-auto mb-12 relative z-20 animate-slide-in">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gather-gold group-focus-within:text-gather-yellow transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border-2 border-white/20 rounded-2xl leading-5 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all font-bold backdrop-blur-sm shadow-lg"
                placeholder="Search stories, regions, or cultures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in z-20">
          <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
          <p className="text-xl text-white font-bold tracking-wide">Gathering the stories...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-20 bg-white/10 rounded-3xl p-10 border border-white/20 mx-4 z-20 backdrop-blur-md">
          <p className="text-white text-xl font-bold">The path is hidden.</p>
          <p className="text-white/80 mt-2">Try refreshing to find your way.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl pb-20 relative z-20 px-4">
          {filteredStories.length === 0 ? (
             <div className="col-span-full text-center py-12 text-white/70 font-bold">
                 No stories found matching "{searchQuery}".
             </div>
          ) : (
            filteredStories.map((story, index) => {
                const isRead = user?.readStoryIds.includes(story.title);
                const isDownloaded = downloadedStoryTitles.has(story.title);
                const isDownloading = downloadingStories.has(story.title);
                const isAvailable = isOnline || isDownloaded;
                const isNew = !isRead && index < 3 && !searchQuery;

                return (
                <div 
                    key={index}
                    onClick={() => {
                    if (isAvailable) {
                        if (isRead) {
                            saveReadingProgress(story.title, 0);
                        }
                        onSelectStory(story);
                    }
                    }}
                    className={`group cursor-pointer relative transition-all duration-500 transform ${isAvailable ? 'hover:-translate-y-3' : 'opacity-80'}`}
                >
                    <div className="absolute inset-0 bg-black/20 rounded-3xl transform translate-y-4 blur-md transition-transform group-hover:translate-y-6"></div>
                    <div className="absolute inset-0 rounded-3xl transform translate-y-1 translate-x-1 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform border border-white/20 pattern-dots bg-gather-red"></div>
                    <div className="relative rounded-3xl overflow-hidden shadow-layer-2 h-full flex flex-col border border-white/50 bg-white">
                    
                    <div className="h-48 relative overflow-hidden transition-all duration-500 bg-gather-sky group-hover:h-52">
                        <img 
                        src={BACKGROUND_IMAGE_URL} 
                        alt="Story Cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gather-blue/50 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-4 rounded-full backdrop-blur-sm border border-white/40 shadow-lg transition-transform duration-300 group-hover:scale-110 bg-white/30">
                            <BookOpen className={`w-8 h-8 ${isRead ? 'text-gather-gold' : 'text-white'}`} />
                            </div>
                        </div>
                        {isRead && (
                        <div className="absolute top-3 right-3 bg-gather-gold text-gather-brown-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20">
                            <Trophy className="w-3 h-3 mr-1" />
                            READ
                        </div>
                        )}
                        {isDownloaded && (
                        <div className="absolute bottom-3 right-3 bg-gather-green text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20">
                            <Check className="w-3 h-3 mr-1" />
                            SAVED
                        </div>
                        )}
                        {isNew && (
                            <div className="absolute top-3 left-3 bg-gather-red text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center z-10 border border-white/20 animate-pulse">
                                NEW
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-xs font-black uppercase tracking-widest text-gather-red">
                                    <MapPin className="w-3 h-3 mr-1 text-gather-gold" />
                                    <span className="truncate max-w-[120px]">{story.region}</span>
                                </div>
                                {isOnline && !isDownloaded && (
                                    <button 
                                        onClick={(e) => handleDownload(e, story)}
                                        disabled={isDownloading}
                                        title="Download story for offline reading"
                                        className="group/dl flex items-center justify-center w-9 h-9 rounded-full bg-stone-50 border border-stone-200 shadow-sm hover:border-gather-red hover:shadow-md transition-all active:scale-90 z-20"
                                    >
                                        {isDownloading ? (
                                        <Loader2 className="w-4 h-4 text-gather-gold animate-spin" />
                                        ) : (
                                        <Download className="w-4 h-4 text-stone-400 group-hover/dl:text-gather-red transition-colors" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-3 leading-tight transition-colors text-gather-brown group-hover:text-gather-blue">
                            {story.title}
                            </h3>
                            <p className="text-sm leading-relaxed mb-6 flex-grow line-clamp-3 font-comic font-medium text-stone-500">
                            {story.summary}
                            </p>
                            <button 
                                disabled={!isAvailable}
                                className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 mt-auto bg-gather-brown text-white group-hover:bg-gather-gold group-hover:text-gather-brown-dark"
                            >
                                {!isOnline && !isDownloaded ? 'Download Required' : (isRead ? 'Read Again' : 'Read Story')}
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
                );
            })
          )}
        </div>
      )}

      {/* NEW PASSPORT LAYOUT */}
      {showPassport && user && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto" onClick={() => setShowPassport(false)}>
           <div 
             className="relative w-full max-w-5xl my-12 md:my-16 animate-pop-in flex flex-col" 
             onClick={e => e.stopPropagation()}
           >
              {/* Close Button - Floating Outside Top Right */}
              <button 
                onClick={() => setShowPassport(false)} 
                className="absolute -top-12 right-0 md:-right-4 text-white hover:text-gather-red transition-colors flex items-center gap-2 font-bold"
              >
                <span className="uppercase tracking-widest text-sm">Close</span>
                <div className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-6 h-6" /></div>
              </button>

              {/* TABS - NOW ABOVE THE CARD */}
              <div className="flex gap-2 px-4 md:px-8 relative z-10 translate-y-1">
                 {[
                    { id: 'passport', icon: <Map className="w-4 h-4" />, label: 'Passport', color: 'text-[#2c3e50]', bgActive: 'bg-[#ecf0f1]' },
                    { id: 'treasures', icon: <Gem className="w-4 h-4" />, label: 'Treasures', color: 'text-[#c0392b]', bgActive: 'bg-[#ecf0f1]' },
                    { id: 'bookmarks', icon: <Bookmark className="w-4 h-4" />, label: 'Bookmarks', color: 'text-[#f39c12]', bgActive: 'bg-[#ecf0f1]' }
                 ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setPassportTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md
                            ${passportTab === tab.id 
                                ? `${tab.bgActive} ${tab.color} scale-105 z-20 pb-4` 
                                : 'bg-[#34495e] text-slate-400 hover:bg-[#3e5871] hover:text-white mt-2'
                            }
                        `}
                    >
                        {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                 ))}
              </div>

              {/* MAIN CONTENT CARD */}
              <div className="bg-[#ecf0f1] rounded-3xl shadow-2xl min-h-[600px] border-8 border-[#34495e] flex flex-col relative z-0 overflow-hidden">
                 
                 {/* PASSPORT TAB */}
                 {passportTab === 'passport' && (
                    <div className="flex-grow flex flex-col md:flex-row h-full perspective-book">
                        
                        {/* LEFT PAGE: User ID */}
                        <div className="w-full md:w-[40%] bg-[#ecf0f1] relative p-6 md:p-10 border-b-2 md:border-b-0 md:border-r-2 border-[#bdc3c7] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                             
                             <div className="relative mb-6 group">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 shadow-md rotate-1 group-hover:rotate-0 transition-transform duration-500 border border-[#bdc3c7]">
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-6xl relative overflow-hidden">
                                        {isEditingProfile ? (
                                            customAvatarPreview ? <img src={customAvatarPreview} className="w-full h-full object-cover" /> : getAvatarIcon(tempAvatar)
                                        ) : (
                                            renderUserAvatar(user)
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setTempUsername(user.username);
                                        setTempAvatar(user.avatarId);
                                        setCustomAvatarPreview(user.customAvatar);
                                        setIsEditingProfile(!isEditingProfile);
                                    }}
                                    className="absolute -bottom-2 -right-2 bg-[#2c3e50] text-white p-2 rounded-full shadow-lg hover:bg-[#34495e] transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                             </div>

                             {isEditingProfile ? (
                                <div className="w-full animate-fade-in space-y-3 flex flex-col items-center">
                                    <input 
                                        type="text" 
                                        value={tempUsername}
                                        onChange={e => setTempUsername(e.target.value)}
                                        className="w-full text-center text-2xl font-serif font-bold bg-white border-b-2 border-blue-400 focus:outline-none p-1 mb-2"
                                        autoFocus
                                    />
                                    
                                    {/* Avatar Selection Grid */}
                                    <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto py-2 px-1 w-full border border-stone-200 rounded-lg custom-scrollbar">
                                        {AVATARS.map(a => (
                                            <button 
                                              key={a.id} 
                                              onClick={() => {
                                                setTempAvatar(a.id);
                                                setCustomAvatarPreview(undefined); // Clear custom if picking preset
                                              }} 
                                              className={`text-xl p-1 rounded hover:bg-gray-200 aspect-square flex items-center justify-center ${tempAvatar === a.id && !customAvatarPreview ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
                                              title={a.label}
                                            >
                                              {a.icon}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Upload Actions */}
                                    <div className="flex gap-2 w-full mt-1">
                                       <label className="flex-1 cursor-pointer bg-white border border-stone-300 hover:bg-stone-50 text-stone-600 rounded-lg py-2 flex items-center justify-center gap-1 text-xs font-bold transition-colors">
                                           <Upload className="w-3 h-3" /> Upload
                                           <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                       </label>
                                       <button 
                                         onClick={() => setIsCameraOpen(true)}
                                         className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-600 rounded-lg py-2 flex items-center justify-center gap-1 text-xs font-bold transition-colors"
                                       >
                                           <Camera className="w-3 h-3" /> Camera
                                       </button>
                                       {customAvatarPreview && (
                                           <button 
                                             onClick={() => setCustomAvatarPreview(undefined)}
                                             className="w-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200"
                                           >
                                               <Trash2 className="w-4 h-4" />
                                           </button>
                                       )}
                                    </div>

                                    <button onClick={handleSaveProfile} className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold w-full mt-2 shadow-md hover:bg-green-600">Save Changes</button>
                                </div>
                             ) : (
                                <>
                                    <h3 className="font-serif font-black text-2xl md:text-3xl text-[#2c3e50] mb-1">{user.username}</h3>
                                    <div className="text-xs font-bold text-[#7f8c8d] uppercase tracking-[0.2em] mb-6">World Traveler</div>
                                </>
                             )}

                             <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                                 <div className="bg-white p-3 border border-[#bdc3c7]">
                                     <div className="text-[10px] text-[#95a5a6] uppercase font-bold">Issued</div>
                                     <div className="text-sm font-mono font-bold text-[#2c3e50]">
                                         {new Date().toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                     </div>
                                 </div>
                                 <div className="bg-white p-3 border border-[#bdc3c7]">
                                     <div className="text-[10px] text-[#95a5a6] uppercase font-bold">Rank</div>
                                     <div className="text-sm font-mono font-bold text-[#2c3e50]">
                                         LVL {Math.floor(user.storiesRead / 3) + 1}
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* RIGHT PAGE: Stamps */}
                        <div className="w-full md:w-[60%] bg-[#fdfbf7] relative p-6 md:p-10 shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                            
                            <div className="flex items-center justify-between mb-8 border-b-2 border-[#e74c3c]/20 pb-2">
                                <h3 className="font-serif font-bold text-[#e74c3c] text-sm uppercase tracking-[0.2em]">Visas & Entry Stamps</h3>
                                <Plane className="w-5 h-5 text-[#e74c3c]/40 transform rotate-45" />
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {REGION_BADGES.map((badge) => {
                                    const isEarned = user.badgesEarned.includes(badge.id);
                                    const rotation = isEarned ? Math.floor(Math.random() * 30) - 15 : 0;
                                    return (
                                        <div key={badge.id} className="aspect-square relative flex items-center justify-center group">
                                            {isEarned ? (
                                                <div 
                                                    className={`relative w-full h-full border-4 border-double rounded-full flex flex-col items-center justify-center p-1 hover:scale-110 transition-transform cursor-help ${badge.color} border-current opacity-80 mix-blend-multiply`}
                                                    style={{ transform: `rotate(${rotation}deg)` }}
                                                    title={badge.name}
                                                >
                                                    <div className="text-3xl leading-none mb-1">{badge.icon}</div>
                                                    <div className="text-[8px] font-black uppercase text-center">{badge.name}</div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center opacity-30">
                                                    <div className="w-2 h-2 bg-stone-200 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                 )}

                 {/* TREASURES TAB */}
                 {passportTab === 'treasures' && (
                    <div className="p-6 md:p-10 space-y-8 animate-fade-in overflow-y-auto custom-scrollbar h-full bg-[#f8f9fa]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Achievements Section */}
                             <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm col-span-1 md:col-span-2">
                                <h3 className="font-serif font-black text-gather-brown mb-4 flex items-center gap-2 text-lg">
                                    <Trophy className="w-6 h-6 text-yellow-500" /> Achievements
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {BADGES.filter(b => !REGION_BADGES.includes(b)).map(badge => {
                                        const isEarned = user.badgesEarned.includes(badge.id);
                                        return (
                                            <div key={badge.id} className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${isEarned ? 'bg-blue-50 border-blue-200 scale-105 shadow-sm' : 'bg-stone-50 border-stone-100 opacity-40 grayscale'}`}>
                                                <div className="text-2xl mb-1">{badge.icon}</div>
                                                <div className="text-[10px] font-bold leading-tight">{badge.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>

                             {/* Character Collection */}
                             <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                                <h3 className="font-serif font-black text-gather-brown mb-4 flex items-center gap-2 text-lg">
                                    <User className="w-6 h-6 text-gather-red" /> Friends
                                    <span className="text-xs bg-stone-100 px-2 py-1 rounded-full text-stone-500">{user.collectedCharacters.length}</span>
                                </h3>
                                {user.collectedCharacters.length === 0 ? (
                                    <div className="text-center p-6 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 text-sm">No friends yet.</div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {user.collectedCharacters.map(char => (
                                            <div key={char.id} className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-center">
                                                <div className="aspect-square bg-white rounded-lg mb-1 overflow-hidden flex items-center justify-center text-2xl">
                                                    {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover"/> : char.icon}
                                                </div>
                                                <div className="text-[9px] font-bold truncate">{char.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>

                             {/* Scrolls */}
                             <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                                <h3 className="font-serif font-black text-gather-brown mb-4 flex items-center gap-2 text-lg">
                                    <Scroll className="w-6 h-6 text-gather-gold" /> Wisdom
                                </h3>
                                {user.treasures.length === 0 ? (
                                     <div className="text-center p-6 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 text-sm">No scrolls yet.</div>
                                ) : (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {[...user.treasures].reverse().map(t => (
                                            <div key={t.id} className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100 text-sm">
                                                <p className="italic text-gather-brown mb-1">"{t.message}"</p>
                                                <p className="text-[9px] text-stone-400 uppercase font-bold">{t.storyTitle}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                 )}

                 {/* BOOKMARKS TAB */}
                 {passportTab === 'bookmarks' && (
                    <div className="p-8 md:p-12 h-full overflow-y-auto custom-scrollbar bg-white">
                        <div className="text-center mb-8">
                            <h3 className="font-serif font-bold text-gather-brown text-2xl">Your Saved Pages</h3>
                            <p className="text-stone-400 mt-2">Jump back to your favorite moments</p>
                        </div>
                        {user.bookmarks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-stone-100 rounded-3xl bg-stone-50">
                                <Bookmark className="w-16 h-16 text-stone-200 mb-4" />
                                <p className="text-stone-400 font-bold">No bookmarks yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                                {user.bookmarks.map((b, i) => (
                                    <div key={i} onClick={() => handleBookmarkClick(b)} className="group cursor-pointer bg-white p-6 rounded-2xl border-2 border-stone-100 shadow-sm hover:border-gather-gold hover:shadow-md transition-all flex items-center gap-4">
                                        <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0">
                                            {b.pageIndex + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-lg text-gather-brown">{b.storyTitle}</h4>
                                            <p className="text-stone-500 italic text-sm line-clamp-1">"{b.excerpt}"</p>
                                        </div>
                                        <ChevronRight className="text-stone-300 group-hover:text-gather-gold" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 )}

              </div>
           </div>
        </div>
      )}

      {/* Camera Overlay Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-[80vh] bg-stone-900" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-8 items-center">
                 <button 
                   onClick={() => setIsCameraOpen(false)}
                   className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-bold hover:bg-white/30"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleCameraCapture}
                   className="w-20 h-20 bg-white rounded-full border-4 border-stone-300 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                 >
                    <div className="w-16 h-16 bg-white border-2 border-stone-800 rounded-full"></div>
                 </button>
            </div>
        </div>
      )}

      {/* Support / "Pay What You Want" Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowSupportModal(false)}>
           <div 
             className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-pop-in border-4 border-gather-red flex flex-col" 
             onClick={e => e.stopPropagation()}
           >
              {/* Header Image/Banner */}
              <div className="h-40 bg-gather-red relative overflow-hidden flex items-center justify-center flex-col text-white p-4 text-center">
                  <div className="absolute inset-0 pattern-weave opacity-20"></div>
                  <div className="z-10 bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/20 shadow-inner mb-3">
                    <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-serif font-black relative z-10">Support the Circle</h2>
              </div>

              <div className="p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                <p className="text-stone-600 font-comic mb-6 text-sm leading-relaxed font-bold">
                  Gather Around is free for all. Premium stories don’t require payment, but optional contributions help us share more cultures and create new stories for children everywhere. Any amount is appreciated, but never required.
                </p>

                {/* Stripe Elements with PWYW Logic */}
                <Elements stripe={stripePromise}>
                    <StripeCheckoutForm onSuccess={handleDonationSuccess} onCancel={() => setShowSupportModal(false)} />
                </Elements>
              </div>
           </div>
        </div>
      )}

      {/* Badge Notification (if earned during share) */}
      {earnedBadge && (
        <BadgeNotification badge={earnedBadge} onClose={() => setEarnedBadge(null)} />
      )}
    </div>
  );
};

export default Library;