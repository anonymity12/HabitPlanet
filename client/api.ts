
import { ServerController } from "../server/controller";
import { Habit, User, CheckInResponse, Card, DrawCardResponse, CheckInRecord } from "../types";

/**
 * Frontend API Client
 * 
 * This file simulates a network client (like Axios). 
 * Instead of actual HTTP calls, it calls the `ServerController` with a slight delay
 * to simulate network latency.
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  habits: {
    list: async (): Promise<Habit[]> => {
      await delay(200);
      const res = await ServerController.getHabits();
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    },
    create: async (habit: Partial<Habit>): Promise<Habit> => {
      await delay(300);
      const res = await ServerController.createHabit(habit);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    },
    delete: async (id: string): Promise<void> => {
      await delay(200);
      await ServerController.deleteHabit(id);
    },
    checkIn: async (id: string, note?: string, lat?: number, lng?: number): Promise<CheckInResponse> => {
      await delay(500); // Network latency for checkin
      const res = await ServerController.checkIn(id, note, lat, lng);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    },
    toggleSubTask: async (habitId: string, subTaskId: string): Promise<Habit> => {
      await delay(100);
      const res = await ServerController.updateSubTask(habitId, subTaskId);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    }
  },
  
  user: {
    getProfile: async (): Promise<User> => {
      await delay(200);
      const res = await ServerController.getUserProfile();
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    },
    getStats: async (): Promise<CheckInRecord[]> => {
      await delay(300);
      const res = await ServerController.getStats();
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data.checkIns;
    }
  },

  game: {
    drawCard: async (): Promise<DrawCardResponse> => {
      await delay(800); // Creating card takes time
      const res = await ServerController.drawCard();
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    }
  },

  ai: {
    getAdvice: async (): Promise<string> => {
      await delay(1000); // AI is slow
      const res = await ServerController.getAIAdvice();
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    }
  }
};
