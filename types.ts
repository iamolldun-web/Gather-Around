
export interface StoryPage {
  text: string;
  visualDescription: string;
  historyFact: string;
  imageUrl?: string; // Base64 string of the generated image
}

export interface Story {
  id: string; // Unique identifier for data logic
  assetId: number; // Numeric ID for mapping to "Picture X_Y.png" assets
  title: string;
  summary: string;
  region: string;
  pages?: StoryPage[];
}

export interface GeneratedImage {
  imageUrl: string;
}

export enum AppState {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  LIBRARY = 'LIBRARY',
  READING = 'READING',
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  condition: (progress: UserProgress) => boolean;
}

export interface UserProgress {
  username: string;
  avatarId: string; // 'lion', 'elephant', 'sun', etc.
  storiesRead: number;
  readStoryIds: string[]; // Track unique stories
  badgesEarned: string[]; // Badge IDs
  hasPremiumAccess: boolean; // Tracks if user paid the $4.99
  storyProgress: { [key: string]: number }; // Maps story title to current page index
}

export interface OfflineStory extends Story {
  pages: StoryPage[];
  savedAt: number;
}
