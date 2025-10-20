import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare, X, Loader2, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IAstedService } from '@/services/iAstedService';
import { IAstedVoiceService } from '@/services/iAstedVoiceService';
import { IAstedStorageService } from '@/services/iAstedStorageService';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: 'voice' | 'text';
  audioUrl?: string;
}

export function IAstedAssistant() {
  // États
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(uuidv4());
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactContent, setArtifactContent] = useState<any>(null);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * GESTION DES CLICS SUR LE BOUTON
   * 
   * - Simple clic : Ouvre le mode texte
   * - Double clic : Lance le mode vocal
   */
  const handleButtonClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // SIMPLE CLIC : Mode texte
        handleSingleClick();
      } else if (clickCountRef.current >= 2) {
        // DOUBLE CLIC : Mode vocal
        handleDoubleClick();
      }
      clickCountRef.current = 0;
    }, 300); // Délai pour détecter le double-clic
  };

  /**
   * Simple clic : Ouvrir le mode texte
   */
  const handleSingleClick = () => {
    console.log('📝 Mode texte activé');
    setIsOpen(true);
    setMode('text');
    
    if (messages.length === 0) {
      // Message de bienvenue
      addAssistantMessage(
        "Excellence, je suis iAsted, votre assistant IA présidentiel. Comment puis-je vous aider aujourd'hui ?",
        'text'
      );
    }
  };

  /**
   * Double clic : Lancer le mode vocal
   */
  const handleDoubleClick = async () => {
    console.log('🎙️ Mode vocal activé');
    setIsOpen(true);
    setMode('voice');

    try {
      // CRITIQUE: Initialiser l'audio IMMÉDIATEMENT lors de l'interaction utilisateur
      // pour contourner les restrictions iOS/Safari
      console.log('🔓 Initialisation audio (iOS/mobile)...');
      await IAstedVoiceService.initializeAudio();
      
      // Vérifier la permission microphone
      const hasMic = await IAstedVoiceService.checkMicrophonePermission();
      if (!hasMic) {
        toast({
          title: 'Microphone requis',
          description: 'Veuillez autoriser l\'accès au microphone',
          variant: 'destructive'
        });
        return;
      }

      // iAsted parle en premier
      await speakWelcomeMessage();

      // Puis lance l'écoute
      await startVoiceInteraction();
      
    } catch (error: any) {
      console.error('Erreur initialisation mode vocal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer le mode vocal',
        variant: 'destructive'
      });
    }
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

    if (result.audioUrl) {
      // Sauvegarder l'URL audio dans le dernier message
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
   * Démarrer l'interaction vocale
   */
  const startVoiceInteraction = async () => {
    try {
      setIsListening(true);
      
      toast({
        title: '🎙️ En écoute...',
        description: 'Parlez maintenant'
      });

      // Démarrer l'enregistrement
      const startResult = await IAstedVoiceService.startRecording();
      
      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      // Arrêter après 30 secondes max ou sur action manuelle
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
   * Arrêter l'interaction vocale et traiter
   */
  const stopVoiceInteraction = async () => {
    setIsListening(false);
    setIsProcessing(true);

    try {
      // Arrêter et transcrire
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

      // Uploader l'audio
      const audioUpload = await IAstedStorageService.uploadAudio(
        result.audioBlob,
        'user-question.webm'
      );

      // Ajouter le message utilisateur
      const userMessage: Message = {
        role: 'user',
        content: result.transcription,
        timestamp: new Date(),
        mode: 'voice',
        audioUrl: audioUpload?.url
      };

      setMessages(prev => [...prev, userMessage]);

      // Obtenir la réponse de l'IA
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
   * Envoyer un message texte
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
   * Obtenir la réponse de l'IA
   */
  const getAIResponse = async (
    userQuestion: string,
    interactionMode: 'voice' | 'text',
    userAudioUrl?: string
  ) => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Appeler l'IA
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

      // Vérifier si la réponse nécessite un artefact
      const needsArtifact = checkIfNeedsArtifact(result.response || '');
      let artifactId: string | undefined;

      if (needsArtifact) {
        artifactId = await generateArtifact(result.response || '');
      }

      // Synthèse vocale si mode vocal
      let assistantAudioUrl: string | undefined;

      if (interactionMode === 'voice') {
        setIsSpeaking(true);
        const ttsResult = await IAstedVoiceService.speakText(result.response || '');
        setIsSpeaking(false);

        if (ttsResult.audioUrl && ttsResult.audioBlob) {
          // Uploader l'audio de la réponse
          const upload = await IAstedStorageService.uploadAudio(
            ttsResult.audioBlob,
            'assistant-response.mp3'
          );
          assistantAudioUrl = upload?.url;
        }
      }

      // Ajouter le message assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response || '',
        timestamp: new Date(),
        mode: interactionMode,
        audioUrl: assistantAudioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Sauvegarder en base de données avec contexte minimal
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
        artifacts_generated: artifactId ? [artifactId] : undefined,
        response_time_ms: responseTime
      });

      // Enrichir la base de connaissances si pertinent
      if (isKnowledgeWorthy(userQuestion, result.response || '')) {
        await IAstedStorageService.enrichKnowledgeBase(
          categorizeKnowledge(userQuestion),
          userQuestion,
          result.response || ''
        );
      }

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
   * Vérifier si la réponse nécessite un artefact visuel
   */
  const checkIfNeedsArtifact = (response: string): boolean => {
    const artifactKeywords = [
      'rapport', 'graphique', 'tableau', 'visualisation',
      'document', 'statistiques détaillées', 'analyse approfondie',
      'présentation', 'dashboard', 'carte'
    ];

    return artifactKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  };

  /**
   * Générer un artefact (à implémenter selon vos besoins)
   */
  const generateArtifact = async (content: string): Promise<string> => {
    // TODO: Intégrer avec votre système d'artefacts existant
    const artifactId = uuidv4();
    
    setArtifactOpen(true);
    setArtifactContent({
      id: artifactId,
      type: 'report',
      content: content
    });

    return artifactId;
  };

  /**
   * Déterminer si l'échange mérite d'enrichir la base de connaissances
   */
  const isKnowledgeWorthy = (question: string, response: string): boolean => {
    // Critères : réponse longue, contient des données chiffrées, ou recommandations
    return response.length > 200 || 
           /\d+%|\d+\s*(cas|agents|millions)/.test(response) ||
           /recommand|suggère|propose/.test(response.toLowerCase());
  };

  /**
   * Catégoriser le type de connaissance
   */
  const categorizeKnowledge = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('agent') || q.includes('sous-admin')) {
      return 'agent_performance';
    }
    if (q.includes('région') || q.includes('province')) {
      return 'regional_insight';
    }
    if (q.includes('ministère')) {
      return 'ministry_analysis';
    }
    if (q.includes('pattern') || q.includes('tendance')) {
      return 'pattern_corruption';
    }
    if (q.includes('recommand') || q.includes('décision')) {
      return 'strategic_recommendation';
    }
    
    return 'presidential_decision';
  };

  /**
   * Ajouter un message assistant
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
   * Basculer vers le mode vocal depuis le mode texte
   */
  const switchToVoice = async () => {
    try {
      // Initialiser l'audio si pas déjà fait
      await IAstedVoiceService.initializeAudio();
      
      setMode('voice');
      await startVoiceInteraction();
    } catch (error: any) {
      console.error('Erreur basculement vers vocal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de basculer en mode vocal',
        variant: 'destructive'
      });
    }
  };

  // RENDU DU COMPOSANT
  return (
    <>
      {/* BOUTON FLOTTANT iAsted */}
      <Button
        onClick={handleButtonClick}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 z-50"
        size="icon"
      >
        <Sparkles className="h-8 w-8 text-white" />
      </Button>

      {/* INTERFACE CHATBOT */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
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

          {/* Zone de messages */}
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
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString('fr-FR')}
                    {msg.mode === 'voice' && ' 🎙️'}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicateurs de chargement */}
            {isListening && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <Mic className="h-4 w-4 animate-pulse text-blue-600" />
                <AlertDescription className="text-blue-900 dark:text-blue-100">
                  En écoute... Parlez maintenant
                </AlertDescription>
              </Alert>
            )}

            {isSpeaking && (
              <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <AlertDescription className="text-purple-900 dark:text-purple-100">
                  iAsted parle...
                </AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <Alert className="border-gray-500 bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Analyse en cours...
                </AlertDescription>
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
            {mode === 'text' ? (
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Posez votre question..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendText}
                  disabled={!inputText.trim() || isProcessing}
                  size="icon"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={switchToVoice}
                  size="icon"
                  variant="outline"
                  title="Basculer en mode vocal"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
                  className={`flex-1 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  disabled={isProcessing || isSpeaking}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Arrêter l'écoute
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Parler
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setMode('text')}
                  variant="outline"
                  size="icon"
                  title="Basculer en mode texte"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ARTEFACT MODAL (si nécessaire) */}
      {artifactOpen && artifactContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h3 className="font-bold">Rapport Généré par iAsted</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setArtifactOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="prose max-w-none dark:prose-invert">
                {artifactContent.content}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
