import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Camera, 
  BookOpen, 
  GraduationCap, 
  User, 
  Wifi, 
  Battery, 
  Signal, 
  Moon, 
  Sun, 
  Smartphone, 
  Maximize2,
  Download
} from 'lucide-react';

import { useLiveDateTime } from '../services/datetime';
import { InstallAppModal } from './InstallAppModal';

export type TabType = 'home' | 'tutor' | 'snap' | 'explore' | 'tests' | 'profile';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { timeString, timeWithSeconds, shortDate } = useLiveDateTime();

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-200/90 text-slate-800'
      }`}
    >
      {/* Top Floating Control Toolbar (Device Toggle & Dark Mode) */}
      <header aria-label="Device Controls" className="w-full max-w-2xl px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
            NG Chat
          </span>
          <span className="text-slate-400">•</span>
          {/* Live Updating Date and Time badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{shortDate}</span>
            <span>•</span>
            <span className="font-mono font-semibold">{timeWithSeconds}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct APK Download / Install on Phone */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-xs hover:from-amber-600 hover:to-orange-600 font-bold transition transform active:scale-95"
            title="Download APK / Install on Phone"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">APK / Install</span>
          </button>

          {/* Mobile Frame / Fullscreen Toggle */}
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 transition"
            title="Toggle Phone Frame"
          >
            {deviceFrameMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Full Width</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Phone Frame</span>
              </>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 transition"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container / Phone Chassis */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          deviceFrameMode
            ? 'max-w-[430px] h-[92vh] max-h-[890px] rounded-[42px] border-[8px] border-slate-800/90 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-white/20'
            : 'max-w-2xl h-screen rounded-none border-none shadow-none'
        } bg-white dark:bg-slate-900`}
      >
        {/* Android Status Bar (9:35 PM, 58% battery from screenshot) */}
        <div className="h-7 w-full px-5 pt-1.5 flex items-center justify-between text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-200 select-none z-40 bg-inherit shrink-0">
          <div className="flex items-center gap-1">
            <span>{timeString}</span>
          </div>

          {/* Android Punch Hole Camera cutout (Phone chassis) */}
          {deviceFrameMode && (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700/60 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          )}

          {/* Right status icons: Signal, Wi-Fi, 58% Battery */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5 text-[11px]">
              <span>58%</span>
              <Battery className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Screen Content Viewport */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>

        {/* ANDROID BOTTOM NAVIGATION BAR (5 Main Navigation Sections + Snap Button) */}
        <nav aria-label="Main Navigation" className="h-16 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 flex items-center justify-around z-40 shrink-0 select-none">
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
              activeTab === 'home'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 2. AI Tutor */}
          <button
            onClick={() => onTabChange('tutor')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
              activeTab === 'tutor'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">AI Tutor</span>
          </button>

          {/* CENTER: Snap & Solve Floating Primary Button */}
          <div className="relative -top-3">
            <button
              onClick={() => onTabChange('snap')}
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90 ${
                activeTab === 'snap'
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 text-white ring-4 ring-orange-200 dark:ring-orange-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
              }`}
              title="Snap & Solve Camera"
            >
              <Camera className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-tight">Solve</span>
            </button>
          </div>

          {/* 3. Explore (Learn Topics) */}
          <button
            onClick={() => onTabChange('explore')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
              activeTab === 'explore'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Explore</span>
          </button>

          {/* 4. Tests */}
          <button
            onClick={() => onTabChange('tests')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
              activeTab === 'tests'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px]">Tests</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
              activeTab === 'profile'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>

        {/* Android Gesture Bar pill indicator at bottom */}
        {deviceFrameMode && (
          <div className="w-full pb-1 pt-0.5 bg-white dark:bg-slate-900 flex justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        )}
      </div>

      {/* APK & Phone Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
