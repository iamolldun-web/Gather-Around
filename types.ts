
export interface StoryPage {
  text: string;
  visualDescription: string;
  historyFact: string;
  imageUrl?: string; // Base64 string or URL
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

export interface Treasure {
  id: string;
  message: string;
  unlockedAt: number;
  storyTitle: string; // The story that unlocked this
}

export interface CollectedCharacter {
  id: string;
  name: string;
  storyTitle: string; // Origin story
  unlockedAt: number;
  icon: string; // Emoji representation
  imageUrl?: string; // The generated paper-art image
}

export interface Bookmark {
  storyTitle: string;
  pageIndex: number;
  excerpt: string;
  timestamp: number;
}

export interface UserProgress {
  username: string;
  avatarId: string; // 'lion', 'elephant', 'sun', etc.
  customAvatar?: string; // Base64 string of uploaded/captured image
  storiesRead: number;
  readStoryIds: string[]; // Track unique stories
  badgesEarned: string[]; // Badge IDs
  treasures: Treasure[]; // Collected inspirational messages
  collectedCharacters: CollectedCharacter[]; // Rare drops
  bookmarks: Bookmark[]; // Saved pages
  hasPremiumAccess: boolean; // Tracks if user paid the $4.99
  hasSharedApp: boolean; // Tracks if user has shared the app
  storyProgress: { [key: string]: number }; // Maps story title to current page index
}

export interface StoryRewards {
  badges: Badge[];
  treasure: Treasure;
  character: CollectedCharacter | null;
}

export interface OfflineStory extends Story {
  pages: StoryPage[];
  savedAt: number;
}
