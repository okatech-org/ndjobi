/**
 * Composant Chat iAsted pour Dashboard Admin
 * Interface complète avec vocal + texte pour l'assistant IA
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useIAstedVoice } from '@/hooks/iasted/useIAstedVoice';
import { IAstedConversationHistory } from '@/components/iasted';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, MicOff, Loader2, Bot, Brain, Zap, 
  AlertCircle, CheckCircle, Volume2, VolumeX 
} from 'lucide-react';

export interface IAstedChatProps {
  isOpen?: boolean;
}

export const IAstedChat = ({ isOpen = false }: IAstedChatProps) => {
  const { role } = useAuth();
  const { toast } = useToast();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token || '');
    });
  }, []);

  const {
    isConnected,
    isRecording,
    isProcessing,
    currentTranscript,
    conversationHistory,
    error,
    startSession,
    stopSession,
    toggleRecording,
  } = useIAstedVoice(token, {
    onError: (errorMsg) => {
      toast({
        title: '❌ Erreur iAsted',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  const handleStartSession = async () => {
    try {
      await startSession();
      setSessionStarted(true);
      toast({
        title: '✅ iAsted activé',
        description: 'Assistant vocal prêt à vous écouter',
      });
    } catch (err) {
      console.error('Erreur démarrage iAsted:', err);
    }
  };

  const handleStopSession = async () => {
    await stopSession();
    setSessionStarted(false);
    toast({
      title: '👋 iAsted désactivé',
      description: 'Session vocale terminée',
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête iAsted */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Assistant Vocal iAsted
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    Multi-LLM
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Agent conversationnel intelligent pour la plateforme Ndjobi
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isConnected && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
              )}
              {!isConnected && sessionStarted && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Connexion...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone de contrôle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panneau de contrôle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contrôles</CardTitle>
            <CardDescription>
              Gérez votre session vocale avec iAsted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!sessionStarted ? (
              <div className="text-center py-8">
                <Bot className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-70" />
                <h3 className="text-lg font-semibold mb-2">
                  Démarrer une session vocale
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  iAsted est prêt à vous assister dans vos tâches administratives
                </p>
                <Button 
                  onClick={handleStartSession} 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!token}
                >
                  <Zap className="mr-2" />
                  Activer iAsted
                </Button>
              </div>
            ) : (
              <>
                {/* Bouton microphone principal */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className={`w-40 h-40 rounded-full transition-all duration-300 shadow-2xl ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-110'
                        : isProcessing
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }`}
                    onClick={toggleRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-16 h-16 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-16 h-16" />
                    ) : (
                      <Mic className="w-16 h-16" />
                    )}
                  </Button>
                </div>

                {/* Statut */}
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold">
                    {isRecording
                      ? '🔴 Enregistrement en cours...'
                      : isProcessing
                      ? '⏳ Traitement de votre demande...'
                      : '✅ Prêt à vous écouter'}
                  </p>
                  {currentTranscript && (
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Transcription :</p>
                      <p className="italic">"{currentTranscript}"</p>
                    </div>
                  )}
                </div>

                {/* Contrôles additionnels */}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleStopSession}
                    variant="outline"
                    size="sm"
                  >
                    Terminer la session
                  </Button>
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant="ghost"
                    size="sm"
                  >
                    {isMuted ? (
                      <><VolumeX className="w-4 h-4 mr-2" /> Audio coupé</>
                    ) : (
                      <><Volume2 className="w-4 h-4 mr-2" /> Audio activé</>
                    )}
                  </Button>
                </div>

                {/* Info session */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rôle :</span>
                    <Badge variant="default" className="capitalize">{role}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Échanges :</span>
                    <span className="font-medium">{conversationHistory.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statut :</span>
                    <span className={isConnected ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {isConnected ? '● Connecté' : '○ Déconnecté'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Historique des conversations */}
        <div>
          <IAstedConversationHistory 
            history={conversationHistory}
            maxHeight="calc(100vh - 300px)"
          />
        </div>
      </div>

      {/* Informations et capacités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Capacités de iAsted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Reconnaissance Vocale</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Transcription temps réel optimisée pour le français gabonais (Deepgram Nova-3)
              </p>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Multi-LLM Router</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligence distribuée (Gemini Flash, GPT-4o-mini, Claude Haiku) avec optimisation coûts
              </p>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Synthèse Vocale</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Voix française naturelle avec Google Cloud TTS Neural2
              </p>
            </div>
          </div>

          <Alert className="mt-4 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <Brain className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm">
              <strong>Respect du RBAC :</strong> iAsted adapte automatiquement ses réponses et permissions selon votre rôle {' '}
              <Badge variant="outline" className="ml-1 capitalize">{role}</Badge>. 
              Toutes les conversations sont chiffrées et auditées selon les normes CNPDCP.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default IAstedChat;
