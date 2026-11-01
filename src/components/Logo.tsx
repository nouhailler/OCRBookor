/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  version?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  version = 'v1.2',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* SVG Icon Badge */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Stylized Book Left Page */}
          <path
            d="M6 8C10 7 15 9 17 11V29C15 27 10 25 6 26V8Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          {/* Stylized Book Right Page */}
          <path
            d="M30 8C26 7 21 9 19 11V29C21 27 26 25 30 26V8Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* Book Spine Center Highlight */}
          <path
            d="M17 11C17.7 10.3 18.3 10.3 19 11V29C18.3 28.5 17.7 28.5 17 29V11Z"
            fill="#C7D2FE"
          />
          {/* Laser Scanner Horizontal Beam */}
          <path
            d="M3 17.5H33"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="2 1"
          />
          {/* Laser Glow Indicator */}
          <circle cx="18" cy="17.5" r="2.5" fill="#38BDF8" className="animate-pulse" />
          {/* OCR Letter 'A' Glyphs on right page */}
          <path
            d="M24 16L25.5 20M25.5 20L27 24M25.5 20H23"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        {/* Optical Scanning Line Glow Effect */}
        <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-20 blur-sm -z-10"></span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 leading-none">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white font-sans ${textSizes[size]}`}>
              OCR<span className="text-indigo-600 dark:text-indigo-400">Bookor</span>
            </span>
            {version && (
              <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                {version}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 tracking-normal mt-0.5 hidden sm:block">
            Numérisation & Reconstruction de Livres
          </span>
        </div>
      )}
    </div>
  );
};
