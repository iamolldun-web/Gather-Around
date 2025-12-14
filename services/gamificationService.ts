import { Badge, UserProgress, Treasure, CollectedCharacter, StoryRewards, Story, Bookmark } from "../types";
import { generateCharacterImage, STORY_CATALOG } from "./geminiService";

const STORAGE_KEY = 'gather_user_progress';

export const AVATARS = [
  // Original
  { id: 'lion', icon: '🦁', label: 'Brave Lion' },
  { id: 'elephant', icon: '🐘', label: 'Wise Elephant' },
  { id: 'zebra', icon: '🦓', label: 'Fast Zebra' },
  { id: 'giraffe', icon: '🦒', label: 'Tall Giraffe' },
  { id: 'rhino', icon: '🦏', label: 'Strong Rhino' },
  { id: 'leopard', icon: '🐆', label: 'Stealthy Leopard' },
  // Expanded
  { id: 'monkey', icon: '🐒', label: 'Playful Monkey' },
  { id: 'hippo', icon: '🦛', label: 'Happy Hippo' },
  { id: 'croc', icon: '🐊', label: 'Cool Croc' },
  { id: 'flamingo', icon: '🦩', label: 'Fancy Flamingo' },
  { id: 'parrot', icon: '🦜', label: 'Loud Parrot' },
  { id: 'sun', icon: '☀️', label: 'Bright Sun' },
  { id: 'moon', icon: '🌙', label: 'Calm Moon' },
  { id: 'star', icon: '⭐', label: 'Shining Star' },
  { id: 'flower', icon: '🌺', label: 'Wild Flower' },
  { id: 'tree', icon: '🌳', label: 'Strong Tree' },
  { id: 'dragon', icon: '🐉', label: 'Magic Dragon' },
  { id: 'unicorn', icon: '🦄', label: 'Unicorn' },
];

// Helper to count stories read by region keyword
const getReadCountByRegion = (readTitles: string[], regionKeyword: string): number => {
  return readTitles.filter(title => {
    const story = STORY_CATALOG.find(s => s.title === title);
    return story && story.region.toLowerCase().includes(regionKeyword);
  }).length;
};

// Achievements
export const ACHIEVEMENT_BADGES: Badge[] = [
  // --- SHARE BADGE ---
  {
    id: 'town_crier',
    name: 'Town Crier',
    description: 'Shared the app with a friend.',
    icon: '📣',
    color: 'text-gather-red',
    condition: (p) => !!p.hasSharedApp
  },

  // --- READING MILESTONES (Basic) ---
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Read your first story.',
    icon: '👣',
    color: 'text-green-600',
    condition: (p) => p.storiesRead >= 1
  },
  {
    id: 'village_listener',
    name: 'Listener',
    description: 'Read 3 different stories.',
    icon: '👂',
    color: 'text-blue-600',
    condition: (p) => p.readStoryIds.length >= 3
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Read 5 stories.',
    icon: '📚',
    color: 'text-purple-600',
    condition: (p) => p.storiesRead >= 5
  },
  {
    id: 'historian',
    name: 'Historian',
    description: 'Completed 10 stories.',
    icon: '👑',
    color: 'text-yellow-600',
    condition: (p) => p.storiesRead >= 10
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 20 stories.',
    icon: '🐛',
    color: 'text-emerald-500',
    condition: (p) => p.storiesRead >= 20
  },
  {
    id: 'grand_master',
    name: 'Grand Master',
    description: 'Read 50 stories.',
    icon: '🎓',
    color: 'text-indigo-600',
    condition: (p) => p.storiesRead >= 50
  },

  // --- NEW ACHIEVEMENT BADGES ---
  {
    id: 'book_club',
    name: 'Book Club',
    description: 'Read 2 stories in a row.',
    icon: '👯',
    color: 'text-pink-500',
    condition: (p) => p.storiesRead >= 2 
  },
  {
    id: 'library_card',
    name: 'Library Card',
    description: 'Read 15 stories.',
    icon: '💳',
    color: 'text-blue-500',
    condition: (p) => p.storiesRead >= 15
  },
  {
    id: 'globetrotter',
    name: 'Globetrotter',
    description: 'Read stories from at least 4 different continents.',
    icon: '🗺️',
    color: 'text-cyan-600',
    condition: (p) => {
        const regions = new Set();
        p.readStoryIds.forEach(id => {
            const s = STORY_CATALOG.find(st => st.title === id);
            if(s) {
                if(s.region.includes('Africa')) regions.add('Africa');
                if(s.region.includes('Asia')) regions.add('Asia');
                if(s.region.includes('Europe')) regions.add('Europe');
                if(s.region.includes('America')) regions.add('America');
                if(s.region.includes('Oceania')) regions.add('Oceania');
            }
        });
        return regions.size >= 4;
    }
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Read 8 stories.',
    icon: '🤔',
    color: 'text-orange-400',
    condition: (p) => p.storiesRead >= 8
  },
  {
    id: 'badge_collector',
    name: 'Collector',
    description: 'Earn 10 badges.',
    icon: '📛',
    color: 'text-red-500',
    condition: (p) => p.badgesEarned.length >= 10
  },
  {
    id: 'safari_guide',
    name: 'Safari Guide',
    description: 'Read 10 stories from Africa.',
    icon: '🚙',
    color: 'text-amber-700',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'africa') >= 10
  },
  {
    id: 'ninja_student',
    name: 'Ninja Student',
    description: 'Read 5 stories from Asia.',
    icon: '🏯',
    color: 'text-red-600',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'asia') >= 5
  },
  {
    id: 'medieval_knight',
    name: 'Knight',
    description: 'Read 5 stories from Europe.',
    icon: '🛡️',
    color: 'text-slate-500',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'europe') >= 5
  },
  {
    id: 'spirit_walker',
    name: 'Spirit Walker',
    description: 'Read 5 stories from the Americas.',
    icon: '🦅',
    color: 'text-orange-500',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'america') >= 5
  },
  {
    id: 'island_hopper',
    name: 'Island Hopper',
    description: 'Read 3 stories from Oceania.',
    icon: '🏝️',
    color: 'text-blue-400',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'oceania') >= 3
  },

  // --- COLLECTION MILESTONES ---
  {
    id: 'friend_collector',
    name: 'Friend Finder',
    description: 'Collect 5 Character cards.',
    icon: '🤝',
    color: 'text-pink-500',
    condition: (p) => p.collectedCharacters.length >= 5
  },
  {
    id: 'menagerie_keeper',
    name: 'Menagerie',
    description: 'Collect 10 Character cards.',
    icon: '🎪',
    color: 'text-orange-600',
    condition: (p) => p.collectedCharacters.length >= 10
  },
  {
    id: 'scroll_seeker',
    name: 'Scroll Keeper',
    description: 'Collect 10 Wisdom Scrolls.',
    icon: '📜',
    color: 'text-amber-600',
    condition: (p) => p.treasures.length >= 10
  },
  {
    id: 'wisdom_sage',
    name: 'Ancient Sage',
    description: 'Collect 25 Wisdom Scrolls.',
    icon: '🔮',
    color: 'text-violet-600',
    condition: (p) => p.treasures.length >= 25
  },

  // --- FEATURE USAGE ---
  {
    id: 'keeper_of_pages',
    name: 'Archivist',
    description: 'Bookmark 5 different pages.',
    icon: '🔖',
    color: 'text-teal-600',
    condition: (p) => p.bookmarks.length >= 5
  },

  // --- REGION EXPERTS ---
  {
    id: 'savannah_scout',
    name: 'Savannah Scout',
    description: 'Read 5 stories from Africa.',
    icon: '🐘',
    color: 'text-orange-500',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'africa') >= 5
  },
  {
    id: 'silk_road_walker',
    name: 'Silk Road Walker',
    description: 'Read 5 stories from Asia.',
    icon: '🏮',
    color: 'text-red-500',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'asia') >= 5
  },
  {
    id: 'castle_hopper',
    name: 'Castle Hopper',
    description: 'Read 5 stories from Europe.',
    icon: '🏰',
    color: 'text-blue-700',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'europe') >= 5
  },
  {
    id: 'new_world_voyager',
    name: 'Voyager',
    description: 'Read 5 stories from the Americas.',
    icon: '🌎',
    color: 'text-green-600',
    condition: (p) => getReadCountByRegion(p.readStoryIds, 'america') >= 5
  }
];

// Region Stamps
export const REGION_BADGES: Badge[] = [
    { id: 'stamp_ghana', name: 'Ghana', description: 'Visited the home of Anansi', icon: '🇬🇭', color: 'text-red-600', condition: () => false },
    { id: 'stamp_nigeria', name: 'Nigeria', description: 'Explored the Niger River', icon: '🇳🇬', color: 'text-green-600', condition: () => false },
    { id: 'stamp_ethiopia', name: 'Ethiopia', description: 'Walked the Highlands', icon: '🇪🇹', color: 'text-yellow-600', condition: () => false },
    { id: 'stamp_zimbabwe', name: 'Zimbabwe', description: 'Saw the Great Stone Houses', icon: '🇿🇼', color: 'text-emerald-600', condition: () => false },
    { id: 'stamp_mali', name: 'Mali', description: 'Journeyed to Timbuktu', icon: '🇲🇱', color: 'text-yellow-500', condition: () => false },
    { id: 'stamp_east_africa', name: 'E. Africa', description: 'Roamed the Savannah', icon: '🦁', color: 'text-orange-600', condition: () => false },
    { id: 'stamp_south_africa', name: 'S. Africa', description: 'Visited the Rainbow Nation', icon: '🇿🇦', color: 'text-blue-500', condition: () => false },
    { id: 'stamp_japan', name: 'Japan', description: 'Land of the Rising Sun', icon: '🇯🇵', color: 'text-red-500', condition: () => false },
    { id: 'stamp_china', name: 'China', description: 'Crossed the Great Wall', icon: '🇨🇳', color: 'text-red-700', condition: () => false },
    { id: 'stamp_korea', name: 'Korea', description: 'Land of Morning Calm', icon: '🇰🇷', color: 'text-blue-600', condition: () => false },
    { id: 'stamp_india', name: 'India', description: 'Land of Spices', icon: '🇮🇳', color: 'text-orange-500', condition: () => false },
    { id: 'stamp_middle_east', name: 'Arabia', description: 'Nights of Magic', icon: '🌙', color: 'text-purple-600', condition: () => false },
    { id: 'stamp_russia', name: 'Russia', description: 'Braved the Taiga', icon: '🇷🇺', color: 'text-blue-700', condition: () => false },
    { id: 'stamp_germany', name: 'Germany', description: 'Walked the Black Forest', icon: '🇩🇪', color: 'text-yellow-600', condition: () => false },
    { id: 'stamp_uk', name: 'UK', description: 'Visited the Royal Isles', icon: '🇬🇧', color: 'text-red-700', condition: () => false },
    { id: 'stamp_france', name: 'France', description: 'Bon Voyage!', icon: '🇫🇷', color: 'text-blue-500', condition: () => false },
    { id: 'stamp_greece', name: 'Greece', description: 'Land of Myths', icon: '🇬🇷', color: 'text-cyan-600', condition: () => false },
    { id: 'stamp_scandinavia', name: 'Nordic', description: 'Viking Shores', icon: '⚔️', color: 'text-slate-600', condition: () => false },
    { id: 'stamp_native', name: 'Native', description: 'Spirit of the Land', icon: '🦅', color: 'text-amber-700', condition: () => false },
    { id: 'stamp_usa', name: 'USA', description: 'Frontier Spirit', icon: '🇺🇸', color: 'text-blue-700', condition: () => false },
    { id: 'stamp_mexico', name: 'Mexico', description: 'Aztec Sun', icon: '🇲🇽', color: 'text-green-700', condition: () => false },
    { id: 'stamp_brazil', name: 'Brazil', description: 'Amazon Adventure', icon: '🇧🇷', color: 'text-green-500', condition: () => false },
    { id: 'stamp_peru', name: 'Peru', description: 'Incan Gold', icon: '🇵🇪', color: 'text-red-600', condition: () => false },
    { id: 'stamp_australia', name: 'Australia', description: 'The Outback', icon: '🇦🇺', color: 'text-blue-800', condition: () => false },
    { id: 'stamp_nz', name: 'NZ', description: 'Land of the Long White Cloud', icon: '🇳🇿', color: 'text-blue-900', condition: () => false },
    { id: 'stamp_polynesia', name: 'Polynesia', description: 'Ocean Voyager', icon: '🌊', color: 'text-cyan-500', condition: () => false },
];

export const BADGES = [...ACHIEVEMENT_BADGES, ...REGION_BADGES];

const INSPIRATIONAL_MESSAGES = [
  "Kindness is like a seed—it grows into a beautiful garden.",
  "Your imagination can take you anywhere!",
  "A brave heart is stronger than a mighty roar.",
  "Listening is the key to wisdom.",
  "Every friend was once a stranger.",
  "The world is full of magic if you know where to look.",
  "Patience is a superpower.",
  "Small acts of love change the world.",
  "You are as bright as the sun!",
  "Sharing brings double the happiness.",
  "Curiosity opens new doors.",
  "You are writing your own wonderful story every day.",
  "Strength comes from working together.",
  "Be proud of who you are!",
  "Mistakes help us learn and grow.",
  "Your voice matters.",
  "Keep dreaming big dreams!",
  "Honesty is the most precious treasure.",
  "You are a hero in your own life.",
  "Respect nature, and it will care for you."
];

export const getUserProgress = (): UserProgress | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    // Migrations for backward compatibility
    if (parsed.hasPremiumAccess === undefined) parsed.hasPremiumAccess = false;
    if (parsed.hasSharedApp === undefined) parsed.hasSharedApp = false;
    if (parsed.storyProgress === undefined) parsed.storyProgress = {};
    if (parsed.treasures === undefined) parsed.treasures = [];
    if (parsed.collectedCharacters === undefined) parsed.collectedCharacters = [];
    if (parsed.bookmarks === undefined) parsed.bookmarks = [];
    if (parsed.customAvatar === undefined) parsed.customAvatar = undefined;
    return parsed;
  }
  return null;
};

export const saveUserProgress = (progress: UserProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const createProfile = (username: string, avatarId: string, customAvatar?: string): UserProgress => {
  const newUser: UserProgress = {
    username,
    avatarId,
    customAvatar,
    storiesRead: 0,
    readStoryIds: [],
    badgesEarned: [],
    treasures: [],
    collectedCharacters: [],
    bookmarks: [],
    hasPremiumAccess: false,
    hasSharedApp: false,
    storyProgress: {}
  };
  saveUserProgress(newUser);
  return newUser;
};

export const updateUserProfile = (username: string, avatarId: string, customAvatar?: string): UserProgress | null => {
  const user = getUserProgress();
  if (user) {
    user.username = username;
    user.avatarId = avatarId;
    user.customAvatar = customAvatar;
    saveUserProgress(user);
    return user;
  }
  return null;
}

export const upgradeToPremium = (): UserProgress | null => {
  const progress = getUserProgress();
  if (progress) {
    progress.hasPremiumAccess = true;
    saveUserProgress(progress);
    return progress;
  }
  return null;
};

export const shareApp = async (): Promise<Badge | null> => {
    const user = getUserProgress();
    if (!user) return null;

    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Gather Around',
                text: 'Join me on Gather Around to read magical folk stories from around the world!',
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard! Share it with a friend.");
        }

        // Unlock Badge
        if (!user.hasSharedApp) {
            user.hasSharedApp = true;
            
            const badgeId = 'town_crier';
            if (!user.badgesEarned.includes(badgeId)) {
                user.badgesEarned.push(badgeId);
                saveUserProgress(user);
                return ACHIEVEMENT_BADGES.find(b => b.id === badgeId) || null;
            }
            saveUserProgress(user);
        }
    } catch (error) {
        console.error("Error sharing:", error);
    }
    return null;
}

// Helper to guess a character name/icon based on title
const getCharacterFromStory = (title: string): { name: string, icon: string } => {
  const lower = title.toLowerCase();
  if (lower.includes('anansi')) return { name: 'Anansi the Spider', icon: '🕷️' };
  if (lower.includes('lion')) return { name: 'The Royal Lion', icon: '🦁' };
  if (lower.includes('turtle') || lower.includes('tortoise')) return { name: 'Wise Turtle', icon: '🐢' };
  if (lower.includes('rabbit') || lower.includes('hare')) return { name: 'Clever Hare', icon: '🐇' };
  if (lower.includes('monkey')) return { name: 'Playful Monkey', icon: '🐒' };
  if (lower.includes('fish') || lower.includes('goby')) return { name: 'Magic Fish', icon: '🐟' };
  if (lower.includes('bird') || lower.includes('crow') || lower.includes('owl')) return { name: 'Spirit Bird', icon: '🐦' };
  if (lower.includes('dragon')) return { name: 'River Dragon', icon: '🐉' };
  if (lower.includes('bear')) return { name: 'Great Bear', icon: '🐻' };
  if (lower.includes('frog')) return { name: 'Little Frog', icon: '🐸' };
  if (lower.includes('snake')) return { name: 'Guardian Snake', icon: '🐍' };
  if (lower.includes('wolf')) return { name: 'The Wolf', icon: '🐺' };
  
  return { name: 'The Village Hero', icon: '✨' };
};

const getRegionBadgeId = (region: string): string | null => {
    const r = region.toLowerCase();
    if (r.includes('ghana')) return 'stamp_ghana';
    if (r.includes('nigeria')) return 'stamp_nigeria';
    if (r.includes('ethiopia')) return 'stamp_ethiopia';
    if (r.includes('zimbabwe')) return 'stamp_zimbabwe';
    if (r.includes('mali')) return 'stamp_mali';
    if (r.includes('east') || r.includes('swahili')) return 'stamp_east_africa';
    if (r.includes('south')) return 'stamp_south_africa';
    
    if (r.includes('japan')) return 'stamp_japan';
    if (r.includes('china')) return 'stamp_china';
    if (r.includes('korea')) return 'stamp_korea';
    if (r.includes('india')) return 'stamp_india';
    if (r.includes('middle east')) return 'stamp_middle_east';
    
    if (r.includes('russia')) return 'stamp_russia';
    if (r.includes('germany')) return 'stamp_germany';
    if (r.includes('france')) return 'stamp_france';
    if (r.includes('greece')) return 'stamp_greece';
    if (r.includes('england') || r.includes('scotland') || r.includes('uk')) return 'stamp_uk';
    if (r.includes('norway') || r.includes('denmark') || r.includes('ireland')) return 'stamp_scandinavia';
    
    if (r.includes('mexico')) return 'stamp_mexico';
    if (r.includes('brazil')) return 'stamp_brazil';
    if (r.includes('peru')) return 'stamp_peru';
    if (r.includes('usa')) return 'stamp_usa';
    if (r.includes('native') || r.includes('cherokee') || r.includes('haida')) return 'stamp_native';
    
    if (r.includes('australia')) return 'stamp_australia';
    if (r.includes('new zealand')) return 'stamp_nz';
    if (r.includes('polynesia')) return 'stamp_polynesia';
    
    return null;
}

// Returns badges, treasure, and potentially a character
export const completeStory = async (story: Story): Promise<StoryRewards> => {
  const progress = getUserProgress();
  if (!progress) throw new Error("No user found");

  // 1. Update Basic Stats
  const newProgress = { ...progress };
  newProgress.storiesRead += 1;
  if (!newProgress.readStoryIds.includes(story.title)) {
    newProgress.readStoryIds.push(story.title);
  }

  const newBadges: Badge[] = [];

  // 2. Check Achievement Badges
  ACHIEVEMENT_BADGES.forEach(badge => {
    if (!newProgress.badgesEarned.includes(badge.id)) {
      if (badge.condition(newProgress)) {
        newProgress.badgesEarned.push(badge.id);
        newBadges.push(badge);
      }
    }
  });

  // 3. Check Region Stamp
  const regionBadgeId = getRegionBadgeId(story.region);
  if (regionBadgeId && !newProgress.badgesEarned.includes(regionBadgeId)) {
      newProgress.badgesEarned.push(regionBadgeId);
      const badge = REGION_BADGES.find(b => b.id === regionBadgeId);
      if (badge) newBadges.push(badge);
  }

  // 4. Generate Treasure (Always)
  const randomMessage = INSPIRATIONAL_MESSAGES[Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length)];
  const newTreasure: Treasure = {
    id: `tr_${Date.now()}`,
    message: randomMessage,
    unlockedAt: Date.now(),
    storyTitle: story.title
  };
  newProgress.treasures.push(newTreasure);

  // 5. Random Roll for Character (Random Odds, approx 15% for fun)
  let newCharacter: CollectedCharacter | null = null;
  const roll = Math.random();
  const threshold = 0.15; // 15% Chance

  if (roll < threshold) {
    const charInfo = getCharacterFromStory(story.title);
    
    // Generate the image
    let generatedImage = undefined;
    if (navigator.onLine) {
        generatedImage = await generateCharacterImage(charInfo.name, story.region) || undefined;
    }

    newCharacter = {
      id: `char_${Date.now()}`,
      name: charInfo.name,
      icon: charInfo.icon,
      storyTitle: story.title,
      unlockedAt: Date.now(),
      imageUrl: generatedImage
    };
    newProgress.collectedCharacters.push(newCharacter);
  }

  saveUserProgress(newProgress);

  return {
    badges: newBadges,
    treasure: newTreasure,
    character: newCharacter
  };
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

// --- Bookmark Methods ---
export const toggleBookmark = (storyTitle: string, pageIndex: number, excerpt: string) => {
  const user = getUserProgress();
  if (!user) return;
  
  if (!user.bookmarks) user.bookmarks = [];

  const existingIndex = user.bookmarks.findIndex(b => b.storyTitle === storyTitle && b.pageIndex === pageIndex);
  
  if (existingIndex > -1) {
    // Remove
    user.bookmarks.splice(existingIndex, 1);
  } else {
    // Add
    user.bookmarks.push({
      storyTitle,
      pageIndex,
      excerpt,
      timestamp: Date.now()
    });
  }
  
  saveUserProgress(user);
};

export const isBookmarked = (storyTitle: string, pageIndex: number): boolean => {
  const user = getUserProgress();
  return user?.bookmarks?.some(b => b.storyTitle === storyTitle && b.pageIndex === pageIndex) || false;
};
