
export enum HabitType {
  Study = 'Study',
  Fitness = 'Fitness',
  Life = 'Life',
  Work = 'Work'
}

export enum HabitFrequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Custom = 'Custom'
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CheckInRecord {
  id: string;
  habitId: string;
  userId: string; // Added for backend design compliance
  timestamp: number; // Date.now()
  dateString: string; // YYYY-MM-DD
  location?: { lat: number; lng: number };
  note?: string;
  imageUrl?: string;
}

export interface Habit {
  id: string;
  userId: string; // Added for backend design compliance
  title: string;
  description: string;
  type: HabitType;
  frequency: HabitFrequency;
  targetCount: number;
  completedCount: number;
  subTasks: SubTask[]; 
  streak: number;
  lastCheckInDate: string | null;
  isCompletedToday: boolean;
  createdAt: number;
}

export interface Card {
  id: string;
  name: string;
  title: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  value: number;
  imageUrl: string | null;
  description: string;
  obtainedAt: number;
}

export interface User {
  id: string; // Added ID
  name: string;
  coins: number;
  petLevel: number;
  petExp: number;
  petName: string;
  equippedSkin: string;
  inventory: string[];
  collectedCards: Card[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  isJoined: boolean;
}

export interface FeedItem {
  id: string;
  userName: string;
  action: string;
  habitTitle: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

// --- API DTOs (Data Transfer Objects) ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CheckInResponse {
  record: CheckInRecord;
  updatedHabit: Habit;
  rewards: {
    coins: number;
    exp: number;
    levelUp: boolean;
    newLevel?: number;
  };
}

export interface DrawCardResponse {
  card: Card;
  remainingCoins: number;
}
