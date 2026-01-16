import React, { useState } from 'react';
import { Icons } from './src/constants';
import { Loader } from './src/components/ui';
import { Navbar } from './src/components/layout';
import { AddHabitModal } from './src/components/AddHabitModal';
import { DashboardView, PlanetView, CardHouseView, StatsView } from './src/views';
import { useHabitPlanet } from './src/hooks';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showCardHouse, setShowCardHouse] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    habits,
    user,
    isLoading,
    handleAddHabit,
    handleDeleteHabit,
    handleCheckIn,
    handleToggleSubTask,
    handleDrawCard
  } = useHabitPlanet();

  if (!user && !isLoading) {
    return <div>Failed to load user.</div>;
  }

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
                case 'home': 
                  return (
                    <DashboardView 
                      habits={habits} 
                      user={user} 
                      onCheckIn={handleCheckIn} 
                      onToggleSubTask={handleToggleSubTask} 
                      onDelete={handleDeleteHabit} 
                      isLoading={isLoading} 
                    />
                  );
                case 'planet': 
                  if (showCardHouse) {
                    return (
                      <CardHouseView 
                        user={user} 
                        onBack={() => setShowCardHouse(false)} 
                        onDrawCard={handleDrawCard} 
                      />
                    );
                  }
                  return (
                    <PlanetView 
                      user={user} 
                      onEnterCardHouse={() => setShowCardHouse(true)} 
                    />
                  );
                case 'stats': 
                  return <StatsView />;
                case 'social': 
                  return (
                    <div className="text-center py-10 text-slate-400">
                      Social Feed (Coming Soon)
                    </div>
                  );
                default: 
                  return null;
              }
            })()
          )}
        </main>

        <Navbar 
          activeTab={activeTab} 
          onChange={(t) => { 
            setActiveTab(t); 
            setShowCardHouse(false); 
          }} 
        />

        {showAddModal && (
          <AddHabitModal 
            onClose={() => setShowAddModal(false)} 
            onAdd={handleAddHabit} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
