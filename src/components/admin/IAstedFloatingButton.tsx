/**
 * Bouton flottant iAsted pour accès rapide depuis n'importe quelle page
 * Utilise le bouton sphérique avec animations organiques 3D
 */

import { useState } from 'react';
import { Bot, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IAstedChat } from './IAstedChat';
import { IAstedButton } from '@/components/ui/iAstedButton';

export const IAstedFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton sphérique iAsted avec animations 3D */}
      <div className="fixed bottom-6 right-6 z-50">
        <IAstedButton 
          onClick={() => setIsOpen(true)}
          size="md"
        />
      </div>

      {/* Dialog avec iAsted Chat complet */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              Assistant Vocal iAsted
              <Badge variant="secondary" className="ml-auto">
                <Brain className="w-3 h-3 mr-1" />
                Intelligence Artificielle
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Votre assistant intelligent pour la plateforme Ndjobi - Optimisé pour le français gabonais
            </DialogDescription>
          </DialogHeader>
          
          <IAstedChat isOpen={isOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IAstedFloatingButton;
