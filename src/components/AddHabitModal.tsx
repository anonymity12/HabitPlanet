import React, { useState } from 'react';
import { Habit, HabitType, HabitFrequency } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (h: Partial<Habit>) => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>(HabitType.Life);
  const [targetCount, setTargetCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setSubmitting(true);
    await onAdd({ 
      title, 
      type, 
      frequency: HabitFrequency.Daily, 
      targetCount, 
      subTasks: [], 
      description: '' 
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold mb-4 text-slate-800">New Habit</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Habit Name</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" 
              placeholder="e.g. Read 10 pages"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Type</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as HabitType)}
                className="w-full p-3 rounded-xl border border-slate-200"
              >
                {Object.values(HabitType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Daily Goal</label>
              <input 
                type="number" 
                min="1"
                value={targetCount} 
                onChange={e => setTargetCount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button 
              variant="ghost" 
              className="flex-1" 
              onClick={onClose} 
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-brand-blue" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
