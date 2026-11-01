import React, { useState } from 'react';
import { 
  Sparkles, 
  Languages, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  Copy, 
  X, 
  Loader2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { runToolActionAPI } from '../services/api';
import { MathRenderer } from './MathRenderer';

interface LearningToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  initialTool?: 'simple' | 'translate' | 'rephrase' | 'analogy' | 'summarize' | 'notes' | 'hint';
}

export const LearningToolsModal: React.FC<LearningToolsModalProps> = ({
  isOpen,
  onClose,
  sourceText,
  initialTool = 'simple',
}) => {
  const [activeTool, setActiveTool] = useState<
    'simple' | 'translate' | 'rephrase' | 'analogy' | 'summarize' | 'notes' | 'hint'
  >(initialTool);
  const [targetLang, setTargetLang] = useState('Hindi');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteTool = async (
    tool: 'simple' | 'translate' | 'rephrase' | 'analogy' | 'summarize' | 'notes' | 'hint',
    lang = targetLang
  ) => {
    setActiveTool(tool);
    setIsLoading(true);
    setError(null);
    try {
      const res = await runToolActionAPI({
        tool,
        content: sourceText,
        targetLanguage: lang,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolsList = [
    { id: 'simple', label: 'Explain Simply', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'analogy', label: 'Real-world Analogy', icon: Sparkles, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
    { id: 'translate', label: 'Translate', icon: Languages, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'rephrase', label: 'Rephrase & Clarify', icon: RefreshCw, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { id: 'notes', label: 'Generate Notes', icon: BookOpen, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                AI Learning Tools
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supercharge your understanding instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Text Preview */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 overflow-hidden">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">Selected:</span>
          <span className="truncate italic">"{sourceText || 'General topic query'}"</span>
        </div>

        {/* Tool Select Pills */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleExecuteTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tool.label}
              </button>
            );
          })}
        </div>

        {/* Translation Sub-Options */}
        {activeTool === 'translate' && (
          <div className="px-5 py-2 flex items-center gap-2 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 text-xs">
            <span className="text-slate-500 font-medium">Target Language:</span>
            {['Hindi', 'Hinglish', 'Spanish', 'French', 'Bengali', 'Tamil'].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setTargetLang(lang);
                  handleExecuteTool('translate', lang);
                }}
                className={`px-2 py-0.5 rounded-md text-xs transition-colors ${
                  targetLang === lang
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div className="p-5 overflow-y-auto flex-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium animate-pulse">
                Nogi is crafting your personalized explanation...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-900">
              {error}
              <button
                onClick={() => handleExecuteTool(activeTool)}
                className="mt-2 block text-xs underline font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700 text-sm leading-relaxed">
                <MathRenderer content={result} />
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Click any tool button above to get instant explanations, analogies, or translations.
              </p>
              <button
                onClick={() => handleExecuteTool(activeTool)}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow"
              >
                <Sparkles className="w-4 h-4" />
                Generate Now
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && !isLoading && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500">Powered by NG Chat AI Engine</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Output
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
