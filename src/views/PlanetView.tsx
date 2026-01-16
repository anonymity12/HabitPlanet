import React from 'react';
import { User } from '../../types';
import { Button } from '../ui';

interface PlanetViewProps {
  user: User;
  onEnterCardHouse: () => void;
}

export const PlanetView: React.FC<PlanetViewProps> = ({ user, onEnterCardHouse }) => {
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
          {user.petLevel > 2 && (
            <div className="absolute bottom-0 w-full h-20 bg-blue-500 opacity-50 rounded-b-full"></div>
          )}
          
          {/* The Pet */}
          <div className="z-10 text-9xl animate-bounce cursor-pointer hover:scale-110 transition-transform">
            {user.petLevel > 5 ? '🐲' : user.petLevel > 2 ? '🦖' : '🥚'}
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-4">
        <Button 
          variant="gold" 
          onClick={onEnterCardHouse} 
          className="w-full py-4 text-lg shadow-xl bg-indigo-600 hover:bg-indigo-700"
        >
          <span className="text-2xl mr-2">🎴</span> Enter Card House
        </Button>
      </div>
      
      <div className="mt-8">
        <h3 className="font-bold text-slate-700 mb-4 text-lg">Shop & Inventory</h3>
        <div className="grid grid-cols-4 gap-4">
          {['🏠', '🌲', '🍄', '🏔️', '🚀', '🎁', '💎', '🔑'].map((item, i) => (
            <div 
              key={i} 
              className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-slate-100 hover:shadow-md transition-all"
            >
              <span className="text-3xl mb-1">{item}</span>
              <span className="text-[10px] font-bold text-slate-400">{50 * (i + 1)} 💰</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
