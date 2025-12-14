import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Story, StoryPage, LoadingState } from '../types';
import { generateStoryContent, generatePageImage, generateSpeech, generateHistoryImage } from '../services/geminiService';
import { decodeAudioData } from '../services/audioUtils';
import { getOfflineStory, saveCustomStoryImage, getCustomStoryImage, deleteCustomStoryImage } from '../services/offlineService';
import { getReadingProgress, saveReadingProgress, toggleBookmark, isBookmarked } from '../services/gamificationService';
import { 
  ArrowLeft, ArrowRight, Home, Volume2, 
  Lightbulb, Loader2, VolumeX, ImageIcon, X, Play, Pause,
  Sparkles, Headphones, CheckCircle, WifiOff, Bookmark, ImagePlus, Upload, Trash2, Camera
} from 'lucide-react';

interface BookReaderProps {
  story: Story;
  onBack: () => void;
  onComplete: () => void;
  initialPage?: number;
}

const BookReader: React.FC<BookReaderProps> = ({ story, onBack, onComplete, initialPage }) => {
  const [pages, setPages] = useState<StoryPage[]>([]);
  // Initialize current page from saved progress or optional initialPage
  const [currentPage, setCurrentPage] = useState(() => {
    if (initialPage !== undefined && initialPage >= 0) {
      return initialPage;
    }
    return getReadingProgress(story.title);
  });
  
  const [loadingStatus, setLoadingStatus] = useState<LoadingState>('loading');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Custom Image State
  const [showImageControls, setShowImageControls] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Transition State
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // History Image States
  const [historyImage, setHistoryImage] = useState<string | null>(null);
  const [isHistoryImageLoading, setIsHistoryImageLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Bookmark State
  const [isPageBookmarked, setIsPageBookmarked] = useState(false);
  
  // Completion State
  const [isFinished, setIsFinished] = useState(false);
  const [isOfflineStory, setIsOfflineStory] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Swipe Gesture Refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const minSwipeDistance = 60; // Minimum distance to trigger swipe
  const maxSwipeTime = 500; // Maximum time (ms) for a swipe to be considered valid (filters out slow scrolls/drags)

  // Initialize Audio Context lazily
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // 0. Save Progress & Check Bookmark Effect
  useEffect(() => {
    saveReadingProgress(story.title, currentPage);
    setIsPageBookmarked(isBookmarked(story.title, currentPage));
  }, [currentPage, story.title]);

  // 1. Fetch Story Content on Mount (Check Offline First)
  useEffect(() => {
    let mounted = true;
    const loadContent = async () => {
      try {
        setLoadingStatus('loading');
        
        // Try loading from IndexedDB first
        const offlineData = await getOfflineStory(story.title);
        
        if (offlineData && offlineData.pages) {
          if (mounted) {
            setPages(offlineData.pages);
            setIsOfflineStory(true);
            setLoadingStatus('success');
          }
          return;
        }

        // Fallback to API/Service generation (which handles static content)
        const content = await generateStoryContent(story.title, story.region, story.summary);
        if (mounted) {
          setPages(content);
          setLoadingStatus('success');
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoadingStatus('error');
      }
    };
    loadContent();
    return () => { mounted = false; };
  }, [story.title, story.region, story.summary]);

  // Safety check for page index after pages load
  useEffect(() => {
    if (loadingStatus === 'success' && pages.length > 0 && currentPage >= pages.length) {
      setCurrentPage(0);
    }
  }, [loadingStatus, pages.length, currentPage]);

  // 3. Audio Handling (Moved up to fix block-scoped variable usage)
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { /* ignore */ }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
    setAudioLoading(false);
  }, []);

  // Update playback rate dynamically
  useEffect(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);

  const playAudio = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!pages[currentPage]) return;
    
    // Check connectivity for TTS if not stored (we aren't storing audio offline yet in this version)
    if (!navigator.onLine) {
      alert("Voice narration is currently only available online.");
      return;
    }

    try {
      setAudioLoading(true);
      const ctx = getAudioContext();
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const base64Audio = await generateSpeech(pages[currentPage].text);
      if (base64Audio) {
        if (audioSourceRef.current) { stopAudio(); }

        const buffer = await decodeAudioData(base64Audio, ctx);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRate;
        source.connect(ctx.destination);
        source.onended = () => {
            setIsPlaying(false);
            setAudioLoading(false);
        };
        source.start(0);
        audioSourceRef.current = source;
        setIsPlaying(true);
      }
      setAudioLoading(false);
    } catch (e) {
      console.error("Audio playback error", e);
      setIsPlaying(false);
      setAudioLoading(false);
    }
  }, [currentPage, pages, isPlaying, playbackRate, stopAudio]);

  // 2. Load Image when page changes
  useEffect(() => {
    let mounted = true;
    const loadImage = async () => {
      if (!pages[currentPage]) return;
      
      try {
        // Reset states
        setImageLoading(true);
        setCurrentImage(null);
        setHasCustomImage(false); // Reset custom image flag
        setShowImageControls(false); // Hide controls on page flip
        stopAudio(); // Stop audio from previous page
        
        setHistoryImage(null);
        setShowHistoryModal(false);
        setIsHistoryImageLoading(false);

        // A. Check for CUSTOM USER IMAGE first in our "backend" (IndexedDB)
        const customImg = await getCustomStoryImage(story.title, currentPage);
        if (customImg) {
            if (mounted) {
                setCurrentImage(customImg);
                setHasCustomImage(true);
                setImageLoading(false);
            }
            return;
        }

        // B. Check if story came from Offline Store (has default images saved)
        if (pages[currentPage].imageUrl) {
          if (mounted) {
              setCurrentImage(pages[currentPage].imageUrl!);
              setImageLoading(false);
          }
          return;
        }

        // C. Fallback: Get hardcoded URL from service
        const img = await generatePageImage(pages[currentPage].visualDescription);
        
        if (mounted) {
          setCurrentImage(img);
        }
      } catch (e) {
        console.error("Failed to load image", e);
      } finally {
        if (mounted) {
          setImageLoading(false);
        }
      }
    };

    if (loadingStatus === 'success') {
      loadImage();
    }
    return () => { mounted = false; };
  }, [currentPage, loadingStatus, pages, stopAudio, story.title]);

  const handleCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImageLoading(true);
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            if (base64) {
                // Save to offline storage ("backend folder")
                await saveCustomStoryImage(story.title, currentPage, base64);
                setCurrentImage(base64);
                setHasCustomImage(true);
                setShowImageControls(false); // Hide menu
            }
            setImageLoading(false);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleResetImage = async () => {
      if (confirm("Remove your custom image and show the original?")) {
          setImageLoading(true);
          await deleteCustomStoryImage(story.title, currentPage);
          
          // Reload original
          setHasCustomImage(false);
          let originalImg: string | undefined = undefined;
          
          // Try from page data first
          if (pages[currentPage].imageUrl) {
              originalImg = pages[currentPage].imageUrl;
          } else {
              // Fetch default
              originalImg = await generatePageImage(pages[currentPage].visualDescription);
          }
          
          if (originalImg) setCurrentImage(originalImg);
          setImageLoading(false);
          setShowImageControls(false);
      }
  };

  // Auto Play Effect
  useEffect(() => {
    if (autoPlay && loadingStatus === 'success' && !imageLoading && !isPlaying) {
        const timer = setTimeout(() => {
            playAudio();
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [currentPage, autoPlay, loadingStatus, imageLoading, playAudio]);

  // 4. History Image Handling
  const handleHistoryImage = async () => {
    if (historyImage) {
      setShowHistoryModal(true);
      return;
    }
    if (!pages[currentPage]) return;

    try {
      setIsHistoryImageLoading(true);
      const img = await generateHistoryImage(pages[currentPage].historyFact);
      if (img) {
        setHistoryImage(img);
        setShowHistoryModal(true);
      }
    } catch (e) {
      console.error("Error generating history image", e);
    } finally {
      setIsHistoryImageLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!pages[currentPage]) return;
    const text = pages[currentPage].text;
    const excerpt = text.length > 40 ? text.substring(0, 40) + '...' : text;
    toggleBookmark(story.title, currentPage, excerpt);
    setIsPageBookmarked(!isPageBookmarked);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setDirection('next');
      stopAudio();
      setCurrentPage(p => p + 1);
    } else {
      // Finished story
      setIsFinished(true);
      onComplete(); // Trigger badge check
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection('prev');
      stopAudio();
      setCurrentPage(p => p - 1);
    }
  };

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const timeElapsed = Date.now() - (touchStartTime.current || 0);

    // Filter out slow gestures (reading selection / scroll)
    if (timeElapsed > maxSwipeTime) return;
    
    // Check vertical threshold to prevent accidental swipes during scrolling
    if (touchStartY.current && touchEndY.current) {
        const distanceY = touchStartY.current - touchEndY.current;
        // If vertical movement is greater than horizontal, assume scrolling
        if (Math.abs(distanceY) > Math.abs(distanceX)) return;
    }
    
    // Check if it's a significant swipe
    if (Math.abs(distanceX) < minSwipeDistance) return;

    if (distanceX > 0) {
      // Swiped Left -> Next Page
      handleNext();
    } else {
      // Swiped Right -> Prev Page
      handlePrev();
    }
  };

  if (loadingStatus === 'loading') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gather-purple relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        <Loader2 className="w-16 h-16 text-white animate-spin mb-6 relative z-10" />
        <h2 className="text-2xl font-bold text-white relative z-10 font-serif">Weaving the story...</h2>
        <p className="text-white/60 mt-2 relative z-10 animate-pulse">The circle is gathering</p>
      </div>
    );
  }

  if (loadingStatus === 'error') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gather-purple p-4">
        <div className="bg-white p-8 rounded-3xl border-4 border-gather-red text-center max-w-md shadow-2xl w-full">
          <p className="text-gather-red text-xl mb-4 font-bold">The story threads have tangled.</p>
          {!navigator.onLine && (
             <p className="text-stone-500 mb-6">It looks like you are offline and this story hasn't been downloaded yet.</p>
          )}
          <button onClick={onBack} className="bg-gather-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg uppercase tracking-wider w-full sm:w-auto">
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isFinished) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gather-purple relative overflow-hidden p-4">
         <div className="absolute inset-0 pattern-weave opacity-20"></div>
         <div className="relative z-10 bg-gather-gold p-8 md:p-10 rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl border-4 border-white animate-pop-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
               <CheckCircle className="w-12 h-12 text-gather-gold" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gather-brown mb-4">Story Complete!</h2>
            <p className="text-gather-brown/80 font-comic mb-8 font-bold">
              You have journeyed through "{story.title}" and gained its wisdom.
            </p>
            <button 
              onClick={onBack}
              className="w-full bg-white text-gather-brown text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-stone-50 transition-all hover:-translate-y-1"
            >
              Return to Library
            </button>
         </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="h-[100dvh] w-full flex flex-col p-2 md:p-6 relative bg-gather-purple overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-64 h-64 bg-gather-violet rounded-full blur-[80px] opacity-20 -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gather-pink rounded-full blur-[100px] opacity-10 -z-10"></div>

      {/* Navigation Header */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4 md:mb-6 max-w-7xl mx-auto w-full relative z-20">
        <div className="flex items-center gap-2">
            <button 
                onClick={onBack}
                className="flex items-center text-white bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 rounded-full transition-all font-bold border border-white/20"
            >
                <Home className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Gather Around</span>
            </button>
            
            {/* Bookmark Toggle */}
            <button 
                onClick={handleToggleBookmark}
                className={`flex items-center justify-center p-2 rounded-full transition-all border ${isPageBookmarked ? 'bg-gather-gold border-gather-gold text-white' : 'bg-white/10 text-white/50 border-white/20 hover:bg-white/20'}`}
                title={isPageBookmarked ? "Remove Bookmark" : "Bookmark this page"}
            >
                <Bookmark className={`w-5 h-5 ${isPageBookmarked ? 'fill-current' : ''}`} />
            </button>
        </div>
        
        {/* Story Title Badge */}
        <div className="hidden md:flex items-center space-x-2 bg-black/20 px-6 py-2 rounded-full border border-white/10 shadow-lg backdrop-blur-md max-w-md truncate">
           <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${isOfflineStory ? 'bg-gather-green' : 'bg-gather-gold'}`}></span>
           <span className="text-white font-serif italic tracking-wide text-sm truncate">{story.title}</span>
           {isOfflineStory && <WifiOff className="w-3 h-3 text-gather-green ml-1 flex-shrink-0" />}
        </div>

        {/* Auto Play Toggle */}
        <button 
          onClick={() => setAutoPlay(!autoPlay)}
          className={`flex items-center px-3 md:px-4 py-2 rounded-full transition-all border ${
            autoPlay 
              ? 'bg-gather-gold text-gather-brown border-gather-gold shadow-[0_0_15px_rgba(253,203,110,0.4)]' 
              : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20'
          }`}
        >
          <Headphones className={`w-4 h-4 mr-2 ${autoPlay ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {autoPlay ? 'Read: ON' : 'Read'}
          </span>
        </button>
      </div>

      {/* Book Stage */}
      <div className="flex-grow flex items-center justify-center relative w-full perspective-book min-h-0">
        
        {/* The Frame Container */}
        <div 
            className="w-full h-full max-h-full max-w-6xl pattern-weave p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col touch-pan-y bg-white/10 backdrop-blur-sm border border-white/10"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            
            {/* The Book Pages Container */}
            <div 
                key={currentPage} 
                className={`w-full flex-grow bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative z-10 border-4 border-stone-100 shadow-inner md:aspect-[2/1] ${
                    direction === 'next' ? 'animate-book-flip-next' : 'animate-book-flip-prev'
                }`}
                style={{ animationFillMode: 'backwards' }}
            >
            
            {/* Left Page (Visual) - Top on Mobile */}
            <div className="w-full h-48 md:h-full md:w-1/2 bg-stone-50 relative overflow-hidden flex items-center justify-center p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-stone-100 flex-shrink-0 group/image">
                {/* Decorative corner pattern */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gather-blue/5 rounded-br-[4rem] pointer-events-none"></div>
                
                {/* CUSTOM IMAGE CONTROLS */}
                <div className="absolute top-4 right-4 z-30">
                    <button 
                        onClick={() => setShowImageControls(!showImageControls)}
                        className={`bg-white/80 backdrop-blur text-stone-600 p-2 rounded-full shadow-lg hover:bg-white transition-all ${showImageControls ? 'ring-2 ring-gather-blue' : 'opacity-0 group-hover/image:opacity-100'}`}
                        title="Customize Image"
                    >
                        <ImagePlus className="w-5 h-5" />
                    </button>
                    
                    {showImageControls && (
                        <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl p-2 flex flex-col gap-2 min-w-[140px] animate-pop-in border border-stone-100">
                            <label className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-lg cursor-pointer text-sm font-bold text-stone-600 transition-colors">
                                <Upload className="w-4 h-4 text-gather-blue" />
                                <span>Upload</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleCustomImageUpload} />
                            </label>
                            
                            {hasCustomImage && (
                                <button 
                                    onClick={handleResetImage}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg cursor-pointer text-sm font-bold text-red-500 transition-colors w-full text-left"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {imageLoading ? (
                <div className="text-center flex flex-col items-center animate-fade-in scale-75 md:scale-100">
                    <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-gather-blue border-t-gather-sky rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-stone-400 font-bold font-serif italic animate-pulse">The artist is painting...</p>
                </div>
                ) : currentImage ? (
                <div 
                  key={`img-${currentPage}`}
                  className="relative w-full h-full md:p-2 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] rounded-xl transform md:rotate-1 transition-transform hover:rotate-0 duration-700 animate-pop-in"
                >
                    <img 
                      src={currentImage} 
                      alt={currentPageData?.visualDescription}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {hasCustomImage && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm flex items-center">
                            <Camera className="w-3 h-3 mr-1" /> Your Photo
                        </div>
                    )}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 pointer-events-none rounded-lg mix-blend-multiply"></div>
                </div>
                ) : (
                <div className="text-stone-300 italic flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                    <span className="text-xs">Image unavailable</span>
                </div>
                )}
            </div>

            {/* Right Page (Text & Interaction) - Bottom on Mobile */}
            <div className="w-full md:w-1/2 flex flex-col bg-white relative h-full overflow-hidden">
                {/* Top decorative pattern */}
                <svg className="absolute top-0 left-0 w-full h-4 opacity-10 z-0" preserveAspectRatio="none">
                    <pattern id="pattern-zigzag" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 20 L10 0 L20 20" fill="none" stroke="#6c5ce7" strokeWidth="2"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#pattern-zigzag)"/>
                </svg>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-grow overflow-y-auto p-6 md:p-10 relative z-10 custom-scrollbar">
                  {/* Text Animation */}
                  <div className="relative mb-8">
                     <span className="absolute -top-4 -left-2 text-6xl text-gather-gold/40 font-serif">“</span>
                     <p 
                        key={`text-${currentPage}`}
                        className="font-serif text-lg md:text-2xl lg:text-3xl leading-relaxed text-gather-brown drop-shadow-sm font-medium animate-slide-in opacity-0"
                        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                     >
                        {currentPageData?.text}
                     </p>
                  </div>

                  {/* History Fact Note */}
                  <div 
                      key={`history-${currentPage}`}
                      className="animate-fade-up bg-blue-50 p-4 rounded-xl border-l-4 border-gather-blue relative shadow-sm transform transition-all hover:translate-x-1 opacity-0 mb-4"
                      style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
                  >
                      <div className="flex items-start">
                      <div className="bg-white p-2 rounded-full mr-3 mt-1 flex-shrink-0 shadow-sm">
                          <Lightbulb className="w-4 h-4 text-gather-blue" />
                      </div>
                      <div className="flex-grow">
                          <h4 className="font-bold text-gather-blue text-xs uppercase mb-1 tracking-widest flex items-center gap-2">
                              Did you know?
                          </h4>
                          <p className="text-gather-brown text-sm leading-snug font-comic">
                            {currentPageData?.historyFact}
                          </p>
                          <button 
                            onClick={handleHistoryImage}
                            disabled={isHistoryImageLoading}
                            className="mt-3 inline-flex items-center text-xs font-bold text-gather-blue hover:text-gather-brown transition-colors bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm disabled:opacity-50"
                          >
                            {isHistoryImageLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <ImageIcon className="w-3 h-3 mr-1"/>}
                            See Picture
                          </button>
                      </div>
                      </div>
                  </div>
                </div>

                {/* FIXED CONTROLS AREA */}
                <div className="flex-shrink-0 p-4 md:p-6 border-t border-stone-100 bg-white z-20">
                    <div className="flex flex-row items-center justify-between gap-3">
                        {/* Audio Controls */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button 
                            onClick={playAudio}
                            disabled={audioLoading}
                            className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-md transform active:scale-95 ${
                                isPlaying 
                                ? 'bg-gather-gold text-white ring-4 ring-yellow-100' 
                                : 'bg-gather-red text-white hover:bg-gather-red-light'
                            }`}
                            >
                            {audioLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />
                            )}
                            </button>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button 
                                onClick={handlePrev}
                                disabled={currentPage === 0}
                                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold border border-stone-200"
                            >
                                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            
                            <span className="font-serif italic text-stone-400 text-xs md:text-sm w-12 text-center">
                                {currentPage + 1} / {pages.length}
                            </span>

                            <button 
                                onClick={handleNext}
                                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white transition-all shadow-lg active:scale-95 ${
                                  currentPage === pages.length - 1 
                                    ? 'bg-gather-gold shadow-yellow-200 hover:scale-110' 
                                    : 'bg-gather-blue hover:bg-gather-sky shadow-blue-200 hover:animate-page-flip-btn'
                                }`}
                            >
                                {currentPage === pages.length - 1 ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>

        {/* Progress Beads */}
        <div className="absolute -bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm z-30 mb-2">
             {pages.map((_, idx) => (
                 <div 
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                        idx === currentPage 
                            ? 'bg-gather-gold w-3 h-3 md:w-4 md:h-4 shadow-[0_0_10px_#fdcb6e]' 
                            : idx < currentPage 
                                ? 'bg-gather-sky w-2 h-2 md:w-3 md:h-3' 
                                : 'bg-white/20 w-2 h-2 md:w-3 md:h-3'
                    }`}
                 ></div>
             ))}
        </div>

        {/* Modal */}
        {showHistoryModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          >
            <div 
              className="bg-white rounded-3xl p-3 max-w-lg w-full relative animate-pop-in shadow-2xl border-4 border-gather-blue"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-stone-50 rounded-[1.25rem] p-4 md:p-6 relative overflow-hidden">
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full hover:bg-stone-100 text-stone-600 transition-colors z-20 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="rounded-xl overflow-hidden mb-5 bg-stone-200 aspect-video shadow-inner relative border-4 border-white max-h-[40vh]">
                  {historyImage ? (
                    <img 
                      src={historyImage} 
                      alt="Historical Fact Illustration" 
                      className="w-full h-full object-contain md:object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full flex-col">
                       <Loader2 className="w-8 h-8 text-gather-blue animate-spin mb-2" />
                       <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Consulting the archives...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start relative z-10 max-h-[30vh] overflow-y-auto">
                   <div className="bg-gather-blue p-2 rounded-lg mr-3 shadow-md flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h4 className="font-bold text-gather-blue text-xs uppercase mb-1 tracking-widest">Historical Context</h4>
                      <p className="text-gather-brown text-sm md:text-lg leading-relaxed font-serif">
                        {currentPageData?.historyFact}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookReader;