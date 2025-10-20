/**
 * Bouton iAsted optimisé pour mobile
 * 
 * Version légère et fluide spécifiquement conçue pour les appareils mobiles
 * avec des animations optimisées et une interface tactile améliorée
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, MessageSquare, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { IAstedMobileDetection } from '@/services/iAstedMobileDetection';
import { PerformanceOptimizationService } from '@/services/performanceOptimization';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: 'voice' | 'text';
}

interface IAstedMobileButtonProps {
  className?: string;
}

export const IAstedMobileButton: React.FC<IAstedMobileButtonProps> = ({ className }) => {
  const { role } = useAuth();
  const { toast } = useToast();
  
  // États optimisés pour mobile
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(uuidv4());
  
  // Position du bouton optimisée pour mobile
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('iasted-mobile-position');
    if (saved) {
      return JSON.parse(saved);
    }
    return { 
      x: window.innerWidth - 80, 
      y: window.innerHeight - 80 
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Auto-scroll optimisé
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Détection des problèmes mobiles
  useEffect(() => {
    const detectMobileIssues = () => {
      const issues = IAstedMobileDetection.detectAllIssues();
      if (issues.length > 0) {
        const criticalIssues = issues.filter(i => i.type === 'critical');
        if (criticalIssues.length > 0) {
          toast({
            title: "Configuration mobile détectée",
            description: "Certains paramètres peuvent affecter iAsted sur mobile",
            variant: "default"
          });
        }
      }
    };

    const timer = setTimeout(detectMobileIssues, 1000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sauvegarder la position
  useEffect(() => {
    localStorage.setItem('iasted-mobile-position', JSON.stringify(position));
  }, [position]);

  /**
   * Gestion des clics optimisée pour mobile
   */
  const handleButtonClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Simple clic : Mode texte
        handleSingleClick();
      } else if (clickCountRef.current >= 2) {
        // Double clic : Mode vocal
        handleDoubleClick();
      }
      clickCountRef.current = 0;
    }, 300);
  }, []);

  const handleSingleClick = useCallback(() => {
    setIsOpen(true);
    setMode('text');
    
    if (messages.length === 0) {
      addAssistantMessage(
        "Excellence, je suis iAsted, votre assistant IA présidentiel. Comment puis-je vous aider ?",
        'text'
      );
    }
  }, [messages.length]);

  const handleDoubleClick = useCallback(async () => {
    setIsOpen(true);
    setMode('voice');

    try {
      // Vérification rapide des permissions
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        toast({
          title: "Microphone requis",
          description: "Autorisez l'accès au microphone pour utiliser le mode vocal",
          variant: "destructive"
        });
        return;
      }

      // Message de bienvenue vocal
      const welcomeText = "Excellence, que puis-je faire pour vous ?";
      addAssistantMessage(welcomeText, 'voice');
      
      // Démarrer l'écoute
      await startVoiceInteraction();
      
    } catch (error: any) {
      console.error('Erreur mode vocal:', error);
      toast({
        title: "Erreur mode vocal",
        description: "Impossible d'activer la reconnaissance vocale",
        variant: "destructive"
      });
    }
  }, []);

  /**
   * Vérification rapide des permissions
   */
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Interaction vocale simplifiée
   */
  const startVoiceInteraction = async () => {
    setIsListening(true);
    
    // Simulation d'interaction vocale optimisée
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulation de traitement
      setTimeout(() => {
        setIsProcessing(false);
        const response = "J'ai bien reçu votre message vocal. Comment puis-je vous aider davantage ?";
        addAssistantMessage(response, 'voice');
      }, 1500);
    }, 3000);
  };

  /**
   * Ajouter un message assistant
   */
  const addAssistantMessage = useCallback((content: string, mode: 'voice' | 'text') => {
    const message: Message = {
      role: 'assistant',
      content,
      timestamp: new Date(),
      mode
    };
    setMessages(prev => [...prev, message]);
  }, []);

  /**
   * Envoyer un message texte
   */
  const handleSendText = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      mode: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Utiliser le cache optimisé
      const response = await PerformanceOptimizationService.getCachedIAstedResponse(inputText);
      
      setTimeout(() => {
        setIsProcessing(false);
        addAssistantMessage(response.response, 'text');
      }, 1000);
      
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre message",
        variant: "destructive"
      });
    }
  }, [inputText, addAssistantMessage, toast]);

  // Masquer le bouton pour les rôles non autorisés
  if (!role || !['admin', 'super_admin', 'president'].includes(role)) {
    return null;
  }

  return (
    <>
      {/* Bouton flottant mobile optimisé */}
      <div
        ref={buttonRef}
        className={`fixed z-50 ${className || ''}`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Button
          onClick={handleButtonClick}
          className={`
            w-14 h-14 rounded-full shadow-lg
            bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700
            hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800
            transition-all duration-300 ease-out
            ${isListening ? 'animate-pulse scale-110' : ''}
            ${isProcessing ? 'animate-spin' : ''}
            border-2 border-white/20
            backdrop-blur-sm
          `}
          size="icon"
        >
          {isListening ? (
            <MicOff className="h-6 w-6 text-white animate-pulse" />
          ) : isProcessing ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Sparkles className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Interface mobile optimisée */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
            {/* Header mobile */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">iAsted</h3>
                  <p className="text-xs text-white/80">Assistant IA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={mode === 'voice' ? 'default' : 'secondary'} className="text-xs">
                  {mode === 'voice' ? '🎙️ Vocal' : '📝 Texte'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages mobile */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg text-sm
                      ${msg.role === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()} • {msg.mode === 'voice' ? '🎙️' : '📝'}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">iAsted réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input mobile */}
            <div className="p-4 border-t">
              {mode === 'text' ? (
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  />
                  <Button
                    onClick={handleSendText}
                    disabled={!inputText.trim() || isProcessing}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => setMode('text')}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Basculer en mode texte
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
