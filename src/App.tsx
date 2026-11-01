import React, { useState, useEffect } from 'react';
import { AndroidFrame, TabType } from './components/AndroidFrame';
import { HomeScreen } from './components/HomeScreen';
import { SnapSolveScreen } from './components/SnapSolveScreen';
import { AITutorScreen } from './components/AITutorScreen';
import { ExploreTopicsScreen } from './components/ExploreTopicsScreen';
import { TestsScreen } from './components/TestsScreen';
import { ProfileProgressScreen } from './components/ProfileProgressScreen';
import { SolvedQuestion } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Cross-tab state sharing
  const [selectedQuestionForSolver, setSelectedQuestionForSolver] = useState<SolvedQuestion | null>(null);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string | undefined>(undefined);
  const [quizSubjectTopic, setQuizSubjectTopic] = useState<{ subject: string; topic: string } | null>(null);

  // Apply dark class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleNavigateToChat = (prompt?: string) => {
    setTutorInitialPrompt(prompt);
    setActiveTab('tutor');
  };

  const handleSelectQuestionForSolver = (question: SolvedQuestion) => {
    setSelectedQuestionForSolver(question);
    setActiveTab('snap');
  };

  const handleStartQuizForTopic = (subject: string, topic: string) => {
    setQuizSubjectTopic({ subject, topic });
    setActiveTab('tests');
  };

  const handleSelectSubjectTopicFromHome = (subject: string, topic: string) => {
    setQuizSubjectTopic({ subject, topic });
    setActiveTab('explore');
  };

  return (
    <AndroidFrame
      activeTab={activeTab}
      onTabChange={(tab) => {
        // If clicking snap tab directly from bottom bar, reset selected question to open camera
        if (tab === 'snap') {
          setSelectedQuestionForSolver(null);
        }
        setActiveTab(tab);
      }}
      isDarkMode={isDarkMode}
      onToggleDarkMode={handleToggleDarkMode}
    >
      {activeTab === 'home' && (
        <HomeScreen
          onNavigateTab={setActiveTab}
          onSelectQuestion={handleSelectQuestionForSolver}
          onSelectSubjectTopic={handleSelectSubjectTopicFromHome}
        />
      )}

      {activeTab === 'snap' && (
        <SnapSolveScreen
          key={selectedQuestionForSolver ? selectedQuestionForSolver.id : 'camera-fresh'}
          initialQuestion={selectedQuestionForSolver}
          onNavigateToChat={handleNavigateToChat}
        />
      )}

      {activeTab === 'tutor' && (
        <AITutorScreen initialPrompt={tutorInitialPrompt} />
      )}

      {activeTab === 'explore' && (
        <ExploreTopicsScreen
          onStartQuizForTopic={handleStartQuizForTopic}
        />
      )}

      {activeTab === 'tests' && (
        <TestsScreen
          initialSubject={quizSubjectTopic?.subject}
          initialTopic={quizSubjectTopic?.topic}
          onNavigateToExplore={() => setActiveTab('explore')}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileProgressScreen
          onSelectSavedQuestion={handleSelectQuestionForSolver}
          onNavigateToChat={() => setActiveTab('tutor')}
        />
      )}
    </AndroidFrame>
  );
}
