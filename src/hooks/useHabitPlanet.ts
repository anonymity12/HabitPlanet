import { useState, useEffect } from 'react';
import { Habit, User, Card as GameCard, CheckInResponse } from '../types';
import { api } from '../client/api';

export const useHabitPlanet = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedHabits, fetchedUser] = await Promise.all([
        api.habits.list(),
        api.user.getProfile()
      ]);
      setHabits(fetchedHabits);
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddHabit = async (newHabitData: Partial<Habit>) => {
    try {
      await api.habits.create(newHabitData);
      await fetchData(); // Refresh list
    } catch (e) {
      alert("Failed to create habit");
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm("Are you sure?")) {
      await api.habits.delete(id);
      await fetchData();
    }
  };

  const handleCheckIn = async (id: string, note?: string) => {
    try {
      // Simulate Geo
      let lat, lng;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        });
      }

      const res: CheckInResponse = await api.habits.checkIn(id, note, lat, lng);
      
      // Optimistic UI update
      setHabits(current => current.map(h => h.id === id ? res.updatedHabit : h));
      setUser(current => {
        if (!current) return null;
        return {
          ...current,
          coins: current.coins + res.rewards.coins,
          petExp: res.rewards.exp,
          petLevel: res.rewards.newLevel || current.petLevel
        };
      });

      if (res.rewards.levelUp) {
        alert(`🎉 Level Up! You are now level ${res.rewards.newLevel}!`);
      }
    } catch (e: any) {
      alert(e.message || "Check-in failed");
    }
  };

  const handleToggleSubTask = async (habitId: string, subTaskId: string) => {
    try {
      const updatedHabit = await api.habits.toggleSubTask(habitId, subTaskId);
      setHabits(current => current.map(h => h.id === habitId ? updatedHabit : h));
    } catch (e) {
      console.error("Subtask toggle failed");
    }
  };

  const handleDrawCard = async (): Promise<GameCard | null> => {
    const res = await api.game.drawCard();
    // Update local user state
    if (user) {
      setUser({
        ...user,
        coins: res.remainingCoins,
        collectedCards: [...user.collectedCards, res.card]
      });
    }
    return res.card;
  };

  return {
    habits,
    user,
    isLoading,
    handleAddHabit,
    handleDeleteHabit,
    handleCheckIn,
    handleToggleSubTask,
    handleDrawCard
  };
};
