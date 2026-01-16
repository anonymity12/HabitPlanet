import React from 'react';
import { Icons } from '../../constants';

interface NavbarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChange }) => {
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
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-brand-blue -translate-y-2' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 shadow-blue-200 shadow-md' : ''
              }`}>
                <t.icon width={isActive ? 24 : 22} />
              </div>
              <span className={`text-[10px] font-bold ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
