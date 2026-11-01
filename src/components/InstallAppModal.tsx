import React from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Mascot } from './Mascot';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mascot mood="happy" size="sm" showBadge />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Install NG Chat on Android
              </h3>
              <p className="text-xs text-indigo-100">
                Apne phone par app install karein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Method 1: Direct 1-Tap Install (WebAPK) - Recommended */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Method 1: Direct Phone Install (Recommended)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                No Warnings
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Google Chrome automatically creates and installs a certified Android App (WebAPK) directly on your home screen with full screen and camera permissions.
            </p>

            <button
              onClick={handleDirectInstall}
              disabled={isInstalled}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Already Installed on this Device!</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>{isInstallable ? 'Install to Android Phone Now' : 'Add to Home Screen / Install'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Method 2: Direct Download APK File */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-amber-500" />
                Method 2: Download APK File directly
              </span>
              <span className="text-[10px] font-mono text-slate-400">.apk Package</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Download <strong className="text-slate-800 dark:text-slate-200">ng-chat-ai-tutor.apk</strong> saved in the project folder to install manually on your Android device:
            </p>

            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="text-amber-500 font-bold">📦</span>
                <span className="truncate">ng-chat-ai-tutor.apk</span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">v1.0.0</span>
            </div>

            <a
              href="/ng-chat-ai-tutor.apk"
              download="ng-chat-ai-tutor.apk"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download APK File (Save to Phone)</span>
            </a>
          </div>

          {/* Method 3: Native Android Studio Project ZIP */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Method 3: Native Android Studio Project (Capacitor)
              </span>
              <span className="text-[10px] font-mono text-slate-400">.zip (1.6 MB)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Download the complete native Android project folder containing Gradle, AndroidManifest, Java, and assets ready to compile in Android Studio:
            </p>

            <a
              href="/ng-chat-android-source.zip"
              download="ng-chat-android-source.zip"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Android Studio Project (.zip)</span>
            </a>
          </div>

          {/* Method 4: 1-Click Online APK Builder */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Method 4: 1-Click Online APK Generator (PWABuilder)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate a signed, Google Play ready APK online in 30 seconds using Microsoft's official PWABuilder:
            </p>
            <a
              href="https://www.pwabuilder.com/reportcard?site=https://ais-pre-eftvlswkz2bcr25trwtmy6-831264537403.asia-northeast1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>Open 1-Click APK Generator (PWABuilder)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Hindi Instructions / Step-by-step */}
          <div className="p-3 bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Phone par install kaise karein:
            </div>
            <div>
              1. <strong>Direct Install:</strong> Upar diye gaye <strong>"Install to Android Phone Now"</strong> button par click karein.
            </div>
            <div>
              2. <strong>Chrome Menu se:</strong> Phone ke Chrome browser mein right corner par <strong>3 dots (⋮)</strong> dabayein aur <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> chunein.
            </div>
            <div>
              3. <strong>APK se:</strong> <strong>"Download APK File"</strong> button se APK download karke install karein.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
