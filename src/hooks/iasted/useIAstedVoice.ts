/**
 * Hook React pour gérer les conversations vocales avec iAsted
 * Intègre enregistrement audio, WebSocket, et lecture audio
 * VERSION iOS/MOBILE OPTIMISÉE
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import IAstedWebSocket, { IAstedWebSocketConfig, TranscriptMessage, LLMResponseMessage } from '@/services/iasted/iastedWebSocket';
import { iastedClient } from '@/services/iasted/iastedApiClient';
import { IAstedAudioManager } from '@/services/iAstedAudioManager';

export interface VoiceConversationTurn {
  id: string;
  userTranscript: string;
  assistantResponse: string;
  provider: string;
  timestamp: Date;
}

export interface UseIAstedVoiceOptions {
  autoStart?: boolean;
  onError?: (error: string) => void;
}

export const useIAstedVoice = (token: string, options: UseIAstedVoiceOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<VoiceConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<IAstedWebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTurnRef = useRef<Partial<VoiceConversationTurn>>({});

  const handleTranscript = useCallback((message: TranscriptMessage) => {
    setCurrentTranscript(message.transcript);
    
    if (message.is_final) {
      currentTurnRef.current.userTranscript = message.transcript;
    }
  }, []);

  const handleLLMResponse = useCallback((message: LLMResponseMessage) => {
    currentTurnRef.current.assistantResponse = message.text;
    currentTurnRef.current.provider = message.provider;
    currentTurnRef.current.timestamp = new Date();
    currentTurnRef.current.id = `turn-${Date.now()}`;

    setConversationHistory(prev => [...prev, currentTurnRef.current as VoiceConversationTurn]);
    
    currentTurnRef.current = {};
    setCurrentTranscript('');
    setIsProcessing(false);
  }, []);

  const handleAudioResponse = useCallback(async (audioBlob: Blob) => {
    // Utiliser l'AudioContext débloqué de IAstedAudioManager
    const audioContext = IAstedAudioManager.getAudioContext();
    
    if (!audioContext) {
      console.warn('⚠️ AudioContext non disponible, tentative avec IAstedAudioManager');
      
      // Fallback: utiliser AudioManager pour la lecture
      try {
        await IAstedAudioManager.playAudioBlob(audioBlob);
      } catch (err) {
        console.error('❌ Erreur lecture audio via AudioManager:', err);
      }
      return;
    }

    try {
      // Vérifier l'état de l'AudioContext et le reprendre si nécessaire
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (err) {
      console.error('❌ Erreur lecture audio WebAudio:', err);
      
      // Fallback final: HTMLAudioElement via AudioManager
      try {
        await IAstedAudioManager.playAudioBlob(audioBlob);
      } catch (fallbackErr) {
        console.error('❌ Erreur fallback audio:', fallbackErr);
      }
    }
  }, []);

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsProcessing(false);
    options.onError?.(errorMsg);
  }, [options]);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      iastedClient.setToken(token);
      
      const session = await iastedClient.createVoiceSession();
      sessionIdRef.current = session.session_id;

      const wsConfig: IAstedWebSocketConfig = {
        sessionId: session.session_id,
        token,
        onTranscript: handleTranscript,
        onLLMResponse: handleLLMResponse,
        onAudioResponse: handleAudioResponse,
        onError: handleError,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
      };

      wsRef.current = new IAstedWebSocket(wsConfig);
      await wsRef.current.connect();

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Erreur démarrage session';
      handleError(errorMsg);
      throw err;
    }
  }, [token, handleTranscript, handleLLMResponse, handleAudioResponse, handleError]);

  const stopSession = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    if (sessionIdRef.current) {
      try {
        await iastedClient.endVoiceSession(sessionIdRef.current);
      } catch (err) {
        console.warn('⚠️ Erreur fermeture session:', err);
      }
      sessionIdRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setIsConnected(false);
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!wsRef.current?.isConnected()) {
      throw new Error('Session WebSocket non connectée');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current) {
          event.data.arrayBuffer().then((buffer) => {
            wsRef.current?.sendAudioChunk(buffer);
          });
        }
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setIsProcessing(true);

    } catch (err: any) {
      handleError(`Erreur accès microphone: ${err.message}`);
      throw err;
    }
  }, [handleError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    wsRef.current?.endUtterance();
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    if (options.autoStart && token) {
      startSession();
    }

    return () => {
      stopSession();
    };
  }, []);

  return {
    isConnected,
    isRecording,
    isProcessing,
    currentTranscript,
    conversationHistory,
    error,
    startSession,
    stopSession,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};

export default useIAstedVoice;

