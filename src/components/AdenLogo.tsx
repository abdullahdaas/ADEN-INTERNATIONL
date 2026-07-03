import React from 'react';

interface AdenLogoProps {
  className?: string;
  size?: number;
}

export default function AdenLogo({ className = '', size = 48 }: AdenLogoProps) {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`} style={{ width: size * 2.5, height: size }}>
      <img 
        src="/logo.png" 
        alt="Aden Logo" 
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
}
