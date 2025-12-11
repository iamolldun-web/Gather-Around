import { Badge, UserProgress } from "../types";

const STORAGE_KEY = 'gather_user_progress';

export const AVATARS = [
  { id: 'lion', icon: '🦁', label: 'Brave Lion' },
  { id: 'elephant', icon: '🐘', label: 'Wise Elephant' },
  { id: 'zebra', icon: '🦓', label: 'Fast Zebra' },
  { id: 'giraffe', icon: '🦒', label: 'Tall Giraffe' },
  { id: 'rhino', icon: '🦏', label: 'Strong Rhino' },
  { id: 'leopard', icon: '🐆', label: 'Stealthy Leopard' },
];

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Read your first story.',
    icon: '👣',
    color: 'bg-green-500',
    condition: (p) => p.storiesRead >= 1
  },
  {
    id: 'village_listener',
    name: 'World Listener',
    description: 'Read 3 different stories.',
    icon: '👂',
    color: 'bg-blue-500',
    condition: (p) => p.readStoryIds.length >= 3
  },
  {
    id: 'storyteller',
    name: 'Master Storyteller',
    description: 'Read 5 stories.',
    icon: '📚',
    color: 'bg-purple-500',
    condition: (p) => p.storiesRead >= 5
  },
  {
    id: 'historian',
    name: 'History Keeper',
    description: 'Completed 10 stories.',
    icon: '👑',
    color: 'bg-gather-gold',
    condition: (p) => p.storiesRead >= 10
  },
  {
    id: 'explorer',
    name: 'Global Explorer',
    description: 'Read stories from 3 different regions.',
    icon: '🌍',
    color: 'bg-gather-red',
    // Logic simplified for demo, ideally tracks regions
    condition: (p) => p.storiesRead >= 7 
  }
];

export const getUserProgress = (): UserProgress | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    // Migration for existing users who might lack the new field
    if (parsed.hasPremiumAccess === undefined) {
      parsed.hasPremiumAccess = false;
    }
    // Migration for storyProgress
    if (parsed.storyProgress === undefined) {
      parsed.storyProgress = {};
    }
    return parsed;
  }
  return null;
};

export const saveUserProgress = (progress: UserProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const createProfile = (username: string, avatarId: string): UserProgress => {
  const newUser: UserProgress = {
    username,
    avatarId,
    storiesRead: 0,
    readStoryIds: [],
    badgesEarned: [],
    hasPremiumAccess: false,
    storyProgress: {}
  };
  saveUserProgress(newUser);
  return newUser;
};

export const upgradeToPremium = (): UserProgress | null => {
  const progress = getUserProgress();
  if (progress) {
    progress.hasPremiumAccess = true;
    saveUserProgress(progress);
    return progress;
  }
  return null;
};

// Returns newly earned badges if any
export const completeStory = (storyTitle: string): Badge[] => {
  const progress = getUserProgress();
  if (!progress) return [];

  // Update stats
  const newProgress = { ...progress };
  newProgress.storiesRead += 1;
  if (!newProgress.readStoryIds.includes(storyTitle)) {
    newProgress.readStoryIds.push(storyTitle);
  }

  // Check badges
  const newBadges: Badge[] = [];
  BADGES.forEach(badge => {
    if (!newProgress.badgesEarned.includes(badge.id)) {
      if (badge.condition(newProgress)) {
        newProgress.badgesEarned.push(badge.id);
        newBadges.push(badge);
      }
    }
  });

  saveUserProgress(newProgress);
  return newBadges;
};

export const saveReadingProgress = (storyTitle: string, pageIndex: number) => {
  const user = getUserProgress();
  if (user) {
    if (!user.storyProgress) user.storyProgress = {};
    user.storyProgress[storyTitle] = pageIndex;
    saveUserProgress(user);
  }
};

export const getReadingProgress = (storyTitle: string): number => {
  const user = getUserProgress();
  return user?.storyProgress?.[storyTitle] || 0;
};