import React from 'react';
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-gray-700 text-white hover:bg-gray-600',
  tertiary: 'bg-transparent text-accent border border-accent hover:bg-accent/10',
};

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', onClick, className = '' }) => {
  const classes = `${variantClasses[variant]} rounded-lg px-4 py-2 font-medium transition-colors ${className}`;
  return (
    <button className={classes} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;