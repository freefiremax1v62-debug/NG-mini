import { LanguageMode } from '../types';

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function createSpeechRecognition(
  language: LanguageMode = 'english',
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  // Language mapping
  switch (language) {
    case 'hindi':
      recognition.lang = 'hi-IN';
      break;
    case 'hinglish':
      recognition.lang = 'en-IN';
      break;
    default:
      recognition.lang = 'en-US';
  }

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const part = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += part;
      } else {
        interimTranscript += part;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    onResult(transcript, Boolean(finalTranscript));
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      onError('Microphone permission was denied. Please allow microphone access in your browser.');
    } else if (event.error === 'no-speech') {
      // quiet timeout, no hard error needed
    } else {
      onError(`Voice input error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

/**
 * Text-to-Speech: cleans out markdown and LaTeX syntax so speech sounds natural
 */
export function speakText(
  text: string,
  language: LanguageMode = 'english',
  onEnd?: () => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return () => {};
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  // Strip LaTeX formulas and markdown for pleasant audio
  const cleanText = text
    .replace(/\$\$[\s\S]*?\$\$/g, ' formula ')
    .replace(/\$[^$\n]+\$/g, ' math equation ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/`[^`]+`/g, ' code ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 1000); // limit audio snippet length

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set language & voice
  switch (language) {
    case 'hindi':
      utterance.lang = 'hi-IN';
      break;
    case 'hinglish':
      utterance.lang = 'en-IN';
      break;
    default:
      utterance.lang = 'en-US';
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.05; // Slightly friendly, warm pitch for Nogi

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
