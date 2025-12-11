
import React, { useState, useEffect } from 'react';
import Library from './components/Library';
import BookReader from './components/BookReader';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BadgeNotification from './components/BadgeNotification';
import { Story, AppState, Badge } from './types';
import { getUserProgress, completeStory } from './services/gamificationService';

function App() {
  const [view, setView] = useState<AppState>(AppState.LANDING);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    // Check if user exists to determine initial flow
    const user = getUserProgress();
    if (user) {
      // If user exists, but we are on initial load, we still might want to show landing
      // or jump to library. Let's keep Landing as start, but skip Onboarding.
    }
  }, []);

  const handleStart = () => {
    const user = getUserProgress();
    if (user) {
      setView(AppState.LIBRARY);
    } else {
      setView(AppState.ONBOARDING);
    }
  };

  const handleOnboardingComplete = () => {
    setView(AppState.LIBRARY);
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setView(AppState.READING);
  };

  const handleBackToLibrary = () => {
    setSelectedStory(null);
    setView(AppState.LIBRARY);
  };

  const handleStoryComplete = () => {
    if (selectedStory) {
      const earnedBadges = completeStory(selectedStory.title);
      if (earnedBadges.length > 0) {
        // Show the first new badge earned (simplify UI to show one at a time for now)
        setNewBadge(earnedBadges[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-ntalo-dark flex flex-col items-center">
      
      {/* Badge Notification Overlay */}
      {newBadge && (
        <BadgeNotification 
          badge={newBadge} 
          onClose={() => setNewBadge(null)} 
        />
      )}

      <div className="w-full max-w-[1600px] flex-grow flex flex-col">
        {view === AppState.LANDING && (
          <LandingPage onStart={handleStart} />
        )}

        {view === AppState.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {view === AppState.LIBRARY && (
          <Library onSelectStory={handleSelectStory} />
        )}
        
        {view === AppState.READING && selectedStory && (
          <BookReader 
            story={selectedStory} 
            onBack={handleBackToLibrary}
            onComplete={handleStoryComplete}
          />
        )}
      </div>
    </div>
  );
}

export default App;
