/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

interface TooltipProps {
  title: string;
  content: string;
  tip?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'info' | 'help' | 'subtle';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  content,
  tip,
  placement = 'top',
  variant = 'help',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        aria-label={`Aide : ${title}`}
        className="p-0.5 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {variant === 'info' ? (
          <Info className="w-3.5 h-3.5" />
        ) : (
          <HelpCircle className="w-3.5 h-3.5" />
        )}
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 sm:w-72 p-3 text-xs rounded-xl shadow-xl border backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 ${placementClasses[placement]} bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-slate-900/10 dark:shadow-black/40`}
        >
          <div className="flex items-start justify-between gap-1 mb-1">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 sm:hidden"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {content}
          </p>
          {tip && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>💡</span>
              <span>{tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
