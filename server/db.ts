
import { Habit, User, CheckInRecord, HabitType, HabitFrequency } from "../types";

// Keys for LocalStorage
const KEYS = {
  HABITS: 'habitplanet_db_habits',
  USER: 'habitplanet_db_user',
  CHECKINS: 'habitplanet_db_checkins',
};

// Initial Data Seeds
const INITIAL_USER: User = {
  id: 'u1',
  name: 'Traveler',
  coins: 150,
  petLevel: 1,
  petExp: 20,
  petName: 'Gloopy',
  equippedSkin: 'default',
  inventory: ['default'],
  collectedCards: []
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    userId: 'u1',
    title: 'Morning Water',
    description: 'Drink a glass of water after waking up',
    type: HabitType.Life,
    frequency: HabitFrequency.Daily,
    targetCount: 1,
    completedCount: 0,
    subTasks: [],
    streak: 3,
    lastCheckInDate: null,
    isCompletedToday: false,
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'h2',
    userId: 'u1',
    title: 'Code Study',
    description: 'Learn React for 1 hour',
    type: HabitType.Study,
    frequency: HabitFrequency.Daily,
    targetCount: 1,
    completedCount: 0,
    subTasks: [
        { id: 'st1', title: 'Read Docs', isCompleted: false },
        { id: 'st2', title: 'Write Code', isCompleted: false }
    ],
    streak: 12,
    lastCheckInDate: null,
    isCompletedToday: false,
    createdAt: Date.now() - 20000000,
  }
];

/**
 * 模拟数据库类
 * Simulated Database Class
 */
class MockDatabase {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`DB Read Error [${key}]:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`DB Write Error [${key}]:`, e);
    }
  }

  // --- User Table Operations ---
  
  getUser(): User {
    const user = this.get<User>(KEYS.USER, INITIAL_USER);
    // Migration: ensure ID exists
    if (!user.id) user.id = 'u1';
    if (!user.collectedCards) user.collectedCards = [];
    return user;
  }

  updateUser(user: User): User {
    this.set(KEYS.USER, user);
    return user;
  }

  // --- Habit Table Operations ---

  getHabits(userId: string): Habit[] {
    const all = this.get<Habit[]>(KEYS.HABITS, INITIAL_HABITS);
    return all.filter(h => h.userId === userId || !h.userId /* legacy support */);
  }

  getHabitById(id: string): Habit | undefined {
    const all = this.get<Habit[]>(KEYS.HABITS, INITIAL_HABITS);
    return all.find(h => h.id === id);
  }

  saveHabit(habit: Habit): Habit {
    const all = this.get<Habit[]>(KEYS.HABITS, INITIAL_HABITS);
    const index = all.findIndex(h => h.id === habit.id);
    if (index >= 0) {
      all[index] = habit;
    } else {
      all.unshift(habit);
    }
    this.set(KEYS.HABITS, all);
    return habit;
  }

  deleteHabit(id: string): void {
    const all = this.get<Habit[]>(KEYS.HABITS, INITIAL_HABITS);
    const filtered = all.filter(h => h.id !== id);
    this.set(KEYS.HABITS, filtered);
  }

  // --- CheckIn Table Operations ---

  getCheckIns(userId: string): CheckInRecord[] {
    const all = this.get<CheckInRecord[]>(KEYS.CHECKINS, []);
    return all.filter(c => c.userId === userId || !c.userId);
  }

  createCheckIn(record: CheckInRecord): CheckInRecord {
    const all = this.get<CheckInRecord[]>(KEYS.CHECKINS, []);
    all.push(record);
    this.set(KEYS.CHECKINS, all);
    return record;
  }
}

export const db = new MockDatabase();
