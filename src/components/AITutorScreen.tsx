import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Radio, 
  AlertCircle 
} from 'lucide-react';
import { ChatMessage, ChatSession, LanguageMode } from '../types';
import { sendChatMessageAPI } from '../services/api';
import { Storage } from '../services/storage';
import { 
  createSpeechRecognition, 
  isSpeechRecognitionSupported, 
  speakText, 
  stopSpeaking,
  isSpeechSynthesisSupported 
} from '../services/speech';
import { useLiveDateTime, formatRelativeTime } from '../services/datetime';
import { MathRenderer } from './MathRenderer';
import { Mascot } from './Mascot';
import { LearningToolsModal } from './LearningToolsModal';

interface AITutorScreenProps {
  initialPrompt?: string;
}

export const AITutorScreen: React.FC<AITutorScreenProps> = ({ initialPrompt }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => Storage.getChatSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(
    sessions[0]?.id || 'session-default'
  );
  const [inputMessage, setInputMessage] = useState('');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('english');
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Web Speech API: Voice Input (Microphone) State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech API: Text-to-Speech (Read Aloud) State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Live Date & Time Hook (changes continuously from second to second)
  const { now, timeString, shortDate } = useLiveDateTime();

  // Tools modal
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolText, setToolText] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const userProfile = Storage.getUserProfile();

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isSending]);

  // Clean up speech recognition & speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      stopSpeaking();
    };
  }, []);

  // Handle external initial prompt if navigated from other tabs
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Web Speech API: Start / Stop Voice Input
  const toggleSpeechRecognition = () => {
    setSpeechError(null);

    if (isListening) {
      stopVoiceInput();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android Web browser.'
      );
      return;
    }

    try {
      setVoiceTranscript('');
      const recognition = createSpeechRecognition(
        languageMode,
        (transcript: string, isFinal: boolean) => {
          setVoiceTranscript(transcript);
          setInputMessage(transcript);
        },
        (error: string) => {
          setSpeechError(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setSpeechError(err.message || 'Could not start microphone');
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleVoiceSubmit = () => {
    stopVoiceInput();
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
    }
  };

  // Text-to-Speech: Toggle read aloud
  const handleToggleReadAloud = (messageId: string, content: string) => {
    if (speakingMessageId === messageId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(messageId);
      speakText(content, languageMode, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    // Stop listening if active
    if (isListening) {
      stopVoiceInput();
    }
    // Stop any ongoing speech
    stopSpeaking();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...(currentSession?.messages || []), userMsg];

    const updatedSessions = sessions.map((s) =>
      s.id === currentSession.id ? { ...s, messages: updatedMessages } : s
    );
    setSessions(updatedSessions);
    Storage.saveChatSessions(updatedSessions);
    setInputMessage('');
    setVoiceTranscript('');
    setIsSending(true);

    try {
      const responseText = await sendChatMessageAPI({
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        language: languageMode,
        studentLevel: userProfile.educationLevel,
        activeSubject: activeSubject !== 'All Subjects' ? activeSubject : undefined,
      });

      const followUps = [
        'Can you give a real-life analogy? 🧠',
        'Can you explain this in simpler words? 🧒',
        'Generate 2 practice quiz questions 📝',
        'Explain step-by-step 🔍',
      ];

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        suggestedPrompts: followUps,
      };

      const finalMessages = [...updatedMessages, botMsg];
      const finalSessions = sessions.map((s) =>
        s.id === currentSession.id ? { ...s, messages: finalMessages } : s
      );
      setSessions(finalSessions);
      Storage.saveChatSessions(finalSessions);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: `I'm having a little trouble connecting right now (${err.message || 'Network issue'}). Please try asking again!`,
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      const finalSessions = sessions.map((s) =>
        s.id === currentSession.id ? { ...s, messages: finalMessages } : s
      );
      setSessions(finalSessions);
      Storage.saveChatSessions(finalSessions);
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `Study Session ${sessions.length + 1}`,
      subject: activeSubject,
      createdAt: Date.now(),
      messages: [
        {
          id: `m-init-${Date.now()}`,
          role: 'model',
          content: `Hi ${userProfile.name.split(' ')[0]}! What would you like to learn or solve next? Tap the 🎙️ **Microphone** to speak your homework question or ask in **English**, **Hindi**, or **Hinglish**! 📚✨`,
          timestamp: Date.now(),
          suggestedPrompts: [
            'Help me solve a math problem',
            'Explain Newton’s Third Law in Hinglish',
            'What is the difference between DNA and RNA?',
            'Give me an analogy for inflation',
          ],
        },
      ],
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    Storage.saveChatSessions(updated);
  };

  const clearCurrentChat = () => {
    if (!currentSession) return;
    stopSpeaking();
    setSpeakingMessageId(null);
    const resetMessages: ChatMessage[] = [
      {
        id: `m-${Date.now()}`,
        role: 'model',
        content: `Chat cleared! What shall we tackle next? Tap the 🎙️ microphone to ask by voice!`,
        timestamp: Date.now(),
      },
    ];
    const updated = sessions.map((s) =>
      s.id === currentSession.id ? { ...s, messages: resetMessages } : s
    );
    setSessions(updated);
    Storage.saveChatSessions(updated);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickTopicSuggestions = [
    'Explain with a real-life analogy 🧠',
    'Simplify in 5th grade words 🧒',
    'Teach me in Hinglish 🇮🇳',
    'Generate 3 practice MCQs 📝',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Tutor Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mascot mood={isSending ? 'thinking' : isListening ? 'solving' : 'happy'} size="sm" showBadge />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Nogi AI Tutor
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {/* Live Changing Time & Date Badge */}
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>{userProfile.educationLevel.split(' ')[0]}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-2.5 h-2.5 text-indigo-500" />
                <span className="font-mono">{timeString}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Language selector & actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setLanguageMode('english')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                languageMode === 'english'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguageMode('hinglish')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                languageMode === 'hinglish'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setLanguageMode('hindi')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                languageMode === 'hindi'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={clearCurrentChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speech Recognition Error Notice if mic is blocked */}
      {speechError && (
        <div className="mx-4 mt-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-between text-xs text-red-700 dark:text-red-300 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-xs font-bold text-red-800 dark:text-red-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {currentSession?.messages.map((message) => {
          const isUser = message.role === 'user';
          const isSpeaking = speakingMessageId === message.id;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 shadow-xs relative ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Nogi
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Read Aloud Button (Web Speech API TTS) */}
                      <button
                        onClick={() => handleToggleReadAloud(message.id, message.content)}
                        className={`p-1 rounded-lg text-xs transition ${
                          isSpeaking
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'text-slate-400 hover:text-indigo-600'
                        }`}
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud with Web Speech API'}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="text-slate-400 hover:text-slate-600 text-xs p-1"
                        title="Copy message"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setToolText(message.content);
                          setToolsOpen(true);
                        }}
                        className="text-slate-400 hover:text-indigo-600 text-xs p-1"
                        title="Use AI Learning Tools on this"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <MathRenderer
                  content={message.content}
                  className={isUser ? 'text-white' : ''}
                />

                {/* Dynamic Live Updating Relative Timestamp */}
                <div
                  className={`mt-1.5 text-[10px] flex items-center gap-1 ${
                    isUser ? 'text-indigo-200 justify-end' : 'text-slate-400 justify-start'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatRelativeTime(message.timestamp, now.getTime())}</span>
                  {isSpeaking && (
                    <span className="text-amber-500 font-semibold ml-1 animate-pulse">
                      • Speaking...
                    </span>
                  )}
                </div>
              </div>

              {/* Bot Follow-Up Suggestions */}
              {!isUser && message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 pl-1 max-w-[88%]">
                  {message.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full transition-all hover:scale-[1.02] shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
            <Mascot mood="thinking" size="sm" />
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] text-slate-400">Nogi is writing explanation...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* LIVE VOICE RECORDING BANNER (When Microphone is active) */}
      {isListening && (
        <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 border-t border-b border-red-200 dark:border-red-900/50 backdrop-blur-md flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            {/* Animated Audio Waveform Bars */}
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-1 bg-red-500 rounded-full animate-bounce h-3 [animation-duration:0.6s]" />
              <span className="w-1 bg-red-500 rounded-full animate-bounce h-5 [animation-duration:0.8s]" />
              <span className="w-1 bg-red-500 rounded-full animate-bounce h-2 [animation-duration:0.5s]" />
              <span className="w-1 bg-red-500 rounded-full animate-bounce h-6 [animation-duration:0.7s]" />
              <span className="w-1 bg-red-500 rounded-full animate-bounce h-4 [animation-duration:0.6s]" />
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Listening via Web Speech API ({languageMode.toUpperCase()})...
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic truncate max-w-xs sm:max-w-md">
                "{voiceTranscript || 'Speak your question clearly...'}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleVoiceSubmit}
              disabled={!inputMessage.trim()}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Done &amp; Send
            </button>
            <button
              onClick={stopVoiceInput}
              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Quick Prompts */}
      <div className="px-4 py-1.5 max-w-2xl mx-auto w-full overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {quickTopicSuggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sug)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 font-medium hover:bg-indigo-100 transition-colors shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Box with Voice Mic Button */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="max-w-2xl mx-auto flex items-center gap-2"
        >
          {/* Web Speech API Microphone Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-2xl transition transform active:scale-95 flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-200 dark:ring-red-950 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700'
            }`}
            title={isListening ? 'Stop listening' : 'Ask using microphone (Web Speech API)'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice... Speak now'
                : languageMode === 'hinglish'
                ? 'Kuch bhi pucho... Type or tap 🎙️ mic'
                : languageMode === 'hindi'
                ? 'बोलकर या लिखकर सवाल पूछें...'
                : 'Ask homework question or tap 🎙️ mic...'
            }
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm border-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-md transition transform active:scale-95 flex items-center justify-center shrink-0"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <LearningToolsModal
        isOpen={toolsOpen}
        onClose={() => setToolsOpen(false)}
        sourceText={toolText}
      />
    </div>
  );
};
