import React from 'react';

interface LogoProps {
  className?: string;
  dark?: boolean;
}

export const Logo = ({ className = "", dark = false }: LogoProps) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className={`absolute inset-0 bg-wavy-teal rotate-45 rounded-xl opacity-20 animate-pulse`}></div>
      <div className={`relative z-10 w-8 h-8 ${dark ? 'bg-white' : 'bg-wavy-dark'} rounded-xl flex items-center justify-center border-2 border-wavy-teal/50 shadow-lg shadow-wavy-teal/20`}>
        <div className="text-wavy-teal font-black text-xl italic select-none">W</div>
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-wavy-lime rounded-full blur-[1px]"></div>
    </div>
    <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'} tracking-tighter flex items-baseline`}>
      Wavy<span className="text-wavy-teal">Ledger</span>
    </span>
  </div>
);

export default Logo;
