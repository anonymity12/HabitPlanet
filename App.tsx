
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Habit, User, CheckInRecord, HabitType, HabitFrequency, SubTask, Card as GameCard } from './types';
import { api } from './client/api'; // NEW: Import API client
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

const Loader: React.FC = () => (
  <div className="flex justify-center p-4">
    <div className="w-6 h-6 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// --- Modals ---

const AddHabitModal: React.FC<{ onClose: () => void; onAdd: (h: Partial<Habit>) => void }> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>(HabitType.Life);
  const [targetCount, setTargetCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if(!title) return;
    setSubmitting(true);
    await onAdd({ title, type, frequency: HabitFrequency.Daily, targetCount, subTasks: [], description: '' });
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
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button className="flex-1 bg-brand-blue" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Views ---

const CardHouseView: React.FC<{ user: User; onBack: () => void; onDrawCard: () => Promise<GameCard | null> }> = ({ user, onBack, onDrawCard }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [newCard, setNewCard] = useState<GameCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDraw = async () => {
    setIsDrawing(true);
    setNewCard(null);
    setError(null);
    try {
      const card = await onDrawCard();
      setNewCard(card);
    } catch (e: any) {
      setError(e.message || "Failed to draw card.");
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
            <div className="flex flex-col items-center animate-in zoom-in duration-500 w-full">
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
  isLoading: boolean;
}> = ({ habits, user, onCheckIn, onToggleSubTask, onDelete, isLoading }) => {
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
        {isLoading ? <Loader /> : sortedHabits.map(habit => (
          <Card key={habit.id} className={`transition-all duration-300 ${habit.isCompletedToday ? 'opacity-60 bg-slate-50' : 'hover:translate-y-[-2px]'}`}>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => !habit.isCompletedToday && !checkingInId && handleCheckInClick(habit.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-sm relative
                  ${habit.isCompletedToday ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
              >
                {checkingInId === habit.id ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/>
                ) : habit.isCompletedToday ? <Icons.Check /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
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
           <div className="absolute w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
           {user.petLevel > 2 && <div className="absolute bottom-0 w-full h-20 bg-blue-500 opacity-50 rounded-b-full"></div>}
           
           {/* The Pet */}
           <div className="z-10 text-9xl animate-bounce cursor-pointer hover:scale-110 transition-transform">
             {user.petLevel > 5 ? '🐲' : user.petLevel > 2 ? '🦖' : '🥚'}
           </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-4">
        <Button variant="gold" onClick={onEnterCardHouse} className="w-full py-4 text-lg shadow-xl bg-indigo-600 hover:bg-indigo-700">
           <span className="text-2xl mr-2">🎴</span> Enter Card House
        </Button>
      </div>
      
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

const StatsView: React.FC = () => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    api.user.getStats().then(setCheckIns).catch(console.error);
  }, []);

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
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
               <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={3} dot={{ r: 4, fill: '#2196F3', strokeWidth: 2, stroke: '#fff' }} />
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
  const [showCardHouse, setShowCardHouse] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
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
    if(confirm("Are you sure?")) {
        await api.habits.delete(id);
        await fetchData();
    }
  };

  const handleCheckIn = async (id: string, note?: string) => {
    try {
        // Simulate Geo
        let lat, lng;
        if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(pos => { lat=pos.coords.latitude; lng=pos.coords.longitude; });
        }

        const res = await api.habits.checkIn(id, note, lat, lng);
        
        // Optimistic UI update or Full Refresh? Full refresh is safer for sync.
        // For smoother UX, we can update local state manually:
        setHabits(current => current.map(h => h.id === id ? res.updatedHabit : h));
        setUser(current => {
            if(!current) return null;
            return {
                ...current,
                coins: current.coins + res.rewards.coins,
                petExp: res.rewards.exp, // This simplifies level up logic, ideally we refetch user
                petLevel: res.rewards.newLevel || current.petLevel
            }
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

  if (!user && !isLoading) return <div>Failed to load user.</div>;

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
          {isLoading || !user ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                <Loader />
                <p className="mt-4 text-sm font-bold">Connecting to Planet...</p>
            </div>
          ) : (
            (() => {
                switch(activeTab) {
                    case 'home': return <DashboardView habits={habits} user={user} onCheckIn={handleCheckIn} onToggleSubTask={handleToggleSubTask} onDelete={handleDeleteHabit} isLoading={isLoading} />;
                    case 'planet': 
                        if (showCardHouse) return <CardHouseView user={user} onBack={() => setShowCardHouse(false)} onDrawCard={handleDrawCard} />;
                        return <PlanetView user={user} onEnterCardHouse={() => setShowCardHouse(true)} />;
                    case 'stats': return <StatsView />;
                    case 'social': return <div className="text-center py-10 text-slate-400">Social Feed (Coming Soon)</div>; // Simple placeholder as social view components were MOCK_FEED based, logic moved
                    default: return null;
                }
            })()
          )}
        </main>

        <Navbar activeTab={activeTab} onChange={(t) => { setActiveTab(t); setShowCardHouse(false); }} />

        {showAddModal && <AddHabitModal onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} />}
      </div>
    </div>
  );
};

export default App;
