import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Lightbulb, 
  RotateCcw, 
  ArrowRight, 
  Award,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  History,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PracticeTest, QuizQuestion, TestResult } from '../types';
import { generateTestAPI } from '../services/api';
import { Storage } from '../services/storage';
import { formatRelativeTime } from '../services/datetime';
import { MathRenderer } from './MathRenderer';
import { Mascot } from './Mascot';

// Initial preloaded benchmark quiz matching Flexi Screenshot 2 (Biology - Scientific Method)
const SAMPLE_TEST: PracticeTest = {
  id: 'test-bio-reference',
  testTitle: 'Biology Practice Test: Scientific Method & Cells',
  subject: 'Biology',
  topic: 'Scientific Method',
  difficulty: 'medium',
  estimatedMinutes: 6,
  questions: [
    {
      id: 1,
      question: 'Which of the following is NOT true concerning a scientific hypothesis?',
      options: [
        'It must be testable through observation or experiment',
        'It must be written in a way that can be proven wrong (falsifiable)',
        'It must provide measurable, objective results',
        'It always has to be true under every condition',
      ],
      correctIndex: 3,
      hint: 'Think about whether any proposed scientific hypothesis is accepted as an absolute guarantee before testing.',
      explanation: 'A hypothesis is a tentative, testable explanation. It is never guaranteed or required to be true; in fact, proving hypotheses wrong is one of science’s most important error-correcting tools.',
      subTopic: 'Scientific Method',
    },
    {
      id: 2,
      question: 'What is the primary variable that an experimenter deliberately manipulates or changes?',
      options: [
        'Dependent variable',
        'Independent variable',
        'Controlled variable',
        'Confounding variable',
      ],
      correctIndex: 1,
      hint: 'Think: "I change this variable myself".',
      explanation: 'The independent variable is intentionally altered by the researcher to determine its effect on the dependent (measured) variable.',
      subTopic: 'Experimental Design',
    },
    {
      id: 3,
      question: 'Solve for x in this related lab calculation: 2(5x - 3) + 3x = 9',
      options: [
        'x = 1',
        'x = 15/13',
        'x = 3/2',
        'x = 2',
      ],
      correctIndex: 1,
      hint: 'Expand 2(5x - 3) to 10x - 6, combine like terms 10x + 3x = 13x, and solve 13x = 15.',
      explanation: '10x - 6 + 3x = 9 => 13x - 6 = 9 => 13x = 15 => x = 15/13.',
      subTopic: 'Quantitative Analysis',
    },
    {
      id: 4,
      question: 'Which cellular organelle is responsible for generating the majority of chemical energy (ATP)?',
      options: [
        'Ribosome',
        'Endoplasmic reticulum',
        'Mitochondria',
        'Golgi apparatus',
      ],
      correctIndex: 2,
      hint: 'Often nicknamed the powerhouse of the cell.',
      explanation: 'Mitochondria generate most of the cell’s supply of adenosine triphosphate (ATP) through cellular respiration and oxidative phosphorylation.',
      subTopic: 'Cell Biology',
    },
    {
      id: 5,
      question: 'What happens during the light-dependent reactions of photosynthesis?',
      options: [
        'Water molecules are split, releasing oxygen, and ATP/NADPH are synthesized',
        'Carbon dioxide is fixed into glucose in the dark',
        'Glucose is broken down into lactic acid',
        'Chlorophyll dissolves in the cytoplasm',
      ],
      correctIndex: 0,
      hint: 'Photons excite electrons and water photolysis creates oxygen.',
      explanation: 'Solar photons strike chlorophyll in the thylakoids, causing photolysis of water into protons, electrons, and oxygen gas while charging ATP and NADPH.',
      subTopic: 'Bioenergetics',
    },
  ],
};

interface TestsScreenProps {
  initialSubject?: string;
  initialTopic?: string;
  onNavigateToExplore?: () => void;
}

export const TestsScreen: React.FC<TestsScreenProps> = ({
  initialSubject,
  initialTopic,
  onNavigateToExplore,
}) => {
  const [viewState, setViewState] = useState<'create' | 'running' | 'summary'>('create');
  const [activeTest, setActiveTest] = useState<PracticeTest>(SAMPLE_TEST);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealedHint, setRevealedHint] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Creator form state
  const [subject, setSubject] = useState(initialSubject || 'Mathematics');
  const [topic, setTopic] = useState(initialTopic || 'Algebra');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(5);

  const testHistory = Storage.getTestResults();

  // If initial subject/topic passed, pre-populate
  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialTopic) setTopic(initialTopic);
  }, [initialSubject, initialTopic]);

  const handleStartGenerateTest = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateTestAPI({
        subject,
        topic,
        difficulty,
        numQuestions,
      });
      setActiveTest(generated);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setRevealedHint(false);
      setViewState('running');
    } catch (err) {
      console.error('Failed to generate quiz, falling back to benchmark test', err);
      setActiveTest(SAMPLE_TEST);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setRevealedHint(false);
      setViewState('running');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const q = activeTest.questions[currentQIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [q.id]: optionIndex,
    }));
  };

  const handleNextOrFinish = () => {
    setRevealedHint(false);
    if (currentQIndex < activeTest.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    let correctCount = 0;
    activeTest.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / activeTest.questions.length) * 100);

    const result: TestResult = {
      id: `res-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.testTitle,
      subject: activeTest.subject,
      topic: activeTest.topic,
      score: correctCount,
      totalQuestions: activeTest.questions.length,
      percentage,
      date: Date.now(),
      userAnswers: selectedAnswers,
    };

    setTestResult(result);
    Storage.addTestResult(result);
    setViewState('summary');

    // Confetti celebration if passed (> 60%)
    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#f59e0b', '#10b981', '#ec4899'],
        });
      } catch (e) {
        // ignore if not supported
      }
    }
  };

  const currentQ = activeTest?.questions[currentQIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
              Prepare for Your Tests
            </h2>
            <p className="text-[11px] text-slate-500">
              Practice tests &amp; targeted AI reviews
            </p>
          </div>
        </div>

        {viewState === 'running' && (
          <button
            onClick={() => setViewState('create')}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            Pause &amp; Exit
          </button>
        )}
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* VIEW 1: CREATE / CHOOSE TEST */}
        {viewState === 'create' && (
          <div className="space-y-5">
            {/* Quick Hero Banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider">
                  Adaptive AI Quizzes
                </span>
                <Mascot mood="happy" size="sm" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1">
                Targeted Test Preparation
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed max-w-md">
                Generate custom 4-option practice exams with instant step-by-step reasoning, hints, and score tracking.
              </p>
            </div>

            {/* Test Configuration Box */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Customize Your Test
              </h4>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Mathematics', 'Science', 'Commerce', 'History'].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubject(sub)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        subject === sub
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic / Chapter Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Chapter or Specific Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Linear Equations, Photosynthesis, Thermodynamics..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="easy">Easy (Concept Check)</option>
                    <option value="medium">Medium (Standard Exam)</option>
                    <option value="hard">Hard (Advanced Reasoning)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Questions Count
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 Questions (Quick)</option>
                    <option value={10}>10 Questions (Full Test)</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleStartGenerateTest}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Mascot mood="thinking" size="sm" />
                    <span>Nogi is writing test questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start Practice Test</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Practice Benchmark Quizzes */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Ready-to-Take Practice Tests
              </div>
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setActiveTest(SAMPLE_TEST);
                    setCurrentQIndex(0);
                    setSelectedAnswers({});
                    setRevealedHint(false);
                    setViewState('running');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-xs flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      BIO
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        Scientific Method &amp; Cell Biology (Benchmark)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        5 Questions • From Reference Demo
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Past Test History */}
            {testHistory.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Your Test History
                </div>
                <div className="space-y-2">
                  {testHistory.slice(0, 4).map((th) => (
                    <div
                      key={th.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {th.testTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(th.date)}</span>
                          <span>•</span>
                          <span>{th.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold px-2 py-0.5 rounded-lg text-xs ${
                          th.percentage >= 80 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {th.score}/{th.totalQuestions} ({th.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RUNNING TEST (Matches Screenshot 2 Right Card) */}
        {viewState === 'running' && currentQ && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Header info bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>
                  Prepping:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {activeTest.topic}
                  </strong>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {currentQIndex + 1} of {activeTest.questions.length}
                </span>
              </div>

              {/* Numbered Question Tracker Pills (Matching Screenshot 2) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {activeTest.questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQIndex(idx);
                        setRevealedHint(false);
                      }}
                      className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                  Question {currentQIndex + 1}
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                  <MathRenderer content={currentQ.question} />
                </div>

                {/* 4 Options (A, B, C, D) */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-xs ring-1 ring-indigo-400'
                            : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300'
                          }`}
                        >
                          {letters[optIdx]}
                        </span>
                        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          <MathRenderer content={option} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Socratic Hint Drawer */}
              {currentQ.hint && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {revealedHint ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Hint: </span>
                        {currentQ.hint}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevealedHint(true)}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      💡 Need a Hint? (Won't spoil the answer)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions (Submit Answer / Next / Skip) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  // Skip without answer
                  handleNextOrFinish();
                }}
                className="py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-50 transition"
              >
                I Don't Know / Skip
              </button>

              <button
                onClick={handleNextOrFinish}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5 transition transform active:scale-98"
              >
                <span>
                  {currentQIndex === activeTest.questions.length - 1
                    ? 'Submit Final Test'
                    : 'Submit & Next Question'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: RESULTS SUMMARY & GAUGE (Matches Screenshot 1 Right Card) */}
        {viewState === 'summary' && testResult && (
          <div className="space-y-5 pb-8">
            {/* Speedometer Gauge Score Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                Test Complete
              </span>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-3">
                {testResult.testTitle}
              </h3>

              {/* Speedometer Gauge Visual */}
              <div className="relative w-48 h-28 my-2 flex items-center justify-center">
                {/* Gauge semi-circle arc SVG */}
                <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="35%" stopColor="#F59E0B" />
                      <stop offset="70%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  {/* Background Track */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Value Arc */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * (testResult.percentage || 0)) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Center score readout */}
                <div className="absolute bottom-0 flex flex-col items-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {testResult.score}/{testResult.totalQuestions}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    {testResult.percentage}% Score
                  </div>
                </div>
              </div>

              {/* Flexi-style skill improvement badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {testResult.percentage >= 70
                    ? 'Mastery Achieved! Skill level boosted 📈'
                    : 'Good effort! Targeted review recommended 📚'}
                </span>
              </div>
            </div>

            {/* Question by Question Review */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Detailed Answer Breakdown
              </div>

              <div className="space-y-3">
                {activeTest.questions.map((q, idx) => {
                  const userChoice = testResult.userAnswers[q.id];
                  const isCorrect = userChoice === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-3xl border bg-white dark:bg-slate-900 shadow-xs ${
                        isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/50'
                          : 'border-red-200 dark:border-red-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Question {idx + 1}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Needs Review'}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        <MathRenderer content={q.question} />
                      </div>

                      {/* User's Selected Option */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                        <span className="font-semibold">Your choice: </span>
                        {userChoice !== undefined ? (
                          <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            {q.options[userChoice]}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Skipped</span>
                        )}
                      </div>

                      {/* Correct Option if incorrect */}
                      {!isCorrect && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                          Correct answer: {q.options[q.correctIndex]}
                        </div>
                      )}

                      {/* Comprehensive explanation */}
                      <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          Why this is correct:{' '}
                        </span>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retake or Return */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentQIndex(0);
                  setViewState('running');
                }}
                className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => setViewState('create')}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <span>Create New Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
