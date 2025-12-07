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
  timestamp: number; // Date.now()
  dateString: string; // YYYY-MM-DD
  location?: { lat: number; lng: number };
  note?: string;
  imageUrl?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string; // e.g., "Drink 8 cups"
  type: HabitType;
  frequency: HabitFrequency;
  targetCount: number; // e.g., 8 cups
  completedCount: number; // Reset daily
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
  imageUrl: string | null; // Base64 or URL
  description: string;
  obtainedAt: number;
}

export interface User {
  name: string;
  coins: number;
  petLevel: number;
  petExp: number;
  petName: string;
  equippedSkin: string; // 'default', 'robot', 'ninja'
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