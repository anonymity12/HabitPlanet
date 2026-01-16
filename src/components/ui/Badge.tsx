import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  colorClass: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, colorClass }) => (
  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
    {children}
  </span>
);
