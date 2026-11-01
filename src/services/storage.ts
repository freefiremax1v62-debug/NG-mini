import { UserProfile, SolvedQuestion, TestResult, ChatSession } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'ng_chat_user_profile',
  SOLVED_QUESTIONS: 'ng_chat_solved_questions',
  TEST_RESULTS: 'ng_chat_test_results',
  CHAT_SESSIONS: 'ng_chat_chat_sessions',
  ACTIVE_CHAT_ID: 'ng_chat_active_chat_id',
  DARK_MODE: 'ng_chat_dark_mode',
  CUSTOM_SUBJECTS: 'ng_chat_custom_subjects',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Aryan Sharma',
  email: 'aryan.student@edu.org',
  avatar: 'mascot-nogi',
  educationLevel: 'High School (Grades 9-10)',
  favoriteSubjects: ['Algebra', 'Physics', 'Biology', 'Economics'],
  streakDays: 6,
  totalQuestionsSolved: 48,
  totalTopicsStudied: 19,
  testsCompleted: 12,
  averageScore: 84, // e.g. 8.4/10 like screenshot
};

const INITIAL_SOLVED_QUESTIONS: SolvedQuestion[] = [
  {
    id: 'sample-math-1',
    timestamp: Date.now() - 3600000 * 2,
    detectedQuestion: 'Solve the equation: 2(5x - 3) + 3x = 9',
    subject: 'Algebra',
    subTopic: 'Linear Equations',
    conceptFormula: 'Distributive Property: a(b - c) = ab - ac',
    whatIsAsked: 'Find the unknown numerical value of variable x that satisfies the equation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Apply the Distributive Property',
        explanation: 'Multiply each term inside the parenthesis (5x - 3) by the outer coefficient 2.',
        mathFormula: '2 \\cdot 5x - 2 \\cdot 3 + 3x = 9 \\implies 10x - 6 + 3x = 9',
        hint: 'Remember to multiply 2 with both 5x and -3.',
      },
      {
        stepNumber: 2,
        title: 'Combine Like Terms',
        explanation: 'Group the variable terms containing x: 10x and 3x.',
        mathFormula: '(10x + 3x) - 6 = 9 \\implies 13x - 6 = 9',
        hint: 'Add the coefficients 10 + 3.',
      },
      {
        stepNumber: 3,
        title: 'Isolate the Variable Term',
        explanation: 'Add 6 to both sides of the equation to cancel the -6 on the left.',
        mathFormula: '13x = 9 + 6 \\implies 13x = 15',
        hint: 'Use the addition property of equality.',
      },
      {
        stepNumber: 4,
        title: 'Solve for x',
        explanation: 'Divide both sides by the coefficient of x, which is 13.',
        mathFormula: 'x = \\frac{15}{13} \\approx 1.1538',
        hint: 'Divide 15 by 13.',
      },
    ],
    finalAnswer: 'x = 15/13 (or approx 1.154)',
    whyItWorks: 'Substituting x = 15/13 back into the left side: 2(5(15/13) - 3) + 3(15/13) = 2(75/13 - 39/13) + 45/13 = 2(36/13) + 45/13 = 72/13 + 45/13 = 117/13 = 9. The equation balances perfectly!',
    practiceQuestion: 'Solve: 3(4x - 2) + 2x = 22',
    isBookmarked: true,
  },
  {
    id: 'sample-science-1',
    timestamp: Date.now() - 3600000 * 24,
    detectedQuestion: 'Which of the following is NOT true concerning a scientific hypothesis?',
    subject: 'Biology',
    subTopic: 'Scientific Method',
    conceptFormula: 'Scientific Method & Falsifiability Criterion',
    whatIsAsked: 'Identify the characteristic that does not correctly describe a scientific hypothesis.',
    steps: [
      {
        stepNumber: 1,
        title: 'Analyze the definition of a Hypothesis',
        explanation: 'A scientific hypothesis is an educated, tentative explanation for an observation that must be testable and falsifiable.',
        hint: 'Can any scientific statement be unconditionally 100% proven true forever?',
      },
      {
        stepNumber: 2,
        title: 'Evaluate the standard criteria',
        explanation: '1. It must be testable. 2. It can be proven wrong (falsifiable). 3. It produces measurable results.',
        hint: 'Notice whether science accepts hypotheses as absolute unchanging truths.',
      },
    ],
    finalAnswer: 'It always has to be true (Option D)',
    whyItWorks: 'A hypothesis is never assumed to always be true; experiments must have the power to disprove it if observations contradict predictions.',
    practiceQuestion: 'What distinguishes a scientific theory from a simple hypothesis?',
    isBookmarked: false,
  },
];

const INITIAL_TEST_RESULTS: TestResult[] = [
  {
    id: 'res-1',
    testId: 'bio-test-1',
    testTitle: 'Biology: Scientific Method & Cells',
    subject: 'Biology',
    topic: 'Scientific Method',
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    date: Date.now() - 86400000 * 2,
    userAnswers: { 1: 0, 2: 2, 3: 1, 4: 3, 5: 0, 6: 2, 7: 1, 8: 3, 9: 3, 10: 1 },
  },
  {
    id: 'res-2',
    testId: 'math-test-1',
    testTitle: 'Algebra: Linear Equations & Graphs',
    subject: 'Algebra',
    topic: 'Linear Equations',
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    date: Date.now() - 86400000 * 4,
    userAnswers: { 1: 1, 2: 0, 3: 2, 4: 3, 5: 0 },
  },
];

export const Storage = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSolvedQuestions(): SolvedQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOLVED_QUESTIONS);
      return data ? JSON.parse(data) : INITIAL_SOLVED_QUESTIONS;
    } catch {
      return INITIAL_SOLVED_QUESTIONS;
    }
  },

  addSolvedQuestion(question: SolvedQuestion): void {
    try {
      const current = this.getSolvedQuestions();
      const updated = [question, ...current.filter((q) => q.id !== question.id)].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.SOLVED_QUESTIONS, JSON.stringify(updated));

      // Update user statistics
      const profile = this.getUserProfile();
      profile.totalQuestionsSolved += 1;
      this.saveUserProfile(profile);
    } catch (e) {
      console.error('Failed to add solved question', e);
    }
  },

  toggleBookmark(id: string): boolean {
    const list = this.getSolvedQuestions();
    let newStatus = false;
    const updated = list.map((item) => {
      if (item.id === id) {
        newStatus = !item.isBookmarked;
        return { ...item, isBookmarked: newStatus };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.SOLVED_QUESTIONS, JSON.stringify(updated));
    return newStatus;
  },

  getTestResults(): TestResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
      return data ? JSON.parse(data) : INITIAL_TEST_RESULTS;
    } catch {
      return INITIAL_TEST_RESULTS;
    }
  },

  addTestResult(result: TestResult): void {
    try {
      const current = this.getTestResults();
      const updated = [result, ...current];
      localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(updated));

      const profile = this.getUserProfile();
      profile.testsCompleted += 1;
      const totalScore = updated.reduce((acc, r) => acc + r.percentage, 0);
      profile.averageScore = Math.round(totalScore / updated.length);
      this.saveUserProfile(profile);
    } catch (e) {
      console.error('Failed to save test result', e);
    }
  },

  getChatSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
      if (data) return JSON.parse(data);
      // Default initial welcome session
      const defaultSession: ChatSession = {
        id: 'session-default',
        title: 'Getting started with NG Chat',
        subject: 'General Study',
        createdAt: Date.now() - 3600000,
        messages: [
          {
            id: 'm1',
            role: 'model',
            content: `Hello! I'm **Nogi**, your NG Chat personal AI tutor! 👋✨\n\nI can help you with:\n• Step-by-step math & physics solutions\n• Real-world intuitive analogies\n• Practice tests with instant grading\n• Concept explanations in English, Hindi, or Hinglish!\n\nWhat are you studying today?`,
            timestamp: Date.now() - 3600000,
            suggestedPrompts: [
              'Explain Pythagoras Theorem with sports analogy',
              'Why is the sky blue? Explain in simple words',
              'How to balance chemical equations step by step?',
              'Teach me in Hinglish!',
            ],
          },
        ],
      };
      return [defaultSession];
    } catch {
      return [];
    }
  },

  saveChatSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions', e);
    }
  },

  getCustomSubjects(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS);
      return data ? JSON.parse(data) : ['Robotics', 'Environmental Science'];
    } catch {
      return ['Robotics'];
    }
  },

  addCustomSubject(subject: string): string[] {
    const list = this.getCustomSubjects();
    if (!list.includes(subject)) {
      const updated = [...list, subject];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SUBJECTS, JSON.stringify(updated));
      return updated;
    }
    return list;
  },
};
