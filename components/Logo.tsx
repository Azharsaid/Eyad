
import React from 'react';

export const DadLogo = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 bg-[#00A88F] rounded-full flex items-center justify-center border-2 border-[#0B2E4F]/10">
      <div className="w-6 h-1 bg-white rounded-full"></div>
    </div>
    <div className="flex flex-col">
      <span className="font-black text-[#0B2E4F] text-xl leading-tight">Dar Al Dawa</span>
      <span className="text-[10px] uppercase tracking-widest text-[#00A88F] font-bold">Trusted Quality</span>
    </div>
  </div>
);

export const AnniversaryLogo = ({ className = "h-16" }: { className?: string }) => (
  <div className={`relative group animate-float cursor-default ${className}`}>
    <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-xl">
      <path d="M40 20 Q 20 20 20 40 L 20 60 Q 20 80 40 80 L 160 80 Q 180 80 180 60 L 180 40 Q 180 20 160 20 Z" fill="white" />
      <text x="50" y="65" fontFamily="Inter" fontSize="48" fontWeight="900" fill="#0B2E4F">50</text>
      <text x="110" y="50" fontFamily="Inter" fontSize="16" fontWeight="900" fill="#0B2E4F">YEARS</text>
      <text x="110" y="70" fontFamily="Inter" fontSize="12" fontWeight="500" fill="#00A88F">of Excellence</text>
    </svg>
    <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-navy-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
  </div>
);
