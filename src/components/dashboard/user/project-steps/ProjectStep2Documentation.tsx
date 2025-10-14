import { FileUploader, UploadedFile } from '@/components/ui/file-uploader';
import { Shield, FileText } from 'lucide-react';

interface ProjectStep2DocumentationProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export const ProjectStep2Documentation = ({
  uploadedFiles,
  onFilesChange,
}: ProjectStep2DocumentationProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Documentation du projet</h2>
        <p className="text-muted-foreground">
          Ajoutez tous les documents qui prouvent l'originalité de votre projet
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Protection renforcée
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Tous vos documents sont chiffrés et horodatés. Chaque fichier reçoit une empreinte
              unique qui prouve son existence à cette date précise.
            </p>
          </div>
        </div>
      </div>

      <FileUploader
        accept="image/*,application/pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
        maxSize={50 * 1024 * 1024}
        maxFiles={20}
        multiple={true}
        onFilesChange={onFilesChange}
      />

      <div className="border rounded-lg p-4 bg-card">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Documents recommandés :</p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-4 list-disc">
              <li>Business plan ou pitch deck</li>
              <li>Maquettes, wireframes, designs</li>
              <li>Schémas techniques, architecture</li>
              <li>Code source (captures ou extraits)</li>
              <li>Brevets ou demandes de brevet</li>
              <li>Études de marché</li>
              <li>Preuves de concept, prototypes</li>
              <li>Témoignages, lettres de soutien</li>
              <li>Contrats, accords de confidentialité</li>
              <li>Tout document prouvant l'antériorité</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
        <p className="font-medium">Informations techniques :</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Types acceptés : Images, PDF, Word, PowerPoint, Excel, TXT</li>
          <li>Taille maximale : 50 MB par fichier</li>
          <li>Nombre maximum : 20 fichiers</li>
          <li>Les métadonnées sensibles sont automatiquement supprimées</li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground text-center">
          Les documents renforcent la protection de votre projet mais ne sont pas obligatoires.
          <br />
          Vous pouvez passer à l'étape suivante sans ajouter de fichiers.
        </p>
      </div>
    </div>
  );
};

