import { SolvedQuestion, ChatMessage, PracticeTest, TopicLesson, LanguageMode } from '../types';

export async function solveQuestionAPI(params: {
  imageBase64?: string;
  mimeType?: string;
  textQuery?: string;
  language?: LanguageMode;
}): Promise<Omit<SolvedQuestion, 'id' | 'timestamp'>> {
  const response = await fetch('/api/ai/solve-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to solve question');
  }

  return data.solution;
}

export async function sendChatMessageAPI(params: {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  language: LanguageMode;
  studentLevel: string;
  activeSubject?: string;
}): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to get tutor response');
  }

  return data.text;
}

export async function generateTestAPI(params: {
  subject: string;
  topic: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  studentLevel?: string;
}): Promise<PracticeTest> {
  const response = await fetch('/api/ai/generate-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate practice test');
  }

  return {
    ...data.test,
    id: `test-${Date.now()}`,
    difficulty: params.difficulty || 'medium',
  };
}

export async function fetchTopicLessonAPI(params: {
  subject: string;
  topic: string;
  language?: LanguageMode;
}): Promise<TopicLesson> {
  const response = await fetch('/api/ai/learn-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch topic lesson');
  }

  return data.lesson;
}

export async function runToolActionAPI(params: {
  tool: 'simple' | 'translate' | 'rephrase' | 'analogy' | 'summarize' | 'notes' | 'hint';
  content: string;
  targetLanguage?: string;
}): Promise<string> {
  const response = await fetch('/api/ai/tool-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to run learning tool action');
  }

  return data.result;
}
