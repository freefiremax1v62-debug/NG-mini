export type EducationLevel = 
  | 'Middle School (Grades 6-8)'
  | 'High School (Grades 9-10)'
  | 'Senior High / Prep (Grades 11-12)'
  | 'College / Undergraduate'
  | 'University / Graduate';

export type LanguageMode = 'english' | 'hindi' | 'hinglish';

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathFormula?: string;
  hint?: string;
}

export interface SolvedQuestion {
  id: string;
  timestamp: number;
  detectedQuestion: string;
  subject: string;
  subTopic?: string;
  conceptFormula: string;
  whatIsAsked: string;
  steps: SolutionStep[];
  finalAnswer: string;
  whyItWorks: string;
  practiceQuestion?: string;
  imageUrl?: string;
  isBookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  suggestedPrompts?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  subTopic?: string;
}

export interface PracticeTest {
  id: string;
  testTitle: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  estimatedMinutes?: number;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: number;
  userAnswers: Record<number, number>; // questionId -> selectedOptionIndex
}

export interface TopicLesson {
  title: string;
  subject: string;
  summary: string;
  realWorldAnalogy: {
    title: string;
    story: string;
    connection: string;
  };
  definitionsAndFormulas: Array<{
    term: string;
    definition: string;
    formula?: string;
  }>;
  stepByStepExample: {
    problem: string;
    solutionSteps: string[];
    finalAnswer: string;
  };
  commonMistakes: string[];
  takeawayNotes: string[];
  recommendedVideoKeywords?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  educationLevel: EducationLevel;
  favoriteSubjects: string[];
  streakDays: number;
  totalQuestionsSolved: number;
  totalTopicsStudied: number;
  testsCompleted: number;
  averageScore: number;
}
