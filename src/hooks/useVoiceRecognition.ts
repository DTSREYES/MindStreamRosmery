import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface VoiceRecognitionResult {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  clearTranscript: () => void;
}

export const useVoiceRecognition = (language: string = 'es-ES'): VoiceRecognitionResult => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(Platform.OS === 'android');
  const [error, setError] = useState<string | null>(null);
  const [SR, setSR] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const initSR = async () => {
      try {
        if (Platform.OS !== 'android') {
          setIsSupported(false);
          return;
        }

        // Dynamically import to avoid import errors on non-android
        const module = await import('expo-speech-recognition');
        setSR(module);
        
        if (module && typeof module.isSupportedAsync === 'function') {
          const supported = await module.isSupportedAsync();
          setIsSupported(supported);
        }
      } catch (err) {
        console.warn('SR init error:', err);
        setIsSupported(false);
      }
    };

    initSR();
  }, []);

  const startListening = useCallback(async () => {
    try {
      if (!SR || !isSupported) {
        setError('Reconocimiento de voz no disponible');
        return;
      }

      setError(null);
      setIsListening(true);
      setTranscript('');

      console.log('Starting speech recognition...');

      // startAsync is blocking - it waits until stopAsync is called or timeout
      const result = await SR.startAsync?.({
        language,
        maxResults: 1,
        interimResults: false,
      });

      console.log('Speech result:', result);

      if (result?.transcript) {
        console.log('Transcript received:', result.transcript);
        setTranscript(result.transcript);
      } else {
        console.warn('No transcript in result');
      }

      setIsListening(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('SR start error:', msg);
      setError(msg || 'Error al grabar');
      setIsListening(false);
    }
  }, [SR, isSupported, language]);

  const stopListening = useCallback(async () => {
    try {
      console.log('Stopping speech recognition...');
      if (SR?.stopAsync) {
        const result = await SR.stopAsync();
        console.log('Stop result:', result);
        if (result?.transcript) {
          console.log('Transcript from stop:', result.transcript);
          setTranscript(result.transcript);
        }
      }
      setIsListening(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('SR stop error:', msg);
      setIsListening(false);
    }
  }, [SR]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
};
