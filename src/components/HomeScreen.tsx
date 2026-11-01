import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Lightbulb, 
  Flame, 
  Calculator, 
  Atom, 
  Layers, 
  Search,
  ScanLine,
  Zap,
  TrendingUp,
  Award,
  Download,
  Smartphone
} from 'lucide-react';
import { SolvedQuestion, UserProfile } from '../types';
import { Storage } from '../services/storage';
import { useLiveDateTime } from '../services/datetime';
import { Mascot } from './Mascot';
import { MathRenderer } from './MathRenderer';
import { InstallAppModal } from './InstallAppModal';

interface HomeScreenProps {
  onNavigateTab: (tabId: 'home' | 'tutor' | 'snap' | 'explore' | 'tests' | 'profile') => void;
  onSelectQuestion: (question: SolvedQuestion) => void;
  onSelectSubjectTopic: (subject: string, topic: string) => void;
}

// 12 Subject tiles matching Screenshot 3
const HOME_SUBJECT_GRID = [
  { name: 'Algebra', icon: '∑', category: 'Math', color: 'from-amber-400 to-orange-500' },
  { name: 'Geometry', icon: '📐', category: 'Math', color: 'from-blue-400 to-indigo-500' },
  { name: 'Physics', icon: '⚡', category: 'Science', color: 'from-yellow-400 to-amber-500' },
  { name: 'Chemistry', icon: '⚗️', category: 'Science', color: 'from-teal-400 to-emerald-500' },
  { name: 'Biology', icon: '🔬', category: 'Science', color: 'from-emerald-400 to-green-500' },
  { name: 'Calculus', icon: '∫', category: 'Math', color: 'from-purple-400 to-indigo-500' },
  { name: 'Trigonometry', icon: '⊿', category: 'Math', color: 'from-sky-400 to-blue-500' },
  { name: 'Statistics', icon: '📊', category: 'Math', color: 'from-rose-400 to-pink-500' },
  { name: 'Probability', icon: '🎲', category: 'Math', color: 'from-violet-400 to-purple-500' },
  { name: 'Earth Science', icon: '🌍', category: 'Science', color: 'from-cyan-400 to-blue-500' },
  { name: 'Life Science', icon: '🧬', category: 'Science', color: 'from-lime-400 to-emerald-500' },
  { name: 'Economics', icon: '📈', category: 'Commerce', color: 'from-amber-400 to-orange-500' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onSelectQuestion,
  onSelectSubjectTopic,
}) => {
  const profile: UserProfile = Storage.getUserProfile();
  const recentQuestions = Storage.getSolvedQuestions().slice(0, 3);
  const { fullDate, timeString } = useLiveDateTime();
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mascot mood="happy" size="sm" showBadge />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                NG Chat
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full">
                AI Tutor
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Ask Anything. Learn Everything.
            </p>
          </div>
        </div>

        {/* User streak pill */}
        <button
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-300 shadow-2xs hover:scale-102 transition"
        >
          <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{profile.streakDays} Day Streak</span>
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-5 pb-12">
        {/* Welcome Hero Banner with Nogi Mascot */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 rounded-3xl border border-amber-100 dark:border-slate-800 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1 z-10 max-w-[65%]">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{fullDate}</span>
              <span>•</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{timeString}</span>
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Welcome back, {profile.name.split(' ')[0]}!
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              Ready to crush homework today? 🚀
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Snap a handwritten question or chat directly with Nogi.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('snap')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition transform active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                Snap Problem
              </button>
              <button
                onClick={() => onNavigateTab('tutor')}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 hover:bg-slate-50 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Chat Tutor
              </button>
            </div>
          </div>

          <div className="relative shrink-0 pr-2">
            <Mascot mood="waving" size="lg" className="animate-float" />
          </div>
        </div>

        {/* SECTION: ANDROID APK DOWNLOAD / INSTALL PROMPT */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 rounded-3xl shadow-md flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-100">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App Ready</span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base leading-snug">
              Install NG Chat on your Android phone!
            </h3>
            <p className="text-[11px] text-amber-100 leading-tight">
              Direct 1-tap install or download <strong>ng-chat-ai-tutor.apk</strong> file.
            </p>
          </div>

          <button
            onClick={() => setShowInstallModal(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 font-extrabold rounded-2xl text-xs shadow-md flex items-center gap-1.5 shrink-0 transition transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Install / APK</span>
          </button>
        </div>

        {/* SECTION: SNAP & SOLVE HERO CTA (Matching Screenshot 3 Right Card) */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <ScanLine className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">
                  Instant AI OCR
                </span>
                <h3 className="font-extrabold text-base sm:text-lg">Take a Picture and Solve</h3>
              </div>
            </div>
            <span className="text-xs bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full shadow-xs">
              100% Free
            </span>
          </div>

          <p className="text-xs sm:text-sm text-indigo-100 mb-4 max-w-md leading-relaxed">
            Stuck on a tricky math or science problem? Just take a picture or choose from gallery – we’ll break down each step for you!
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('snap')}
              className="flex-1 py-3 bg-white hover:bg-indigo-50 text-indigo-700 font-extrabold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Open Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SECTION: TWO MAIN PILLARS (Learn Topics & Prepare for Tests) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pillar 1: Learn Topics with Ease (Matching Screenshot 1) */}
          <div
            onClick={() => onNavigateTab('explore')}
            className="p-5 bg-gradient-to-br from-purple-500/10 via-white to-pink-500/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-xs cursor-pointer hover:border-purple-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                  Guided Lessons
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-purple-600 transition-colors">
                Learn Topics with Ease 🧠
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Master complex STEM topics with real-world analogies, formulas, and video notes.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1">
              <span>Explore 20+ Subjects</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2: Prepare for Tests (Matching Screenshot 2) */}
          <div
            onClick={() => onNavigateTab('tests')}
            className="p-5 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                  MCQ Practice
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-emerald-600 transition-colors">
                Prepare for Tests 📚
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Get ready for your next exam with adaptive quizzes, hints, and score meter.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
              <span>Start Practice Test</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* SECTION: SUBJECT CATEGORIES (Matching Screenshot 3 Left Card) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
                <span>Get Help on Your Homework</span>
                <span className="text-sm">💯</span>
              </h3>
              <p className="text-xs text-slate-500">
                Math, Science, Commerce, and Humanities
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explore')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HOME_SUBJECT_GRID.map((sub) => (
              <button
                key={sub.name}
                onClick={() => onSelectSubjectTopic(sub.category, sub.name)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 shadow-2xs hover:shadow-xs text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                  {sub.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {sub.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{sub.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: RECENT QUESTIONS */}
        {recentQuestions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Recent Solved Questions
              </h3>
              <button
                onClick={() => onNavigateTab('profile')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View History
              </button>
            </div>

            <div className="space-y-2.5">
              {recentQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q)}
                  className="w-full text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-2xs flex items-center justify-between transition group"
                >
                  <div className="space-y-1 pr-3">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {q.subject}
                    </span>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {q.detectedQuestion}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      ✓ {q.finalAnswer}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DAILY LEARNING RECOMMENDATION BANNER */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-5 rounded-3xl shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-100">
              Daily Smart Recommendation
            </span>
            <h4 className="font-extrabold text-sm mb-1">
              Master the Distributive Property in Linear Equations
            </h4>
            <p className="text-xs text-teal-100 leading-relaxed mb-3">
              Students who practiced 3 distributive algebra equations improved their exam accuracy by 40%.
            </p>
            <button
              onClick={() => onSelectSubjectTopic('Mathematics', 'Algebra')}
              className="px-3 py-1.5 bg-white text-teal-800 font-bold rounded-xl text-xs hover:bg-teal-50 shadow-xs inline-flex items-center gap-1.5 transition"
            >
              Start 5-min Exercise
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
