import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  Lightbulb, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Image as ImageIcon,
  ScanLine,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  FileQuestion,
  Volume2
} from 'lucide-react';
import { SolvedQuestion, SolutionStep } from '../types';
import { solveQuestionAPI } from '../services/api';
import { Storage } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { Mascot } from './Mascot';
import { LearningToolsModal } from './LearningToolsModal';

interface SnapSolveScreenProps {
  onNavigateToChat?: (initialPrompt?: string) => void;
  initialQuestion?: SolvedQuestion | null;
}

// Built-in educational sample snapshots matching the Flexi reference
const SAMPLE_PRESETS = [
  {
    title: 'Algebra: 2(5x - 3) + 3x = 9',
    category: 'Mathematics',
    previewText: 'Solve the equation:\n2(5x - 3) + 3x = 9',
    badge: 'From Reference',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900',
  },
  {
    title: 'Physics: Projectile Trajectory',
    category: 'Physics',
    previewText: 'A ball is launched vertically with velocity 20 m/s. Calculate maximum height (g = 9.8 m/s²).',
    badge: 'Kinematics',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900',
  },
  {
    title: 'Chemistry: Photosynthesis Equation',
    category: 'Biology/Chem',
    previewText: '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Identify the oxidation and reduction agents.',
    badge: 'Biochemistry',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900',
  },
  {
    title: 'Calculus: Find the Derivative',
    category: 'Mathematics',
    previewText: 'Find d/dx of f(x) = (3x² + 4)/(2x - 1) using quotient rule.',
    badge: 'Calculus',
    color: 'from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-900',
  },
];

export const SnapSolveScreen: React.FC<SnapSolveScreenProps> = ({
  onNavigateToChat,
  initialQuestion,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'text' | 'solution'>(
    initialQuestion ? 'solution' : 'camera'
  );
  const [activeSolution, setActiveSolution] = useState<SolvedQuestion | null>(
    initialQuestion || null
  );
  const [isSolving, setIsSolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Text query input
  const [textInput, setTextInput] = useState('');

  // Step-by-step interactive disclosure
  const [revealedStepCount, setRevealedStepCount] = useState<number>(1);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [toolsSourceText, setToolsSourceText] = useState('');

  // Start Camera
  const startCamera = async () => {
    setCameraPermissionDenied(false);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraPermissionDenied(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera' && !initialQuestion) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, facingMode]);

  // Capture photo from video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    handleSolveWithAI({ imageBase64: dataUrl, mimeType: 'image/jpeg' });
  };

  // Upload photo from gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      handleSolveWithAI({ imageBase64: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  // Main Solver
  const handleSolveWithAI = async (params: {
    imageBase64?: string;
    mimeType?: string;
    textQuery?: string;
  }) => {
    setIsSolving(true);
    setErrorMessage(null);
    setMode('solution');
    setRevealedStepCount(1);
    setRevealedHints({});

    try {
      const solutionData = await solveQuestionAPI(params);
      const newSolvedQuestion: SolvedQuestion = {
        ...solutionData,
        id: `q-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: params.imageBase64,
        isBookmarked: false,
      };

      setActiveSolution(newSolvedQuestion);
      Storage.addSolvedQuestion(newSolvedQuestion);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Could not recognize the question. Please try capturing or typing again.'
      );
    } finally {
      setIsSolving(false);
    }
  };

  // Preset question clicked
  const handleSelectPreset = (presetText: string) => {
    setTextInput(presetText);
    handleSolveWithAI({ textQuery: presetText });
  };

  const toggleBookmark = () => {
    if (!activeSolution) return;
    const newStatus = Storage.toggleBookmark(activeSolution.id);
    setActiveSolution({ ...activeSolution, isBookmarked: newStatus });
  };

  const toggleHint = (stepIndex: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [stepIndex]: !prev[stepIndex],
    }));
  };

  const revealNextStep = () => {
    if (!activeSolution) return;
    if (revealedStepCount < activeSolution.steps.length) {
      setRevealedStepCount((prev) => prev + 1);
    }
  };

  const revealAllSteps = () => {
    if (!activeSolution) return;
    setRevealedStepCount(activeSolution.steps.length);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top App Header / Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mascot mood={isSolving ? 'solving' : 'happy'} size="sm" showBadge />
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5">
              Snap &amp; Solve
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-full uppercase">
                AI OCR
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant step-by-step homework answers
            </p>
          </div>
        </div>

        {/* Mode switch tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setMode('camera');
              setActiveSolution(null);
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'camera'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => {
              setMode('upload');
              setActiveSolution(null);
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => {
              setMode('text');
              setActiveSolution(null);
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mode === 'text'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Type
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* CAMERA MODE */}
        {mode === 'camera' && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Viewfinder frame matching Flexi reference screenshot */}
            <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-slate-900 flex flex-col justify-between">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Camera Fallback / Permission UI */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md">
                    <Camera className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Camera Scanner</h3>
                  <p className="text-xs text-slate-300 max-w-xs mb-4">
                    {cameraPermissionDenied
                      ? 'Camera permission was not granted. You can still test easily with one-click presets below or upload from gallery.'
                      : 'Starting optical scanner... Tap below to activate.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Overlay: Scanner Reticle & Laser */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  {/* Top Hint Bar */}
                  <div className="bg-black/40 backdrop-blur-md text-white text-[11px] font-medium py-1 px-3 rounded-full self-center flex items-center gap-1.5 shadow">
                    <ScanLine className="w-3.5 h-3.5 text-amber-400" />
                    Align question inside the frame
                  </div>

                  {/* Corner Target Box */}
                  <div className="relative flex-1 my-4 border-2 border-white/40 rounded-2xl">
                    {/* Glowing animated scanline */}
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan shadow-[0_0_12px_#f59e0b]" />
                    {/* Top Left */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    {/* Top Right */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    {/* Bottom Left */}
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    {/* Bottom Right */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                  </div>

                  <div className="text-center text-white/80 text-[10px] pb-1 font-medium">
                    Reads printed textbooks, handwritten equations &amp; diagrams
                  </div>
                </div>
              )}

              {/* Bottom Camera Action Bar */}
              <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 flex items-center justify-around z-20">
                {/* Switch camera */}
                <button
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all"
                  title="Switch Camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Main Shutter Button */}
                <button
                  onClick={handleCapturePhoto}
                  disabled={!cameraActive}
                  className={`w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition-all transform active:scale-90 shadow-2xl ${
                    cameraActive
                      ? 'bg-amber-500 hover:bg-amber-400 cursor-pointer'
                      : 'bg-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7 text-amber-600" />
                  </div>
                </button>

                {/* Upload quick shortcut */}
                <label className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white cursor-pointer transition-all">
                  <ImageIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Test Presets (Crucial for desktop & instant testing) */}
            <div className="mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Instant Test Presets (One-click solve)
                </span>
                <span className="text-[11px] text-slate-400">Flexi benchmark</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.previewText)}
                    className={`text-left p-3 rounded-2xl bg-gradient-to-br ${preset.color} border transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <span>{preset.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-mono">
                      {preset.previewText}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD GALLERY MODE */}
        {mode === 'upload' && (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-200 dark:border-slate-800 rounded-3xl text-center flex-1 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
              <Upload className="w-10 h-10 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-1">
              Upload Question Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              Select an image of your homework, textbook page, screenshot, or notebook worksheet.
            </p>
            <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md cursor-pointer transition flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Choose from Gallery
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* TEXT TYPE MODE */}
        {mode === 'text' && (
          <div className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">
              Type or Paste Question
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter any math equation, science question, or word problem.
            </p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Solve the equation: 2(5x - 3) + 3x = 9 or calculate the force required to accelerate a 5kg mass at 3m/s²"
              rows={6}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
            />
            <button
              onClick={() => handleSolveWithAI({ textQuery: textInput })}
              disabled={!textInput.trim() || isSolving}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Solve Step-by-Step
            </button>
          </div>
        )}

        {/* SOLUTION VIEW (Step-by-Step interactive matching reference screenshot) */}
        {mode === 'solution' && (
          <div className="flex flex-col gap-4 pb-12">
            {/* Loading state with animated mascot */}
            {isSolving ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Mascot mood="solving" size="xl" className="mb-4" />
                <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">
                  Nogi is solving your question...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 animate-pulse">
                  Analyzing equation syntax, identifying concepts, and breaking into intuitive steps
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">
                  Could not solve question
                </h4>
                <p className="text-xs text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
                <button
                  onClick={() => setMode('camera')}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Try Taking Another Picture
                </button>
              </div>
            ) : activeSolution ? (
              <>
                {/* Problem Header Card */}
                <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                      {activeSolution.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleBookmark}
                        className={`p-2 rounded-xl border transition-all ${
                          activeSolution.isBookmarked
                            ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/50'
                            : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                        title="Save to favorites"
                      >
                        {activeSolution.isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setToolsSourceText(activeSolution.detectedQuestion);
                          setToolsModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:border-indigo-400"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        AI Tools
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Problem
                  </h2>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">
                    <MathRenderer content={activeSolution.detectedQuestion} />
                  </div>

                  {/* Concept / Formula pill */}
                  <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-indigo-50 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-indigo-700 dark:text-indigo-400 mb-0.5 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Concept / Rule:
                    </div>
                    <div>{activeSolution.conceptFormula}</div>
                  </div>
                </div>

                {/* What is being asked */}
                <div className="px-4 py-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">What is being asked: </span>
                    {activeSolution.whatIsAsked}
                  </div>
                </div>

                {/* Section title & progress */}
                <div className="flex items-center justify-between pt-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    Step-by-Step Breakdown
                    <span className="text-xs font-normal text-slate-500">
                      ({revealedStepCount} of {activeSolution.steps.length} steps shown)
                    </span>
                  </h3>
                  {revealedStepCount < activeSolution.steps.length && (
                    <button
                      onClick={revealAllSteps}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Show All Steps
                    </button>
                  )}
                </div>

                {/* Steps Cards (Matching Screenshot 2 Left Card) */}
                <div className="space-y-3">
                  {activeSolution.steps.slice(0, revealedStepCount).map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-200"
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                            {step.stepNumber}
                          </span>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {step.title}
                          </h4>
                        </div>
                        {step.hint && (
                          <button
                            onClick={() => toggleHint(step.stepNumber)}
                            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                          >
                            <Lightbulb className="w-3 h-3" />
                            {revealedHints[step.stepNumber] ? 'Hide Hint' : '💡 Get a Hint'}
                          </button>
                        )}
                      </div>

                      {/* Explanation */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        {step.explanation}
                      </p>

                      {/* Math Formula if present */}
                      {step.mathFormula && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center border border-slate-100 dark:border-slate-700 my-2">
                          <MathRenderer content={`$$${step.mathFormula}$$`} />
                        </div>
                      )}

                      {/* Revealed Hint Box */}
                      {revealedHints[step.stepNumber] && step.hint && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Hint: </span>
                            {step.hint}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reveal Next Step Button (Interactive Flexi Feature) */}
                {revealedStepCount < activeSolution.steps.length && (
                  <button
                    onClick={revealNextStep}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-98"
                  >
                    <span>Check Answer &amp; Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Final Answer Banner (Shown once all steps revealed) */}
                {revealedStepCount >= activeSolution.steps.length && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-lg mt-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-200" />
                      Final Answer
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold tracking-tight mb-2">
                      <MathRenderer content={activeSolution.finalAnswer} className="text-white" />
                    </div>
                    <div className="text-xs text-emerald-50 bg-white/10 p-3 rounded-2xl backdrop-blur-xs leading-relaxed">
                      <span className="font-bold">Why it's correct: </span>
                      {activeSolution.whyItWorks}
                    </div>
                  </div>
                )}

                {/* Similar Practice Question */}
                {activeSolution.practiceQuestion && revealedStepCount >= activeSolution.steps.length && (
                  <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-3xl border border-purple-200 dark:border-purple-900/50">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Try Another Question (Practice)
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 font-mono">
                      {activeSolution.practiceQuestion}
                    </p>
                    <button
                      onClick={() => {
                        setTextInput(activeSolution.practiceQuestion || '');
                        handleSolveWithAI({ textQuery: activeSolution.practiceQuestion });
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
                    >
                      Solve this next
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigateToChat) {
                        onNavigateToChat(
                          `Can you explain this question more: "${activeSolution.detectedQuestion}" and answer: "${activeSolution.finalAnswer}"?`
                        );
                      }
                    }}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Ask Nogi in Chat
                  </button>

                  <button
                    onClick={() => {
                      setMode('camera');
                      setActiveSolution(null);
                    }}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Another
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Learning Tools Modal */}
      <LearningToolsModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
        sourceText={toolsSourceText}
      />
    </div>
  );
};
