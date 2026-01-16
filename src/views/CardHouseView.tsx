import React, { useState } from 'react';
import { User, Card as GameCard } from '../../types';
import { Button } from '../ui';

interface CardHouseViewProps {
  user: User;
  onBack: () => void;
  onDrawCard: () => Promise<GameCard | null>;
}

export const CardHouseView: React.FC<CardHouseViewProps> = ({ user, onBack, onDrawCard }) => {
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
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
                <div className="mt-2 text-xs font-mono bg-slate-100 rounded px-2 py-1 inline-block">
                  Value: {newCard.value} 💰
                </div>
              </div>
            </div>
            <Button variant="gold" className="mt-6 w-full" onClick={() => setNewCard(null)}>
              Draw Again (100 💰)
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center z-10 text-center">
            <div className="text-6xl mb-4 drop-shadow-lg">🎴</div>
            <h3 className="text-xl font-bold mb-2">Taoist Legends Collection</h3>
            <p className="text-indigo-200 text-sm mb-6 max-w-[200px]">
              Summon ancient figures. Collect them all to unlock special planet auras.
            </p>
            
            <Button 
              variant="gold" 
              onClick={handleDraw} 
              className="w-48 py-3 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Draw Card <span className="text-sm opacity-80 ml-1">(100 💰)</span>
            </Button>
            {error && (
              <p className="text-red-300 text-sm mt-3 font-bold animate-pulse">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Collection Grid */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-700 text-lg">
            My Collection <span className="text-slate-400 text-sm">({user.collectedCards.length})</span>
          </h3>
          <span className="text-sm font-bold text-brand-yellow">💰 {user.coins}</span>
        </div>
        
        {user.collectedCards.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No cards yet. Start drawing!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {user.collectedCards.slice().reverse().map((card) => (
              <div 
                key={card.id} 
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="h-24 bg-slate-100 relative">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                  )}
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
