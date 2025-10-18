/**
 * Composant bouton pour activer l'assistant vocal iAsted
 * Interface simple : clic pour parler, re-clic pour arrêter
 */

import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIAstedVoice } from '@/hooks/iasted/useIAstedVoice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface IAstedVoiceButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export const IAstedVoiceButton = ({
  size = 'md',
  variant = 'default',
  showLabel = true,
}: IAstedVoiceButtonProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  const token = session?.access_token || '';

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
        title: 'Erreur iAsted',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  const handleClick = async () => {
    if (!isInitialized) {
      try {
        await startSession();
        setIsInitialized(true);
        toast({
          title: 'iAsted activé',
          description: 'Assistant vocal prêt à vous écouter',
        });
      } catch (err) {
        console.error('Erreur démarrage iAsted:', err);
      }
    } else {
      await toggleRecording();
    }
  };

  const handleStop = async () => {
    await stopSession();
    setIsInitialized(false);
    toast({
      title: 'iAsted désactivé',
      description: 'Session vocale terminée',
    });
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-10 w-10';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-12 w-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 28;
      default:
        return 20;
    }
  };

  const renderIcon = () => {
    if (isProcessing) {
      return <Loader2 className="animate-spin" size={getIconSize()} />;
    }
    if (isRecording) {
      return <MicOff size={getIconSize()} />;
    }
    return <Mic size={getIconSize()} />;
  };

  const getButtonState = () => {
    if (isRecording) return 'recording';
    if (isProcessing) return 'processing';
    if (isConnected) return 'connected';
    return 'idle';
  };

  const buttonState = getButtonState();

  const stateColors = {
    idle: 'bg-primary hover:bg-primary/90',
    connected: 'bg-green-600 hover:bg-green-700',
    recording: 'bg-red-600 hover:bg-red-700 animate-pulse',
    processing: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              className={`${getButtonSize()} ${stateColors[buttonState]} transition-all`}
              onClick={handleClick}
              disabled={!token || isProcessing}
            >
              {renderIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {!isInitialized
                ? 'Activer iAsted'
                : isRecording
                ? 'Arrêter l\'enregistrement'
                : 'Commencer à parler'}
            </p>
          </TooltipContent>
        </Tooltip>

        {showLabel && (
          <div className="text-center">
            <p className="text-xs font-medium">
              {!isInitialized
                ? 'iAsted'
                : isRecording
                ? '🔴 Enregistrement...'
                : isProcessing
                ? '⏳ Traitement...'
                : '✅ Prêt'}
            </p>
            {currentTranscript && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                {currentTranscript}
              </p>
            )}
          </div>
        )}

        {isInitialized && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStop}
            className="text-xs"
          >
            Terminer
          </Button>
        )}

        {conversationHistory.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {conversationHistory.length} échange{conversationHistory.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
};

export default IAstedVoiceButton;

