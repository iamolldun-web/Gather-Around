
import React, { useState, useEffect } from 'react';
import Library from './components/Library';
import BookReader from './components/BookReader';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import TreasureNotification from './components/TreasureNotification';
import { Story, AppState, Badge, Treasure, CollectedCharacter, StoryRewards } from './types';
import { getUserProgress, completeStory } from './services/gamificationService';

function App() {
  const [view, setView] = useState<AppState>(AppState.LANDING);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedStoryStartPage, setSelectedStoryStartPage] = useState<number | undefined>(undefined);
  
  // Reward State
  const [rewards, setRewards] = useState<StoryRewards | null>(null);

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

  const handleSelectStory = (story: Story, initialPage?: number) => {
    setSelectedStory(story);
    setSelectedStoryStartPage(initialPage);
    setView(AppState.READING);
  };

  const handleBackToLibrary = () => {
    setSelectedStory(null);
    setSelectedStoryStartPage(undefined);
    setView(AppState.LIBRARY);
  };

  const handleStoryComplete = async () => {
    if (selectedStory) {
      // Now async because we might generate a character image
      const results = await completeStory(selectedStory);
      setRewards(results);
    }
  };

  const handleCloseRewards = () => {
    setRewards(null);
    // Optional: Auto navigate back to library or stay on completion screen? 
    // Usually standard flow is Completion Screen -> User clicks Back -> Library. 
    // But the notification pops up over the completion screen.
  };

  return (
    <div className="min-h-screen flex flex-col items-center w-full">
      
      {/* Treasure/Reward Notification Overlay */}
      {rewards && (
        <TreasureNotification 
          badges={rewards.badges}
          treasure={rewards.treasure}
          character={rewards.character}
          onClose={handleCloseRewards} 
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
            initialPage={selectedStoryStartPage}
          />
        )}
      </div>
    </div>
  );
}

export default App;