import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { whisperService } from '@/services/ai/whisperService';

export interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
  transcription?: string;
}

interface VoiceRecorderProps {
  onRecordingComplete?: (recording: AudioRecording) => void;
  onRecordingDelete?: (recordingId: string) => void;
  maxDuration?: number;
  enableTranscription?: boolean;
  onTranscribe?: (blob: Blob) => Promise<string>;
  className?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingDelete,
  maxDuration = 300,
  enableTranscription = false,
  onTranscribe,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const recording: AudioRecording = {
          id: `recording-${Date.now()}`,
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date(),
        };

        setRecordings(prev => [...prev, recording]);
        onRecordingComplete?.(recording);

        if (enableTranscription && onTranscribe) {
          await transcribeAudio(recording.id, audioBlob);
        }

        setRecordingTime(0);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerRef.current === null) {
          timerRef.current = setInterval(() => {
            setRecordingTime(prev => {
              const newTime = prev + 1;
              if (newTime >= maxDuration) {
                stopRecording();
              }
              return newTime;
            });
          }, 1000);
        }
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const transcribeAudio = async (recordingId: string, blob: Blob) => {
    setTranscribing(recordingId);
    try {
      let transcription: string;
      
      if (onTranscribe) {
        transcription = await onTranscribe(blob);
      } else {
        const result = await whisperService.transcribeAudio(blob, { language: 'fr' });
        transcription = whisperService.formatTranscription(result.text);
      }
      
      setRecordings(prev =>
        prev.map(rec =>
          rec.id === recordingId ? { ...rec, transcription } : rec
        )
      );
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Erreur lors de la transcription');
    } finally {
      setTranscribing(null);
    }
  };

  const togglePlayback = useCallback((recordingId: string, audioUrl: string) => {
    if (playingId === recordingId) {
      const audio = audioElementsRef.current[recordingId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingId(null);
    } else {
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      if (!audioElementsRef.current[recordingId]) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingId(null);
        audioElementsRef.current[recordingId] = audio;
      }

      audioElementsRef.current[recordingId].play();
      setPlayingId(recordingId);
    }
  }, [playingId]);

  const deleteRecording = useCallback((recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      URL.revokeObjectURL(recording.url);
      const audio = audioElementsRef.current[recordingId];
      if (audio) {
        audio.pause();
        audio.src = '';
        delete audioElementsRef.current[recordingId];
      }
    }
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
    if (playingId === recordingId) {
      setPlayingId(null);
    }
    onRecordingDelete?.(recordingId);
  }, [recordings, playingId, onRecordingDelete]);

  const downloadRecording = useCallback((recording: AudioRecording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `enregistrement-${recording.timestamp.toISOString()}.webm`;
    link.click();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recording Controls */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex flex-col items-center gap-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className={cn(
              'text-4xl font-mono font-bold',
              isRecording && !isPaused && 'text-red-500 animate-pulse'
            )}>
              {formatTime(recordingTime)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isRecording ? (isPaused ? 'En pause' : 'Enregistrement...') : 'Prêt à enregistrer'}
            </p>
          </div>

          {/* Waveform Animation (simulated) */}
          {isRecording && !isPaused && (
            <div className="flex items-center gap-1 h-12">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button
                type="button"
                onClick={startRecording}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <Mic className="w-6 h-6" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={pauseRecording}
                  size="lg"
                  className="rounded-full"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={stopRecording}
                  size="lg"
                  className="rounded-full"
                >
                  <Square className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            Enregistrements ({recordings.length})
          </h3>
          
          <div className="space-y-2">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="border rounded-lg p-4 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePlayback(recording.id, recording.url)}
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div>
                      <p className="text-sm font-medium">
                        {formatTime(recording.duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recording.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadRecording(recording)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Transcription */}
                {enableTranscription && (
                  <div className="pt-3 border-t">
                    {transcribing === recording.id ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transcription en cours...
                      </div>
                    ) : recording.transcription ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Transcription :
                        </p>
                        <p className="text-sm">{recording.transcription}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Pas de transcription disponible
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

