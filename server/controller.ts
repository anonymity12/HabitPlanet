
import { db } from "./db";
import { GeminiService } from "./geminiNodeWrapper";
import { Habit, CheckInRecord, User, Card, ApiResponse, CheckInResponse, DrawCardResponse, HabitFrequency, HabitType } from "../types";

/**
 * 模拟后端控制器
 * Mock Backend Controller
 * 
 * Handles business logic, validation, and interaction with the DB/AI services.
 */
export const ServerController = {
  
  // --- Habits Endpoints ---

  async getHabits(): Promise<ApiResponse<Habit[]>> {
    // In real app: get userId from session/token
    const user = db.getUser();
    const habits = db.getHabits(user.id);
    
    // Check for daily reset logic (if new day, reset isCompletedToday)
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(h => {
        if (h.lastCheckInDate !== today && h.isCompletedToday) {
            h.isCompletedToday = false;
            h.completedCount = 0;
            db.saveHabit(h); // Persist reset
        }
        return h;
    });

    return { success: true, data: updatedHabits };
  },

  async createHabit(habitData: Partial<Habit>): Promise<ApiResponse<Habit>> {
    const user = db.getUser();
    const newHabit: Habit = {
      id: Date.now().toString(),
      userId: user.id,
      title: habitData.title || 'New Habit',
      description: habitData.description || '',
      type: habitData.type || HabitType.Life,
      frequency: habitData.frequency || HabitFrequency.Daily,
      targetCount: habitData.targetCount || 1,
      completedCount: 0,
      subTasks: habitData.subTasks || [],
      streak: 0,
      lastCheckInDate: null,
      isCompletedToday: false,
      createdAt: Date.now()
    };
    db.saveHabit(newHabit);
    return { success: true, data: newHabit };
  },

  async deleteHabit(id: string): Promise<ApiResponse<void>> {
    db.deleteHabit(id);
    return { success: true };
  },

  async updateSubTask(habitId: string, subTaskId: string): Promise<ApiResponse<Habit>> {
    const habit = db.getHabitById(habitId);
    if (!habit) return { success: false, error: "Habit not found" };

    const updatedSubs = habit.subTasks.map(st => 
        st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    habit.subTasks = updatedSubs;
    db.saveHabit(habit);
    return { success: true, data: habit };
  },

  // --- Check-In Logic (Core Business Logic) ---

  async checkIn(habitId: string, note?: string, lat?: number, lng?: number): Promise<ApiResponse<CheckInResponse>> {
    const habit = db.getHabitById(habitId);
    if (!habit) return { success: false, error: "Habit not found" };

    const user = db.getUser();
    const today = new Date().toISOString().split('T')[0];

    // 1. Validation: Prevent duplicate check-in for single-count habits
    // (Simplification: if targetCount > 1, allow multiple)
    if (habit.isCompletedToday && habit.targetCount <= 1) {
        return { success: false, error: "Already completed today" };
    }

    // 2. Update Streak
    let newStreak = habit.streak;
    // If last checkin was yesterday, increment. If older, reset. If today, keep.
    if (habit.lastCheckInDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (habit.lastCheckInDate === yesterdayStr) {
            newStreak += 1;
        } else if (habit.lastCheckInDate !== null) {
            newStreak = 1; // Broken streak
        } else {
            newStreak = 1; // First time
        }
    }

    // 3. Update Habit
    habit.streak = newStreak;
    habit.completedCount += 1;
    if (habit.completedCount >= habit.targetCount) {
        habit.isCompletedToday = true;
    }
    habit.lastCheckInDate = today;
    db.saveHabit(habit);

    // 4. Create Record
    const record: CheckInRecord = {
        id: Date.now().toString(),
        habitId: habit.id,
        userId: user.id,
        timestamp: Date.now(),
        dateString: today,
        note,
        location: (lat && lng) ? { lat, lng } : undefined
    };
    db.createCheckIn(record);

    // 5. Calculate Rewards (Game Logic)
    // Formula: Base 10 + Streak Bonus
    const streakBonus = newStreak > 7 ? 5 : (newStreak > 3 ? 2 : 0);
    const coinsEarned = 10 + streakBonus;
    const expEarned = 15;

    let newLevel = user.petLevel;
    let newExp = user.petExp + expEarned;
    let levelUp = false;

    if (newExp >= 100) {
        newLevel += 1;
        newExp = newExp - 100;
        levelUp = true;
    }

    user.coins += coinsEarned;
    user.petLevel = newLevel;
    user.petExp = newExp;
    db.updateUser(user);

    return {
        success: true,
        data: {
            record,
            updatedHabit: habit,
            rewards: {
                coins: coinsEarned,
                exp: expEarned,
                levelUp,
                newLevel: levelUp ? newLevel : undefined
            }
        }
    };
  },

  // --- User & Stats ---

  async getUserProfile(): Promise<ApiResponse<User>> {
    return { success: true, data: db.getUser() };
  },

  async getStats(): Promise<ApiResponse<{checkIns: CheckInRecord[]}>> {
    const user = db.getUser();
    const checkIns = db.getCheckIns(user.id);
    return { success: true, data: { checkIns } };
  },

  async getAIAdvice(): Promise<ApiResponse<string>> {
    const user = db.getUser();
    const habits = db.getHabits(user.id);
    const checkIns = db.getCheckIns(user.id);
    
    const advice = await GeminiService.generateAdvice(habits, checkIns);
    return { success: true, data: advice };
  },

  // --- Gacha System (Server-Side Probability) ---

  async drawCard(): Promise<ApiResponse<DrawCardResponse>> {
    const COST = 100;
    const user = db.getUser();

    // 1. Validate Balance
    if (user.coins < COST) {
        return { success: false, error: "Insufficient coins" };
    }

    // 2. Deduct Coins
    user.coins -= COST;

    // 3. Probability Logic (Server controlled)
    const rand = Math.random();
    let rarity: Card['rarity'] = 'Common';
    if (rand > 0.95) rarity = 'Legendary';
    else if (rand > 0.85) rarity = 'Epic';
    else if (rand > 0.60) rarity = 'Rare';

    const rarityMult = { Common: 1, Rare: 5, Epic: 20, Legendary: 100 };
    
    const FIGURES = [
        { name: 'Laozi', title: 'The Founder' },
        { name: 'Zhuangzi', title: 'The Sage' },
        { name: 'Zhang Daoling', title: 'Celestial Master' },
        { name: 'Lu Dongbin', title: 'Sword Immortal' },
        { name: 'He Xiangu', title: 'Lotus Immortal' },
        { name: 'Jade Emperor', title: 'Ruler of Heaven' }
    ];
    const figure = FIGURES[Math.floor(Math.random() * FIGURES.length)];

    // 4. Generate Image (Server calls AI)
    const imageUrl = await GeminiService.generateCardArt(figure.name, figure.title);

    // 5. Create Card Object
    const newCard: Card = {
        id: Date.now().toString(),
        name: figure.name,
        title: figure.title,
        rarity,
        value: Math.floor((Math.random() * 50 + 10) * rarityMult[rarity]),
        imageUrl,
        description: `Simulated backend generated card for ${figure.name}`,
        obtainedAt: Date.now()
    };

    // 6. Save
    user.collectedCards.push(newCard);
    db.updateUser(user);

    return {
        success: true,
        data: {
            card: newCard,
            remainingCoins: user.coins
        }
    };
  }
};
