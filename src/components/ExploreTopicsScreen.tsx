import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calculator, 
  Atom, 
  Briefcase, 
  Globe, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  PlayCircle, 
  Lightbulb,
  Languages,
  RotateCcw,
  ArrowRight,
  FileText
} from 'lucide-react';
import { TopicLesson } from '../types';
import { fetchTopicLessonAPI } from '../services/api';
import { Storage } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { Mascot } from './Mascot';
import { LearningToolsModal } from './LearningToolsModal';

// Built-in initial comprehensive subjects and topics
const SUBJECT_CATEGORIES = [
  {
    category: 'Mathematics',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'],
  },
  {
    category: 'Science',
    icon: Atom,
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    topics: ['Physics', 'Chemistry', 'Biology', 'Life Science', 'Earth Science'],
  },
  {
    category: 'Commerce',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    topics: ['Accountancy', 'Economics', 'Business Studies', 'Business Law', 'Statistics'],
  },
  {
    category: 'Humanities & Tech',
    icon: Globe,
    color: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    topics: ['Computer Science', 'English', 'History', 'Geography'],
  },
];

// Preloaded rich sample lesson matching the Flexi reference screenshot (Photosynthesis analogy)
const SAMPLE_PHOTOSYNTHESIS_LESSON: TopicLesson = {
  title: 'Photosynthesis & Cellular Energy',
  subject: 'Biology',
  summary: 'The biological process by which green plants and certain other organisms transform light energy into chemical energy stored in glucose molecules.',
  realWorldAnalogy: {
    title: 'The Soccer Passing & Goal Analogy ⚽',
    story: 'Photosynthesis can be compared to a high-speed passing play in soccer. In the same way that players pass the ball across the pitch to move it forward towards the opponent’s goal, excited electrons pass through protein complexes in the thylakoid membrane.',
    connection: 'The sun is the starting coach whistle providing initial momentum, water molecules are broken like opening passes, and the goal scored is the rich ATP & glucose food packet ready to power the team!',
  },
  definitionsAndFormulas: [
    {
      term: 'Balanced Overall Chemical Equation',
      definition: 'Six molecules of carbon dioxide and six water molecules combine under solar photons to synthesize glucose and oxygen gas.',
      formula: '6CO_2 + 6H_2O \\xrightarrow{\\text{Light + Chlorophyll}} C_6H_{12}O_6 + 6O_2',
    },
    {
      term: 'Thylakoid Membrane',
      definition: 'Internal membrane-bound compartment inside chloroplasts where the light-dependent reactions convert photons to ATP and NADPH.',
    },
    {
      term: 'Calvin Cycle (Light-Independent)',
      definition: 'Chemical reactions occurring in the stroma that convert carbon dioxide into sugar using ATP & NADPH produced during the light stage.',
    },
  ],
  stepByStepExample: {
    problem: 'Calculate the number of oxygen molecules produced if 18 molecules of CO2 are fixed by Rubisco in the Calvin cycle.',
    solutionSteps: [
      'Step 1: Write the stoichiometric molar ratio from the equation: 6 CO2 molecules generate 6 O2 molecules (1:1 ratio).',
      'Step 2: Set up the proportion: (18 CO2) * (6 O2 / 6 CO2).',
      'Step 3: Simplify: 18 * 1 = 18 molecules of O2.',
    ],
    finalAnswer: '18 molecules of Oxygen (O2) released',
  },
  commonMistakes: [
    'Assuming plants only photosynthesize and never respire (plants continuously perform cellular respiration day and night!).',
    'Thinking light reactions and dark reactions happen in completely different cells (both occur inside chloroplasts).',
  ],
  takeawayNotes: [
    'Chlorophyll pigments absorb mainly blue and red wavelengths while reflecting green light.',
    'Water splitting (photolysis) releases oxygen gas into our atmosphere.',
    'Glucose produced is converted to starch for long-term plant storage.',
  ],
  recommendedVideoKeywords: ['Photosynthesis CrashCourse', 'Light Reactions 3D animation', 'Calvin cycle step by step'],
};

interface ExploreTopicsScreenProps {
  onStartQuizForTopic?: (subject: string, topic: string) => void;
}

export const ExploreTopicsScreen: React.FC<ExploreTopicsScreenProps> = ({
  onStartQuizForTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Science');
  const [selectedTopic, setSelectedTopic] = useState<string>('Biology');
  const [activeLesson, setActiveLesson] = useState<TopicLesson>(SAMPLE_PHOTOSYNTHESIS_LESSON);
  const [isLoading, setIsLoading] = useState(false);
  const [customSubjects, setCustomSubjects] = useState<string[]>(() =>
    Storage.getCustomSubjects()
  );
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  // Tools Modal
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsText, setToolsText] = useState('');

  const handleSelectTopic = async (subject: string, topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    try {
      const lesson = await fetchTopicLessonAPI({ subject, topic });
      setActiveLesson(lesson);
      // update user progress
      const p = Storage.getUserProfile();
      p.totalTopicsStudied += 1;
      Storage.saveUserProfile(p);
    } catch (err) {
      console.error('Failed to load topic lesson:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    const updated = Storage.addCustomSubject(newSubjectInput.trim());
    setCustomSubjects(updated);
    handleSelectTopic('Custom', newSubjectInput.trim());
    setNewSubjectInput('');
    setShowAddSubjectModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Learn Topics with Ease
          </h2>
          <p className="text-xs text-slate-500">
            Guided lessons, real-world analogies &amp; interactive notes
          </p>
        </div>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Subject
        </button>
      </div>

      <div className="p-4 max-w-3xl mx-auto w-full space-y-5">
        {/* Subject Categories Carousel */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Subject Category
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUBJECT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.category;
              return (
                <button
                  key={cat.category}
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    handleSelectTopic(cat.category, cat.topics[0]);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="text-xs font-bold">{cat.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics Pills */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Topics in {selectedCategory}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUBJECT_CATEGORIES.find((c) => c.category === selectedCategory)?.topics.map((top) => {
              const isSelected = selectedTopic === top;
              return (
                <button
                  key={top}
                  onClick={() => handleSelectTopic(selectedCategory, top)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {top}
                </button>
              );
            })}

            {/* Custom subjects added by user */}
            {customSubjects.map((cust) => (
              <button
                key={cust}
                onClick={() => handleSelectTopic('Custom', cust)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedTopic === cust
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                ★ {cust}
              </button>
            ))}
          </div>
        </div>

        {/* LESSON CONTENT CARD */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Mascot mood="thinking" size="lg" className="mb-3" />
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">
              Nogi is assembling your lesson for {selectedTopic}...
            </h4>
            <p className="text-xs text-slate-400 mt-1 animate-pulse">
              Generating real-world analogies, formulas, and revision notes
            </p>
          </div>
        ) : activeLesson ? (
          <div className="space-y-4">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                  {activeLesson.subject}
                </span>
                <button
                  onClick={() => {
                    setToolsText(activeLesson.summary);
                    setToolsOpen(true);
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  AI Study Tools
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
                {activeLesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
                {activeLesson.summary}
              </p>

              {/* Action: Practice Test on this topic */}
              {onStartQuizForTopic && (
                <button
                  onClick={() => onStartQuizForTopic(activeLesson.subject, activeLesson.title)}
                  className="mt-4 px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition transform active:scale-95"
                >
                  <span>Practice Quiz on {selectedTopic}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* REAL WORLD ANALOGY CARD (Matching Screenshot 1 Left Card) */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 rounded-3xl border border-pink-100 dark:border-pink-900/40 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                    {activeLesson.realWorldAnalogy.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                  Intuitive Analogy
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                {activeLesson.realWorldAnalogy.story}
              </p>

              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-pink-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-pink-600 dark:text-pink-400">Connection to Concept: </span>
                {activeLesson.realWorldAnalogy.connection}
              </div>

              {/* Interactive buttons like in Screenshot 1 */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    setToolsText(activeLesson.realWorldAnalogy.story);
                    setToolsOpen(true);
                  }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:border-indigo-400 shrink-0"
                >
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  Clarifications
                </button>
                <button
                  onClick={() => {
                    setToolsText(activeLesson.realWorldAnalogy.story);
                    setToolsOpen(true);
                  }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:border-indigo-400 shrink-0"
                >
                  <Languages className="w-3 h-3 text-blue-500" />
                  Translations
                </button>
                <button
                  onClick={() => {
                    setToolsText(activeLesson.realWorldAnalogy.story);
                    setToolsOpen(true);
                  }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:border-indigo-400 shrink-0"
                >
                  <RotateCcw className="w-3 h-3 text-emerald-500" />
                  Rephrase
                </button>
              </div>
            </div>

            {/* Definitions & Formulas */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Key Definitions &amp; Formulas
              </h3>

              <div className="space-y-3">
                {activeLesson.definitionsAndFormulas.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mb-1">
                      {def.term}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                      {def.definition}
                    </p>
                    {def.formula && (
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <MathRenderer content={`$$${def.formula}$$`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Example Problem */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Step-by-Step Example Problem
              </h3>
              <div className="p-3.5 bg-indigo-50/60 dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                {activeLesson.stepByStepExample.problem}
              </div>

              <div className="space-y-2 mb-3">
                {activeLesson.stepByStepExample.solutionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-400 py-0.5"
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Answer: {activeLesson.stepByStepExample.finalAnswer}
              </div>
            </div>

            {/* Takeaways & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Revision Points */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-900/40">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Revision Notes
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                  {activeLesson.takeawayNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Pitfalls */}
              <div className="bg-red-50/70 dark:bg-red-950/30 p-4 rounded-3xl border border-red-200 dark:border-red-900/40">
                <h4 className="font-bold text-red-900 dark:text-red-200 text-xs uppercase tracking-wider mb-2">
                  ⚠️ Common Exam Mistakes
                </h4>
                <ul className="space-y-1.5 text-xs text-red-800 dark:text-red-300">
                  {activeLesson.commonMistakes.map((mis, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{mis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Custom Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">
              Add Custom Subject
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any subject or specialty course (e.g. Robotics, Organic Chem, Statistics).
            </p>
            <form onSubmit={handleAddCustomSubject}>
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs mb-3 border-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSubjectInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Learning Tools Modal */}
      <LearningToolsModal
        isOpen={toolsOpen}
        onClose={() => setToolsOpen(false)}
        sourceText={toolsText}
      />
    </div>
  );
};
