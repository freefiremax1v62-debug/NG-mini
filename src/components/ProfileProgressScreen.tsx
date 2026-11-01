import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  Bookmark, 
  BookOpen, 
  Award, 
  BarChart3, 
  Calendar, 
  Flame, 
  GraduationCap, 
  Clock, 
  ChevronRight,
  Edit2,
  Save,
  Check,
  ShieldCheck,
  Heart,
  MessageSquare
} from 'lucide-react';
import { UserProfile, EducationLevel, SolvedQuestion } from '../types';
import { Storage } from '../services/storage';
import { Mascot } from './Mascot';

interface ProfileProgressScreenProps {
  onSelectSavedQuestion?: (question: SolvedQuestion) => void;
  onNavigateToChat?: () => void;
}

const EDUCATION_LEVELS: EducationLevel[] = [
  'Middle School (Grades 6-8)',
  'High School (Grades 9-10)',
  'Senior High / Prep (Grades 11-12)',
  'College / Undergraduate',
  'University / Graduate',
];

const ALL_SUBJECTS = [
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Calculus',
  'Statistics',
  'Probability',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Accountancy',
  'Computer Science',
];

export const ProfileProgressScreen: React.FC<ProfileProgressScreenProps> = ({
  onSelectSavedQuestion,
  onNavigateToChat,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => Storage.getUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [levelInput, setLevelInput] = useState(profile.educationLevel);
  const [selectedFavs, setSelectedFavs] = useState<string[]>(profile.favoriteSubjects);
  const [activeTab, setActiveTab] = useState<'progress' | 'bookmarks' | 'account'>('progress');

  const solvedQuestions = Storage.getSolvedQuestions();
  const bookmarkedQuestions = solvedQuestions.filter((q) => q.isBookmarked);
  const testResults = Storage.getTestResults();

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...profile,
      name: nameInput.trim() || profile.name,
      educationLevel: levelInput,
      favoriteSubjects: selectedFavs,
    };
    setProfile(updated);
    Storage.saveUserProfile(updated);
    setIsEditing(false);
  };

  const toggleFavSubject = (sub: string) => {
    if (selectedFavs.includes(sub)) {
      setSelectedFavs(selectedFavs.filter((s) => s !== sub));
    } else {
      setSelectedFavs([...selectedFavs, sub]);
    }
  };

  // Mock weekly study minutes data (Mon - Sun)
  const weeklyData = [
    { day: 'Mon', minutes: 45, height: '60%' },
    { day: 'Tue', minutes: 60, height: '80%' },
    { day: 'Wed', minutes: 30, height: '40%' },
    { day: 'Thu', minutes: 75, height: '100%' },
    { day: 'Fri', minutes: 50, height: '65%' },
    { day: 'Sat', minutes: 65, height: '85%' },
    { day: 'Sun', minutes: 40, height: '55%' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
            Student Profile &amp; Progress
          </h2>
          <p className="text-[11px] text-slate-500">
            Track mastery, study streaks, and saved questions
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'progress'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'bookmarks'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Saved ({bookmarkedQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-5 flex-1">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-inner">
              <Mascot mood="happy" size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">{profile.name}</h3>
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  PRO Learner
                </span>
              </div>
              <div className="text-xs text-indigo-100 font-medium">
                {profile.educationLevel}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-200 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-bounce" />
                <span>{profile.streakDays} Day Learning Streak</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('account');
              setIsEditing(true);
            }}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* TAB 1: PROGRESS DASHBOARD */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Solved
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-white">
                  {profile.totalQuestionsSolved}
                </div>
                <div className="text-[10px] text-slate-500">Homework Qs</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-500" />
                  Topics
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-white">
                  {profile.totalTopicsStudied}
                </div>
                <div className="text-[10px] text-slate-500">Lessons explored</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-500" />
                  Tests
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-white">
                  {profile.testsCompleted}
                </div>
                <div className="text-[10px] text-slate-500">Completed</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  Avg Score
                </div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {profile.averageScore}%
                </div>
                <div className="text-[10px] text-slate-500">Across all tests</div>
              </div>
            </div>

            {/* Weekly Study Activity Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
                    Weekly Study Activity
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  305 mins this week
                </span>
              </div>

              <div className="flex items-end justify-between h-32 pt-4 px-2">
                {weeklyData.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-7 bg-slate-100 dark:bg-slate-800 rounded-xl h-24 flex items-end justify-center p-0.5 overflow-hidden">
                      <div
                        style={{ height: d.height }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-lg transition-all duration-700"
                        title={`${d.minutes} minutes`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Subject Mastery
              </h4>

              <div className="space-y-3">
                {[
                  { subject: 'Algebra & Equations', progress: 88, color: 'bg-amber-500' },
                  { subject: 'Cell Biology & Genetics', progress: 82, color: 'bg-emerald-500' },
                  { subject: 'Mechanics & Newton Laws', progress: 74, color: 'bg-blue-500' },
                  { subject: 'Macroeconomics & Finance', progress: 91, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{item.subject}</span>
                      <span className="text-slate-500">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.progress}%` }}
                        className={`${item.color} h-full rounded-full transition-all duration-700`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Usage & Transparency Notice */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Free Educational AI: </span>
                NG Chat operates with transparent free-tier Google Gemini AI models. No paywalls, no forced subscriptions, and zero ads.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKMARKED / FAVORITE QUESTIONS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                Saved Questions ({bookmarkedQuestions.length})
              </h4>
              <span className="text-xs text-slate-400">Click to revisit solution</span>
            </div>

            {bookmarkedQuestions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  You haven't bookmarked any questions yet. Tap the bookmark icon when solving any homework problem to save it here for revision!
                </p>
              </div>
            ) : (
              bookmarkedQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectSavedQuestion && onSelectSavedQuestion(q)}
                  className="w-full text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-xs flex items-center justify-between transition"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {q.subject}
                    </span>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                      {q.detectedQuestion}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      Ans: {q.finalAnswer}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT & SETTINGS */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
              Student Information
            </h4>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Email / Google Account
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500"
              />
            </div>

            {/* Class / Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Class / Education Level
              </label>
              <select
                value={levelInput}
                onChange={(e: any) => setLevelInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorite Subjects Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Favorite Subjects (Tap to select)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SUBJECTS.map((sub) => {
                  const isFav = selectedFavs.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleFavSubject(sub)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                        isFav
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sub} {isFav && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
