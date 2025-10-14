import { CheckCircle, Copy, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReportStep5ConfirmationProps {
  reportId: string | null;
}

export const ReportStep5Confirmation = ({ reportId }: ReportStep5ConfirmationProps) => {
  const { toast } = useToast();

  const handleCopyId = () => {
    if (reportId) {
      navigator.clipboard.writeText(reportId);
      toast({
        title: 'Copié !',
        description: 'Le numéro de suivi a été copié dans le presse-papier',
      });
    }
  };

  const handleDownloadReceipt = () => {
    const receipt = {
      reportId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      message: 'Votre signalement a été enregistré avec succès',
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ndjobi-receipt-${reportId}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Reçu téléchargé',
      description: 'Conservez ce fichier comme preuve de votre signalement',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
            Ndjobi tapé !
          </h2>
          <p className="text-lg text-muted-foreground">
            Votre signalement a été enregistré avec succès
          </p>
        </div>
      </div>

      {reportId && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-center">Numéro de suivi</h3>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-center font-mono text-lg font-bold break-all">
                {reportId}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Conservez ce numéro pour suivre l'avancement de votre signalement
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCopyId}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le reçu
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            📋 Que se passe-t-il maintenant ?
          </h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Votre signalement est analysé par notre équipe (sous 48h)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Les autorités compétentes sont notifiées si nécessaire</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Vous recevez des mises à jour sur l'avancement</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>Une enquête est ouverte le cas échéant</span>
            </li>
          </ol>
        </div>

        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">
            🔒 Votre sécurité
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Toutes vos données sont chiffrées de bout en bout</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Votre anonymat est garanti à 100%</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Les métadonnées sensibles ont été supprimées</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Impossible de remonter jusqu'à vous</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📱 Suivi de votre dossier</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Vous pouvez consulter l'avancement de votre signalement à tout moment dans la section
            "Mes Dossiers" de votre tableau de bord.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir mes dossiers
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Merci de contribuer à la lutte contre la corruption au Gabon 🇬🇦</p>
        <p className="mt-1 font-semibold">Ensemble, construisons un pays plus juste !</p>
      </div>
    </div>
  );
};

