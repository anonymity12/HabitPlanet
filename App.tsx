import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Habit, User, CheckInRecord, HabitType, HabitFrequency, SubTask, Card as GameCard } from './types';
import { storage } from './services/storage';
import { getHabitAdvice, generateCardImage } from './services/geminiService';
import { Icons, HABIT_TYPE_COLORS, MOCK_GROUPS, MOCK_FEED } from './constants';

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'gold' }> = ({ className = '', variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-green text-white shadow-lg shadow-brand-green/30 hover:bg-green-600",
    secondary: "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 hover:bg-blue-600",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:brightness-110"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`}>{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; colorClass: string }> = ({ children, colorClass }) => (
  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colorClass}`}>{children}</span>
);

// --- Modals ---

const AddHabitModal: React.FC<{ onClose: () => void; onAdd: (h: Omit<Habit, 'id' | 'completedCount' | 'streak' | 'lastCheckInDate' | 'isCompletedToday' | 'createdAt'>) => void }> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>(HabitType.Life);
  const [targetCount, setTargetCount] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold mb-4 text-slate-800">New Habit</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Habit Name</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" 
              placeholder="e.g. Read 10 pages"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-500 mb-1">Type</label>
               <select 
                 value={type} onChange={e => setType(e.target.value as HabitType)}
                 className="w-full p-3 rounded-xl border border-slate-200"
               >
                 {Object.values(HabitType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-500 mb-1">Daily Goal</label>
               <input 
                 type="number" min="1"
                 value={targetCount} onChange={e => setTargetCount(Number(e.target.value))}
                 className="w-full p-3 rounded-xl border border-slate-200"
               />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-brand-blue" onClick={() => {
              if(!title) return;
              onAdd({ title, type, frequency: HabitFrequency.Daily, targetCount, subTasks: [], description: '' });
              onClose();
            }}>Create Habit</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Views ---

const CardHouseView: React.FC<{ user: User; onBack: () => void; onDrawCard: (cost: number) => Promise<GameCard | null> }> = ({ user, onBack, onDrawCard }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [newCard, setNewCard] = useState<GameCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDraw = async () => {
    if (user.coins < 100) {
      setError("Not enough coins! Need 100 💰");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setIsDrawing(true);
    setNewCard(null);
    try {
      const card = await onDrawCard(100);
      setNewCard(card);
    } catch (e) {
      setError("Failed to draw card. Try again.");
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="flex flex-col pb-32 min-h-screen">
       <div className="flex items-center gap-2 mb-6">
         <Button variant="ghost" className="!p-2" onClick={onBack}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
         </Button>
         <h2 className="text-2xl font-bold text-slate-800">Mystic Card House</h2>
       </div>

       {/* Gacha Machine Area */}
       <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-8 min-h-[300px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          {isDrawing ? (
            <div className="flex flex-col items-center animate-pulse">
               <div className="text-6xl mb-4 animate-spin">☯️</div>
               <p className="font-bold text-lg">Summoning Spirit...</p>
            </div>
          ) : newCard ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
               <div className={`w-48 h-64 rounded-xl shadow-2xl border-4 flex flex-col items-center overflow-hidden bg-white text-slate-800 relative
                 ${newCard.rarity === 'Legendary' ? 'border-yellow-400 shadow-yellow-400/50' : 
                   newCard.rarity === 'Epic' ? 'border-purple-400 shadow-purple-400/50' :
                   newCard.rarity === 'Rare' ? 'border-blue-400' : 'border-slate-300'}`}>
                   {newCard.imageUrl ? (
                     <img src={newCard.imageUrl} alt={newCard.name} className="w-full h-40 object-cover" />
                   ) : (
                     <div className="w-full h-40 bg-slate-200 flex items-center justify-center text-4xl">🎨</div>
                   )}
                   <div className="p-2 w-full text-center">
                     <p className="text-xs font-bold uppercase tracking-wider opacity-50">{newCard.rarity}</p>
                     <h3 className="font-bold text-lg leading-tight">{newCard.name}</h3>
                     <p className="text-xs text-slate-500">{newCard.title}</p>
                     <div className="mt-2 text-xs font-mono bg-slate-100 rounded px-2 py-1 inline-block">Value: {newCard.value} 💰</div>
                   </div>
               </div>
               <Button variant="gold" className="mt-6 w-full" onClick={() => setNewCard(null)}>Draw Again (100 💰)</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center z-10 text-center">
              <div className="text-6xl mb-4 drop-shadow-lg">🎴</div>
              <h3 className="text-xl font-bold mb-2">Taoist Legends Collection</h3>
              <p className="text-indigo-200 text-sm mb-6 max-w-[200px]">Summon ancient figures. Collect them all to unlock special planet auras.</p>
              
              <Button variant="gold" onClick={handleDraw} className="w-48 py-3 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                Draw Card <span className="text-sm opacity-80 ml-1">(100 💰)</span>
              </Button>
              {error && <p className="text-red-300 text-sm mt-3 font-bold animate-pulse">{error}</p>}
            </div>
          )}
       </div>

       {/* Collection Grid */}
       <div>
         <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-slate-700 text-lg">My Collection <span className="text-slate-400 text-sm">({user.collectedCards.length})</span></h3>
            <span className="text-sm font-bold text-brand-yellow">💰 {user.coins}</span>
         </div>
         
         {user.collectedCards.length === 0 ? (
           <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
             No cards yet. Start drawing!
           </div>
         ) : (
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             {user.collectedCards.slice().reverse().map((card) => (
               <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                 <div className="h-24 bg-slate-100 relative">
                   {card.imageUrl ? <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>}
                   <span className={`absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm text-white
                     ${card.rarity === 'Legendary' ? 'bg-yellow-500' : 
                       card.rarity === 'Epic' ? 'bg-purple-500' :
                       card.rarity === 'Rare' ? 'bg-blue-500' : 'bg-slate-400'}`}>
                     {card.rarity[0]}
                   </span>
                 </div>
                 <div className="p-2">
                   <h4 className="font-bold text-sm text-slate-800 truncate">{card.name}</h4>
                   <p className="text-[10px] text-slate-500 truncate">{card.title}</p>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
};

const DashboardView: React.FC<{ 
  habits: Habit[]; 
  user: User; 
  onCheckIn: (id: string, note?: string) => void; 
  onToggleSubTask: (hId: string, sId: string) => void;
  onDelete: (id: string) => void;
}> = ({ habits, user, onCheckIn, onToggleSubTask, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Simple sorting: Pending first
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.isCompletedToday === b.isCompletedToday) return 0;
    return a.isCompletedToday ? 1 : -1;
  });

  return (
    <div className="space-y-6 pb-32">
      {/* Pet Header */}
      <div className="bg-gradient-to-br from-brand-blue to-cyan-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Icons.Planet width={120} height={120} /></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-white/30">
            {user.petLevel > 5 ? '🐲' : user.petLevel > 2 ? '🦖' : '🥚'}
          </div>
          <div>
            <h2 className="text-lg font-bold">Lvl {user.petLevel} {user.petName}</h2>
            <div className="w-32 h-2 bg-black/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-brand-yellow transition-all duration-500" style={{ width: `${(user.petExp % 100)}%` }} />
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
        {sortedHabits.map(habit => (
          <Card key={habit.id} className={`transition-all duration-300 ${habit.isCompletedToday ? 'opacity-60 bg-slate-50' : 'hover:translate-y-[-2px]'}`}>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => !habit.isCompletedToday && onCheckIn(habit.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-sm
                  ${habit.isCompletedToday ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
              >
                {habit.isCompletedToday ? <Icons.Check /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
              </div>
              
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === habit.id ? null : habit.id)}>
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${habit.isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {habit.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                    <Icons.Fire width={12} height={12} /> {habit.streak}
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge colorClass={HABIT_TYPE_COLORS[habit.type]}>{habit.type}</Badge>
                  <span className="text-xs text-slate-400 py-1">{habit.completedCount}/{habit.targetCount}</span>
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
                       <div key={st.id} 
                            onClick={() => onToggleSubTask(habit.id, st.id)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.isCompleted ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'}`}>
                           {st.isCompleted && <Icons.Check width={10} className="text-white" />}
                         </div>
                         <span className={`text-sm ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.title}</span>
                       </div>
                     ))}
                   </div>
                )}
                <div className="flex justify-between items-center">
                  <button onClick={() => onDelete(habit.id)} className="text-xs text-red-400 hover:text-red-600">Delete Habit</button>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs py-1 h-8" onClick={() => onCheckIn(habit.id, "Late entry")}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

const PlanetView: React.FC<{ user: User, onEnterCardHouse: () => void }> = ({ user, onEnterCardHouse }) => {
  return (
    <div className="flex flex-col pb-32 min-h-[80vh]">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">My Planet</h2>
      <div className="flex-1 bg-gradient-to-b from-[#1a2a6c] to-[#b21f1f] rounded-3xl relative overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px]">
        {/* Simple CSS Stars */}
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full opacity-70"></div>
        
        {/* The Planet */}
        <div className="relative w-64 h-64 bg-emerald-500 rounded-full shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-1000 hover:scale-105">
           {/* Planet Details based on level */}
           <div className="absolute w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
           {user.petLevel > 2 && <div className="absolute bottom-0 w-full h-20 bg-blue-500 opacity-50 rounded-b-full"></div>}
           
           {/* The Pet */}
           <div className="z-10 text-9xl animate-bounce cursor-pointer hover:scale-110 transition-transform">
             {user.petLevel > 5 ? '🐲' : user.petLevel > 2 ? '🦖' : '🥚'}
           </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-1 gap-4">
        <Button variant="gold" onClick={onEnterCardHouse} className="w-full py-4 text-lg shadow-xl bg-indigo-600 hover:bg-indigo-700">
           <span className="text-2xl mr-2">🎴</span> Enter Card House
        </Button>
      </div>
      
      {/* Shop / Inventory Preview */}
      <div className="mt-8">
        <h3 className="font-bold text-slate-700 mb-4 text-lg">Shop & Inventory</h3>
        <div className="grid grid-cols-4 gap-4">
          {['🏠', '🌲', '🍄', '🏔️', '🚀', '🎁', '💎', '🔑'].map((item, i) => (
             <div key={i} className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-slate-100 hover:shadow-md transition-all">
               <span className="text-3xl mb-1">{item}</span>
               <span className="text-[10px] font-bold text-slate-400">{50 * (i+1)} 💰</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsView: React.FC<{ habits: Habit[], checkIns: CheckInRecord[] }> = ({ habits, checkIns }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Prepare chart data (Last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = checkIns.filter(c => c.dateString === dateStr).length;
      days.push({ name: dateStr.slice(5), count });
    }
    return days;
  }, [checkIns]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    checkIns.forEach(c => {
      const h = habits.find(h => h.id === c.habitId);
      if(h) counts[h.type] = (counts[h.type] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [checkIns, habits]);

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getHabitAdvice(habits, checkIns);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
      
      <Card>
        <h3 className="font-bold text-slate-600 mb-4">Activity (Last 7 Days)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
               <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={3} dot={{ r: 4, fill: '#2196F3', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-2">
           <h4 className="text-sm font-bold text-slate-400 mb-2">Completion Rate</h4>
           <span className="text-3xl font-black text-brand-green">82%</span>
        </Card>
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
          <Button variant="ghost" className="text-xs bg-purple-50 text-purple-600" onClick={handleGetAdvice} disabled={loadingAdvice}>
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

const SocialView: React.FC = () => {
  return (
    <div className="space-y-6 pb-32">
      <h2 className="text-2xl font-bold text-slate-800">Community</h2>
      
      {/* Groups Scroll */}
      <div>
        <h3 className="font-bold text-slate-600 mb-3 px-2">Popular Groups</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2">
          {MOCK_GROUPS.map(g => (
            <div key={g.id} className="min-w-[200px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {g.name[0]}
              </div>
              <h4 className="font-bold text-slate-800 leading-tight">{g.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{g.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-slate-500">{g.members} members</span>
                <button className={`text-xs px-3 py-1 rounded-full font-bold ${g.isJoined ? 'bg-slate-100 text-slate-500' : 'bg-brand-blue text-white'}`}>
                  {g.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div>
        <h3 className="font-bold text-slate-600 mb-3 px-2">Friends Activity</h3>
        <div className="space-y-4">
          {MOCK_FEED.map(post => (
             <Card key={post.id} className="p-4">
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                    <img src={`https://picsum.photos/seed/${post.userName}/200`} alt="avatar" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-800">
                     {post.userName} <span className="font-normal text-slate-500">{post.action === 'streak' ? 'hit a streak on' : 'completed'}</span>
                   </p>
                   <p className="text-xs text-slate-400">{post.timeAgo} ago</p>
                 </div>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl mb-3 border border-slate-100">
                  <span className="font-semibold text-brand-green">{post.habitTitle}</span>
               </div>
               <div className="flex gap-4 text-slate-400 text-sm">
                 <button className={`flex items-center gap-1 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}>
                   ❤️ {post.likes}
                 </button>
                 <button className="flex items-center gap-1 hover:text-blue-500">
                   💬 {post.comments}
                 </button>
               </div>
             </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Navbar: React.FC<{ activeTab: string; onChange: (t: string) => void }> = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'home', icon: Icons.Home, label: 'Habits' },
    { id: 'planet', icon: Icons.Planet, label: 'Planet' },
    { id: 'stats', icon: Icons.Stats, label: 'Stats' },
    { id: 'social', icon: Icons.Social, label: 'Social' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 pb-safe pt-2 px-6 shadow-2xl z-40">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button 
              key={t.id} 
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-brand-blue -translate-y-2' : 'text-slate-400'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-50 shadow-blue-200 shadow-md' : ''}`}>
                <t.icon width={isActive ? 24 : 22} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  // State to toggle between Planet view and Card House view within the "planet" tab
  const [showCardHouse, setShowCardHouse] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<User>(storage.getUser()); 
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);

  // Init Data
  useEffect(() => {
    setHabits(storage.getHabits());
    setUser(storage.getUser());
    setCheckIns(storage.getCheckIns());
  }, []);

  const handleAddHabit = (newHabitData: any) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Date.now().toString(),
      streak: 0,
      completedCount: 0,
      isCompletedToday: false,
      lastCheckInDate: null,
      createdAt: Date.now()
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    storage.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    storage.saveHabits(updated);
  };

  const handleCheckIn = (id: string, note?: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    // Simulate location (Mock)
    let location = { lat: 0, lng: 0 };
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => { location = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
         (err) => console.log('Geo permission denied or error')
       );
    }

    // 1. Update Habits State
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(h => {
      if (h.id === id) {
        const newStreak = h.streak + 1;
        return { 
          ...h, 
          isCompletedToday: true, 
          completedCount: h.completedCount + 1, 
          streak: newStreak,
          lastCheckInDate: today 
        };
      }
      return h;
    });
    setHabits(updatedHabits);
    storage.saveHabits(updatedHabits);

    // 2. Add Record
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      habitId: id,
      timestamp: Date.now(),
      dateString: today,
      note,
      location
    };
    const newCheckIns = [...checkIns, newRecord];
    setCheckIns(newCheckIns);
    storage.addCheckIn(newRecord);

    // 3. Update User (Rewards)
    const bonus = habit.streak > 3 ? 2 : 1; // Streak multiplier
    const coinsEarned = 10 * bonus;
    const expEarned = 15;
    
    // Level Up Logic
    let newLevel = user.petLevel;
    let newExp = user.petExp + expEarned;
    if (newExp >= 100) {
      newLevel += 1;
      newExp = newExp - 100;
      alert(`🎉 Level Up! Your pet is now level ${newLevel}!`);
    }

    const updatedUser = { 
      ...user, 
      coins: user.coins + coinsEarned,
      petLevel: newLevel,
      petExp: newExp
    };
    setUser(updatedUser);
    storage.saveUser(updatedUser);
  };

  const handleToggleSubTask = (habitId: string, subTaskId: string) => {
    const updatedHabits = habits.map(h => {
      if(h.id === habitId) {
        const updatedSubs = h.subTasks.map(st => 
          st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        return { ...h, subTasks: updatedSubs };
      }
      return h;
    });
    setHabits(updatedHabits);
    storage.saveHabits(updatedHabits);
  };
  
  // Card Draw Logic
  const handleDrawCard = async (cost: number): Promise<GameCard | null> => {
     if (user.coins < cost) return null;
     
     const FIGURES = [
        { name: 'Laozi', title: 'The Founder of Taoism' },
        { name: 'Zhuangzi', title: 'The Carefree Sage' },
        { name: 'Zhang Daoling', title: 'Celestial Master' },
        { name: 'Lu Dongbin', title: 'Sword Immortal' },
        { name: 'He Xiangu', title: 'Lotus Immortal' },
        { name: 'Tie Guaili', title: 'Iron Crutch Immortal' },
        { name: 'Jade Emperor', title: 'Ruler of Heaven' },
        { name: 'Queen Mother of the West', title: 'Keeper of Peaches' },
        { name: 'Nezha', title: 'Third Lotus Prince' },
        { name: 'Jiang Ziya', title: 'Grand Duke' },
     ];
     
     // 1. Determine Rarity
     const rand = Math.random();
     let rarity: GameCard['rarity'] = 'Common';
     if (rand > 0.95) rarity = 'Legendary';
     else if (rand > 0.85) rarity = 'Epic';
     else if (rand > 0.60) rarity = 'Rare';
     
     const rarityMult = { Common: 1, Rare: 5, Epic: 20, Legendary: 100 };
     
     // 2. Pick Figure
     const figure = FIGURES[Math.floor(Math.random() * FIGURES.length)];
     
     // 3. Generate Image
     const imageUrl = await generateCardImage(figure.name, figure.title);
     
     // 4. Create Card
     const newCard: GameCard = {
         id: Date.now().toString(),
         name: figure.name,
         title: figure.title,
         rarity,
         value: Math.floor((Math.random() * 50 + 10) * rarityMult[rarity]),
         imageUrl,
         description: `A mystical card of ${figure.name}.`,
         obtainedAt: Date.now()
     };
     
     // 5. Update User State
     const updatedUser = {
         ...user,
         coins: user.coins - cost,
         collectedCards: [...(user.collectedCards || []), newCard]
     };
     setUser(updatedUser);
     storage.saveUser(updatedUser);
     
     return newCard;
  };

  // Render View based on Tab
  const renderContent = () => {
    switch(activeTab) {
      case 'home': return <DashboardView habits={habits} user={user} onCheckIn={handleCheckIn} onToggleSubTask={handleToggleSubTask} onDelete={handleDeleteHabit} />;
      case 'planet': 
        if (showCardHouse) return <CardHouseView user={user} onBack={() => setShowCardHouse(false)} onDrawCard={handleDrawCard} />;
        return <PlanetView user={user} onEnterCardHouse={() => setShowCardHouse(true)} />;
      case 'stats': return <StatsView habits={habits} checkIns={checkIns} />;
      case 'social': return <SocialView />;
      default: return <DashboardView habits={habits} user={user} onCheckIn={handleCheckIn} onToggleSubTask={handleToggleSubTask} onDelete={handleDeleteHabit} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-y-auto">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
          <h1 className="text-xl font-black text-brand-green tracking-tight flex items-center gap-2">
            <Icons.Sparkles className="text-brand-yellow fill-brand-yellow" width={20}/>
            HabitPlanet
          </h1>
          {activeTab === 'home' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-brand-blue text-white p-2 rounded-full shadow-lg shadow-blue-300 hover:scale-110 transition-transform active:scale-90"
            >
              <Icons.Plus width={20} />
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {renderContent()}
        </main>

        {/* Navigation */}
        <Navbar activeTab={activeTab} onChange={(t) => { setActiveTab(t); setShowCardHouse(false); }} />

        {/* Modals */}
        {showAddModal && <AddHabitModal onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} />}
      </div>
    </div>
  );
};

export default App;