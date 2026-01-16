import React, { useState } from 'react';
import { Habit, User } from '../../types';
import { Icons, HABIT_TYPE_COLORS } from '../../constants';
import { Button, Card, Badge, Loader } from '../ui';

interface DashboardViewProps {
  habits: Habit[];
  user: User;
  onCheckIn: (id: string, note?: string) => void;
  onToggleSubTask: (hId: string, sId: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  habits, 
  user, 
  onCheckIn, 
  onToggleSubTask, 
  onDelete, 
  isLoading 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const handleCheckInClick = async (id: string) => {
    setCheckingInId(id);
    await onCheckIn(id);
    setCheckingInId(null);
  };

  const sortedHabits = [...habits].sort((a, b) => {
    if (a.isCompletedToday === b.isCompletedToday) return 0;
    return a.isCompletedToday ? 1 : -1;
  });

  return (
    <div className="space-y-6 pb-32">
      {/* Pet Header */}
      <div className="bg-gradient-to-br from-brand-blue to-cyan-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Icons.Planet width={120} height={120} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-white/30">
            {user.petLevel > 5 ? '🐲' : user.petLevel > 2 ? '🦖' : '🥚'}
          </div>
          <div>
            <h2 className="text-lg font-bold">Lvl {user.petLevel} {user.petName}</h2>
            <div className="w-32 h-2 bg-black/20 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-brand-yellow transition-all duration-500" 
                style={{ width: `${(user.petExp % 100)}%` }} 
              />
            </div>
            <p className="text-xs mt-1 text-white/80">{user.petExp % 100} / 100 XP</p>
          </div>
          <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
            💰 {user.coins}
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 text-lg px-2">Today's Goals</h3>
        {isLoading ? (
          <Loader />
        ) : (
          sortedHabits.map(habit => (
            <Card 
              key={habit.id} 
              className={`transition-all duration-300 ${
                habit.isCompletedToday 
                  ? 'opacity-60 bg-slate-50' 
                  : 'hover:translate-y-[-2px]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => !habit.isCompletedToday && !checkingInId && handleCheckInClick(habit.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-sm relative
                    ${habit.isCompletedToday 
                      ? 'bg-brand-green text-white' 
                      : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                    }`}
                >
                  {checkingInId === habit.id ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/>
                  ) : habit.isCompletedToday ? (
                    <Icons.Check />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => setExpandedId(expandedId === habit.id ? null : habit.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold ${
                      habit.isCompletedToday 
                        ? 'text-slate-400 line-through' 
                        : 'text-slate-800'
                    }`}>
                      {habit.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                      <Icons.Fire width={12} height={12} /> {habit.streak}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge colorClass={HABIT_TYPE_COLORS[habit.type]}>{habit.type}</Badge>
                    <span className="text-xs text-slate-400 py-1">
                      {habit.completedCount}/{habit.targetCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === habit.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                  {habit.subTasks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase">Subtasks</p>
                      {habit.subTasks.map(st => (
                        <div 
                          key={st.id} 
                          onClick={() => onToggleSubTask(habit.id, st.id)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            st.isCompleted 
                              ? 'bg-brand-blue border-brand-blue' 
                              : 'border-slate-300'
                          }`}>
                            {st.isCompleted && <Icons.Check width={10} className="text-white" />}
                          </div>
                          <span className={`text-sm ${
                            st.isCompleted 
                              ? 'text-slate-400 line-through' 
                              : 'text-slate-700'
                          }`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => onDelete(habit.id)} 
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete Habit
                    </button>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        className="text-xs py-1 h-8" 
                        onClick={() => onCheckIn(habit.id, "Late entry")}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
