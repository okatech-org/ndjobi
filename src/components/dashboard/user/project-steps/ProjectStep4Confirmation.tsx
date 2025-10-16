import { CheckCircle, Shield, Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ProjectFormData } from '../ProjectFormStepper';
import { Badge } from '@/components/ui/badge';

interface ProjectStep4ConfirmationProps {
  projectId: string | null;
  blockchainHash: string | null;
  formData: ProjectFormData;
}

const categoryLabels: Record<string, string> = {
  tech: 'Technologie / IT',
  agriculture: 'Agriculture',
  sante: 'Santé',
  education: 'Éducation',
  energie: 'Énergie',
  transport: 'Transport',
  finance: 'Finance',
  commerce: 'Commerce',
  social: 'Social / ONG',
  autre: 'Autre',
};

const innovationLabels: Record<string, string> = {
  incremental: 'Incrémental',
  substantiel: 'Substantiel',
  disruptif: 'Disruptif',
  radical: 'Radical',
};

const stageLabels: Record<string, string> = {
  idee: 'Idée',
  conception: 'Conception',
  prototype: 'Prototype',
  test: 'Test/Pilote',
  production: 'Production',
  commercialisation: 'Commercialisation',
};

export const ProjectStep4Confirmation = ({
  projectId,
  blockchainHash,
  formData,
}: ProjectStep4ConfirmationProps) => {
  const { toast } = useToast();

  const handleCopyHash = () => {
    if (blockchainHash) {
      navigator.clipboard.writeText(blockchainHash);
      toast({
        title: 'Copié !',
        description: 'L\'empreinte blockchain a été copiée',
      });
    }
  };

  const handleDownloadCertificate = () => {
    const certificate = {
      projectId,
      title: formData.title,
      category: formData.category,
      blockchainHash,
      protectedAt: new Date().toISOString(),
      owner: 'Protégé anonymement',
      status: 'protected',
    };

    const certificateText = `
╔════════════════════════════════════════════════════════════════╗
║              CERTIFICAT DE PROTECTION NDJOBI                   ║
╚════════════════════════════════════════════════════════════════╝

Projet : ${formData.title}
Catégorie : ${categoryLabels[formData.category]}
Date de protection : ${new Date().toLocaleString('fr-FR')}

────────────────────────────────────────────────────────────────

EMPREINTE BLOCKCHAIN (SHA-256)
${blockchainHash}

────────────────────────────────────────────────────────────────

Ce certificat atteste que le projet ci-dessus a été enregistré
et horodaté de manière infalsifiable sur la blockchain Ndjobi.

L'empreinte cryptographique unique garantit l'authenticité et
l'antériorité de votre projet.

Pour vérifier ce certificat :
https://ndjobi.com/verify/${blockchainHash}

────────────────────────────────────────────────────────────────

Ndjobi - Protégez vos innovations, Combattez la corruption
© ${new Date().getFullYear()} - Tous droits réservés
`;

    const blob = new Blob([certificateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificat-ndjobi-${projectId}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    const jsonBlob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `certificat-ndjobi-${projectId}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);

    toast({
      title: 'Certificat téléchargé',
      description: 'Conservez ces fichiers précieusement comme preuve de protection',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <Shield className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
            🎉 Projet protégé !
          </h2>
          <p className="text-lg text-muted-foreground">
            Votre projet a été enregistré sur la blockchain
          </p>
        </div>
      </div>

      {projectId && blockchainHash && (
        <div className="space-y-4">
          <div className="border rounded-lg p-6 bg-card space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-center">Certificat de protection</h3>
              
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Projet</p>
                  <p className="font-semibold">{formData.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Catégorie</p>
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[formData.category]}
                    </Badge>
                  </div>
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Innovation</p>
                    <Badge variant="secondary" className="text-xs">
                      {innovationLabels[formData.innovation_level]}
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Empreinte Blockchain</p>
                  <p className="font-mono text-xs break-all">
                    {blockchainHash}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Date de protection</p>
                  <p className="text-sm">{new Date().toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCopyHash}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier l'empreinte
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleDownloadCertificate}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <h3 className="font-semibold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Votre projet est maintenant protégé
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Horodatage blockchain infalsifiable</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Empreinte cryptographique unique (SHA-256)</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Preuve d'antériorité certifiée</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Tous vos documents sont chiffrés et sécurisés</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            📋 Prochaines étapes
          </h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Téléchargez et conservez votre certificat précieusement</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Consultez votre projet dans "Mes Dossiers"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Partagez l'empreinte blockchain avec vos partenaires</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>En cas de litige, votre certificat fait foi</span>
            </li>
          </ol>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">🔐 Vérification</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Toute personne peut vérifier l'authenticité de votre protection en utilisant
            l'empreinte blockchain.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => window.open(`https://ndjobi.com/verify/${blockchainHash}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Vérifier sur la blockchain
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>Félicitations pour votre innovation ! 🚀</p>
        <p className="mt-1 font-semibold">Continuez à créer, Ndjobi protège vos idées</p>
      </div>
    </div>
  );
};

