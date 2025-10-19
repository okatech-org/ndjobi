/**
 * Bouton flottant iAsted pour accès rapide depuis n'importe quelle page
 * Utilise le bouton sphérique avec animations organiques 3D
 * Intégration complète : mode texte et vocal, transcription, TTS
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IAstedButton } from '@/components/ui/iAstedButton';
import { IAstedService } from '@/services/iAstedService';
import { IAstedVoiceService } from '@/services/iAstedVoiceService';
import { IAstedStorageService } from '@/services/iAstedStorageService';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: 'voice' | 'text';
  audioUrl?: string;
}

export const IAstedFloatingButton = () => {
  // États
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(uuidv4());

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * GESTION DES CLICS
   * Simple clic : Mode texte
   * Double clic : Mode vocal
   */
  const handleButtonClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        handleSingleClick();
      } else if (clickCountRef.current >= 2) {
        handleDoubleClick();
      }
      clickCountRef.current = 0;
    }, 350); // Fenêtre élargie pour détecter le double-clic
  };

  /**
   * Simple clic : Mode texte
   */
  const handleSingleClick = () => {
    console.log('📝 Mode texte activé');
    setIsOpen(true);
    setMode('text');
    
    if (messages.length === 0) {
      addAssistantMessage(
        "Excellence, je suis iAsted, votre assistant IA présidentiel. Comment puis-je vous aider ?",
        'text'
      );
    }
  };

  // Débloquer la lecture audio via un court bip (politique d'autoplay)
  const primeAudio = async () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      await ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.05);
      setTimeout(() => ctx.close(), 120);
    } catch (e) {
      console.warn('Prime audio failed:', e);
    }
  };

  /**
   * Double clic : Mode vocal
   */
  const handleDoubleClick = async () => {
    console.log('🎙️ Mode vocal activé - Double clic détecté');

    // Débloquer l'audio immédiatement (user gesture)
    await primeAudio();
    
    // Si déjà ouvert en mode texte, basculer vers vocal
    if (isOpen && mode === 'text') {
      await switchToVoice();
      return;
    }

    // Démarrer en mode vocal sans ouvrir l'interface
    setMode('voice');

    const hasMic = await IAstedVoiceService.checkMicrophonePermission();
    if (!hasMic) {
      toast({
        title: 'Microphone requis',
        description: 'Veuillez autoriser l\'accès au microphone',
        variant: 'destructive'
      });
      return;
    }

    await startVoiceInteraction();
  };

  /**
   * Message de bienvenue vocal
   */
  const speakWelcomeMessage = async () => {
    const welcomeText = "Excellence, que puis-je faire pour vous ?";
    
    addAssistantMessage(welcomeText, 'voice');
    
    setIsSpeaking(true);
    const result = await IAstedVoiceService.speakText(welcomeText);
    setIsSpeaking(false);

    if (!result?.success) {
      console.warn('Aucune sortie audio détectée pour le message de bienvenue');
      toast({
        title: 'Audio bloqué',
        description: "Activez le son du navigateur puis réessayez (double-clic).",
        variant: 'destructive'
      });
      return;
    }

    if (result.audioUrl) {
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].audioUrl = result.audioUrl;
        }
        return updated;
      });
    }
  };

  /**
   * Démarrer interaction vocale
   */
  const startVoiceInteraction = async () => {
    try {
      setIsListening(true);
      
      toast({
        title: '🎙️ En écoute...',
        description: 'Parlez maintenant'
      });

      const startResult = await IAstedVoiceService.startRecording();
      
      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      setTimeout(async () => {
        if (isListening) {
          await stopVoiceInteraction();
        }
      }, 30000);

    } catch (error: any) {
      console.error('Erreur interaction vocale:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      setIsListening(false);
    }
  };

  /**
   * Arrêter interaction vocale
   */
  const stopVoiceInteraction = async () => {
    setIsListening(false);
    setIsProcessing(true);

    try {
      const result = await IAstedVoiceService.stopRecordingAndTranscribe();

      if (!result || !result.transcription) {
        toast({
          title: 'Aucun audio détecté',
          description: 'Veuillez réessayer',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      console.log('📝 Transcription:', result.transcription);

      const audioUpload = await IAstedStorageService.uploadAudio(
        result.audioBlob,
        'user-question.webm'
      );

      const userMessage: Message = {
        role: 'user',
        content: result.transcription,
        timestamp: new Date(),
        mode: 'voice',
        audioUrl: audioUpload?.url
      };

      setMessages(prev => [...prev, userMessage]);

      await getAIResponse(result.transcription, 'voice', audioUpload?.url || '');

    } catch (error: any) {
      console.error('Erreur traitement vocal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter votre message vocal',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Envoyer message texte
   */
  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      mode: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    await getAIResponse(inputText, 'text');
  };

  /**
   * Obtenir réponse IA
   */
  const getAIResponse = async (
    userQuestion: string,
    interactionMode: 'voice' | 'text',
    userAudioUrl?: string
  ) => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const result = await IAstedService.sendMessage(
        userQuestion,
        messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        }))
      );

      if (result.error) {
        throw new Error(result.error);
      }

      const responseTime = Date.now() - startTime;

      let assistantAudioUrl: string | undefined;

      if (interactionMode === 'voice') {
        setIsSpeaking(true);
        const ttsResult = await IAstedVoiceService.speakText(result.response || '');
        setIsSpeaking(false);

        if (ttsResult.audioUrl && ttsResult.audioBlob) {
          const upload = await IAstedStorageService.uploadAudio(
            ttsResult.audioBlob,
            'assistant-response.mp3'
          );
          assistantAudioUrl = upload?.url;
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response || '',
        timestamp: new Date(),
        mode: interactionMode,
        audioUrl: assistantAudioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      const context = {
        timestamp: new Date().toISOString(),
        sessionId
      };

      await IAstedStorageService.saveConversation({
        session_id: sessionId,
        mode: interactionMode,
        user_message: userQuestion,
        user_message_audio_url: userAudioUrl,
        user_message_transcription: interactionMode === 'voice' ? userQuestion : undefined,
        assistant_message: result.response || '',
        assistant_audio_url: assistantAudioUrl,
        context_data: context,
        response_time_ms: responseTime
      });

    } catch (error: any) {
      console.error('Erreur réponse IA:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Ajouter message assistant
   */
  const addAssistantMessage = (content: string, mode: 'voice' | 'text') => {
    const message: Message = {
      role: 'assistant',
      content,
      timestamp: new Date(),
      mode
    };
    setMessages(prev => [...prev, message]);
  };

  /**
   * Basculer vers vocal
   */
  const switchToVoice = async () => {
    console.log('🔄 Basculement vers mode vocal');
    setMode('voice');
    
    const hasMic = await IAstedVoiceService.checkMicrophonePermission();
    if (!hasMic) {
      toast({
        title: 'Microphone requis',
        description: 'Veuillez autoriser l\'accès au microphone',
        variant: 'destructive'
      });
      return;
    }

    // Message de transition si déjà des messages
    if (messages.length > 0) {
      await speakWelcomeMessage();
    }
    
    await startVoiceInteraction();
  };

  return (
    <>
      {/* BOUTON SPHÉRIQUE */}
      <div className="fixed bottom-6 right-6 z-50 relative">
        {isListening && (
          <div className="absolute -inset-2 rounded-full ring-2 ring-purple-500 animate-pulse pointer-events-none" />
        )}
        {isSpeaking && (
          <div className="absolute -inset-2 rounded-full ring-2 ring-blue-500 animate-pulse pointer-events-none" />
        )}
        {isProcessing && (
          <div className="absolute -inset-2 rounded-full ring-2 ring-muted-foreground/50 animate-pulse pointer-events-none" />
        )}
        <IAstedButton 
          onClick={handleButtonClick}
          size="md"
        />
      </div>

      {/* INTERFACE CHAT */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">iAsted</h3>
                <p className="text-xs text-white/80">Assistant IA Présidentiel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mode === 'voice' ? 'default' : 'secondary'}>
                {mode === 'voice' ? '🎙️ Vocal' : '📝 Texte'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.audioUrl && (
                    <audio controls className="mt-2 w-full" src={msg.audioUrl} />
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicateurs */}
            {isListening && (
              <div className="flex items-center gap-2 text-purple-600">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-sm">En écoute...</span>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-blue-600">
                <MessageSquare className="h-4 w-4 animate-pulse" />
                <span className="text-sm">iAsted parle...</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Traitement...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone input */}
          <div className="p-4 border-t">
            {mode === 'text' ? (
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Tapez votre message..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendText}
                  disabled={!inputText.trim() || isProcessing}
                  size="icon"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  onClick={switchToVoice}
                  variant="outline"
                  size="icon"
                  title="Basculer en mode vocal"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
                  disabled={isProcessing || isSpeaking}
                  className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Arrêter l'écoute
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Commencer à parler
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setMode('text')}
                  variant="outline"
                  size="sm"
                >
                  Basculer en mode texte
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default IAstedFloatingButton;
