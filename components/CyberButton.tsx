import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger';
  children: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-2 font-display font-bold uppercase tracking-wider transition-all duration-200 clip-path-polygon group";
  
  const variants = {
    primary: "bg-cyan-900/30 text-cyan-400 border border-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]",
    danger: "bg-red-900/30 text-red-400 border border-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50"></span>
      {children}
    </button>
  );
};