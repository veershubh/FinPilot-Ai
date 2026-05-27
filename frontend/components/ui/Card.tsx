import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'borderless';
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClass = 'glass-card rounded-lg p-6 border border-border flex flex-col';
  let classString = baseClass;
  if (variant === 'borderless') {
    classString += ' border-hidden';
  }
  return (
    <div className={`${classString} ${className}`}>
      {children}
    </div>
  );
};

export default Card;