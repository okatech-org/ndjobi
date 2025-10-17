import { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, Loader2, Sparkles, TrendingUp, Users,
  Shield, AlertCircle, RefreshCw, Mic, FileText, Zap, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IAstedService, Message } from '@/services/iAstedService';
import { useToast } from '@/hooks/use-toast';
import { IAstedButton } from '@/components/ui/iAstedButton';

interface IAstedChatProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function IAstedChat({ isOpen = true, onClose }: IAstedChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Excellence, je suis iAsted, votre conseiller IA pour la lutte anticorruption. Comment puis-je vous assister aujourd\'hui ?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await IAstedService.sendMessage(input, messages);

      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error,
          variant: 'destructive'
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Je suis désolé Excellence, j'ai rencontré une erreur : ${result.error}`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de communiquer avec iAsted',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setInput(action);
    setTimeout(() => handleSend(), 100);
  };

  const quickActions = [
    { label: 'Résumé Quotidien', prompt: 'Donne-moi le résumé exécutif des dernières 24h', icon: FileText },
    { label: 'Patterns & Tendances', prompt: 'Identifie les patterns significatifs dans les signalements récents', icon: TrendingUp },
    { label: 'Prédiction Risques', prompt: 'Quelles sont les zones à risque élevé pour les 30 prochains jours ?', icon: AlertCircle },
    { label: 'Performance Sous-Admins', prompt: 'Évalue la performance des Sous-Administrateurs', icon: Users }
  ];

  if (!isOpen) return null;

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IAstedButton size="sm" onClick={() => {}} />
            <div>
              <CardTitle className="flex items-center gap-2">
                iAsted
                <Badge variant="default" className="text-xs bg-purple-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Présidentielle
                </Badge>
              </CardTitle>
              <CardDescription>
                Assistant Intelligent - Vision Gabon 2025
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([{
                role: 'assistant',
                content: 'Excellence, je suis prêt à vous assister. Que puis-je analyser pour vous ?',
                timestamp: new Date().toISOString()
              }])}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">Actions rapides :</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-semibold text-sm">iAsted</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.timestamp && (
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">iAsted analyse les données...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Posez votre question à iAsted..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            iAsted analyse les données en temps réel pour vous fournir des recommandations stratégiques
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

