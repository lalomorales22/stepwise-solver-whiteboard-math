
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    if (onEndCallbackRef.current) {
      onEndCallbackRef.current();
      onEndCallbackRef.current = null;
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    onEndCallbackRef.current = onEnd || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = handleEnd;
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror - Error:', event.error, 'Event:', event);
      setIsSpeaking(false);
      if (onEndCallbackRef.current) { // also call onEnd on error to proceed
        onEndCallbackRef.current();
        onEndCallbackRef.current = null;
      }
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, handleEnd]);

  const cancel = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onEndCallbackRef.current = null; 
  }, [isSupported]);

  useEffect(() => {
    // Cleanup: cancel speech on component unmount if it's speaking
    return () => {
      if (isSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
