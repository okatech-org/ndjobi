/**
 * Composant d'affichage de l'historique des conversations avec iAsted
 * Affiche les échanges vocaux avec transcriptions et réponses
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { VoiceConversationTurn } from '@/hooks/iasted/useIAstedVoice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface IAstedConversationHistoryProps {
  history: VoiceConversationTurn[];
  maxHeight?: string;
}

export const IAstedConversationHistory = ({
  history,
  maxHeight = '500px',
}: IAstedConversationHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucune conversation pour le moment</p>
        <p className="text-sm mt-2">Cliquez sur le micro pour commencer à parler avec iAsted</p>
      </Card>
    );
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gemini-flash':
        return 'text-blue-600';
      case 'gpt-4o-mini':
        return 'text-green-600';
      case 'claude-haiku':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'gemini-flash':
        return 'Gemini';
      case 'gpt-4o-mini':
        return 'GPT-4o';
      case 'claude-haiku':
        return 'Claude';
      default:
        return provider;
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historique de conversation</h3>
        <span className="text-sm text-muted-foreground">
          {history.length} échange{history.length > 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-4">
          {history.map((turn) => (
            <div key={turn.id} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </Avatar>
                <div className="flex-1">
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-sm">{turn.userTranscript}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(turn.timestamp, 'HH:mm:ss', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 ml-6">
                <Avatar className="h-8 w-8 bg-secondary">
                  <Bot className="h-5 w-5" />
                </Avatar>
                <div className="flex-1">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm">{turn.assistantResponse}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(turn.timestamp, 'HH:mm:ss', { locale: fr })}
                    </p>
                    <span className="text-xs">•</span>
                    <span className={`text-xs font-medium ${getProviderColor(turn.provider)}`}>
                      {getProviderLabel(turn.provider)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default IAstedConversationHistory;

