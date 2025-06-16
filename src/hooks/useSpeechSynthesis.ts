'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechSynthesisHook {
  speak: (
    text: string,
    onSuccess?: () => void,
    onErrorOccurred?: (errorEvent: SpeechSynthesisErrorEvent) => void
  ) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const onSuccessCallbackRef = useRef<(() => void) | null>(null);
  const onErrorCallbackRef = useRef<((errorEvent: SpeechSynthesisErrorEvent) => void) | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    if (onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current();
    }
    onSuccessCallbackRef.current = null;
    onErrorCallbackRef.current = null; 
  }, []);

  const speak = useCallback((
    text: string,
    onSuccess?: () => void,
    onErrorOccurred?: (errorEvent: SpeechSynthesisErrorEvent) => void
  ) => {
    if (!isSupported || !text) {
      // If not supported or no text, call error callback immediately if provided,
      // as speech cannot proceed.
      if (onErrorOccurred) {
        onErrorOccurred(new SpeechSynthesisErrorEvent('error', { error: 'unsupported_or_empty_text' }) as SpeechSynthesisErrorEvent);
      }
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    onSuccessCallbackRef.current = onSuccess || null;
    onErrorCallbackRef.current = onErrorOccurred || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = handleEnd; // This will call onSuccessCallbackRef
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('SpeechSynthesisUtterance.onerror - Error:', event.error, 'Event Details:', event);
      setIsSpeaking(false);
      if (onErrorCallbackRef.current) {
        onErrorCallbackRef.current(event);
      }
      onSuccessCallbackRef.current = null; 
      onErrorCallbackRef.current = null;
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, handleEnd]);

  const cancel = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    setIsSpeaking(false); // Set speaking to false immediately on cancel
    window.speechSynthesis.cancel(); // This will also trigger 'onend' or 'onerror' with 'canceled'
    // Clear callbacks as cancel means we are stopping the current utterance
    onSuccessCallbackRef.current = null; 
    onErrorCallbackRef.current = null;
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
