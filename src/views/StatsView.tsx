import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckInRecord } from '../types';
import { Icons } from '../constants';
import { Button, Card } from '../components/ui';
import { api } from '../client/api';

export const StatsView: React.FC = () => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    api.user.getStats().then(setCheckIns).catch(console.error);
  }, []);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = checkIns.filter(c => c.dateString === dateStr).length;
      days.push({ name: dateStr.slice(5), count });
    }
    return days;
  }, [checkIns]);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const result = await api.ai.getAdvice();
      setAdvice(result);
    } catch (e) {
      setAdvice("AI is taking a nap. Try again later.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
      
      <Card>
        <h3 className="font-bold text-slate-600 mb-4">Activity (Last 7 Days)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2196F3" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#2196F3', strokeWidth: 2, stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-2">
          <h4 className="text-sm font-bold text-slate-400 mb-2">Total Check-ins</h4>
          <span className="text-3xl font-black text-brand-blue">{checkIns.length}</span>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-600 flex items-center gap-2">
            <Icons.Brain width={18} className="text-purple-500"/>
            AI Insights
          </h3>
          <Button 
            variant="ghost" 
            className="text-xs bg-purple-50 text-purple-600" 
            onClick={handleGetAdvice} 
            disabled={loadingAdvice}
          >
            {loadingAdvice ? 'Thinking...' : 'Generate'}
          </Button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 min-h-[100px] whitespace-pre-line">
          {advice ? advice : "Click 'Generate' to get personalized tips from your AI coach based on your recent habit data!"}
        </div>
      </Card>
    </div>
  );
};
