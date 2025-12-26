
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-[#161920] border border-[#23272F] rounded-3xl p-6 shadow-xl shadow-black/20 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="text-lg font-semibold text-white/90 tracking-tight">{title}</h3>}
          {icon && <div className="text-[#2DD4BF] opacity-80">{icon}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
