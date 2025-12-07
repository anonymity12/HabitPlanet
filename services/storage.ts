import { Habit, User, CheckInRecord, HabitType, HabitFrequency } from "../types";

const KEYS = {
  HABITS: 'habitplanet_habits',
  USER: 'habitplanet_user',
  CHECKINS: 'habitplanet_checkins',
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
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
  },
  {
    id: 'h3',
    title: 'Evening Run',
    description: 'Run 5km',
    type: HabitType.Fitness,
    frequency: HabitFrequency.Weekly,
    targetCount: 3, // 3 times a week
    completedCount: 1,
    subTasks: [],
    streak: 0,
    lastCheckInDate: null,
    isCompletedToday: false,
    createdAt: Date.now() - 5000000,
  }
];

const INITIAL_USER: User = {
  name: 'Traveler',
  coins: 150,
  petLevel: 1,
  petExp: 20,
  petName: 'Gloopy',
  equippedSkin: 'default',
  inventory: ['default'],
  collectedCards: []
};

export const storage = {
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : INITIAL_HABITS;
  },
  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
  },
  getUser: (): User => {
    const data = localStorage.getItem(KEYS.USER);
    // Migration for existing users who don't have collectedCards yet
    const user = data ? JSON.parse(data) : INITIAL_USER;
    if (!user.collectedCards) {
        user.collectedCards = [];
    }
    return user;
  },
  saveUser: (user: User) => {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Storage full or error", e);
      alert("Local storage is full! Some images might not be saved.");
    }
  },
  getCheckIns: (): CheckInRecord[] => {
    const data = localStorage.getItem(KEYS.CHECKINS);
    return data ? JSON.parse(data) : [];
  },
  addCheckIn: (record: CheckInRecord) => {
    const records = storage.getCheckIns();
    records.push(record);
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(records));
  }
};