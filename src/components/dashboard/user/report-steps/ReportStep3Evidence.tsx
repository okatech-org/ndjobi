import { FileUploader, UploadedFile } from '@/components/ui/file-uploader';
import { VoiceRecorder, AudioRecording } from '@/components/ui/voice-recorder';
import { Shield, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportStep3EvidenceProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  audioRecordings: AudioRecording[];
  onRecordingComplete: (recording: AudioRecording) => void;
  onRecordingDelete: (recordingId: string) => void;
}

export const ReportStep3Evidence = ({
  uploadedFiles,
  onFilesChange,
  audioRecordings,
  onRecordingComplete,
  onRecordingDelete,
}: ReportStep3EvidenceProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Preuves et témoignages</h2>
        <p className="text-muted-foreground">
          Ajoutez des documents, photos ou enregistrements audio (optionnel)
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Sécurité maximale
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Tous vos fichiers sont chiffrés avant envoi. Les métadonnées (date, localisation
              des photos) sont automatiquement supprimées pour protéger votre anonymat.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({uploadedFiles.length})
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Audio ({audioRecordings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <div className="space-y-4">
            <FileUploader
              accept="image/*,application/pdf,.doc,.docx,.txt"
              maxSize={10 * 1024 * 1024}
              maxFiles={10}
              multiple={true}
              onFilesChange={onFilesChange}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Types de fichiers acceptés :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Images : JPG, PNG, WebP (max 10 MB par fichier)</li>
                <li>Documents : PDF, Word, TXT</li>
                <li>Captures d'écran, photos de documents, emails</li>
                <li>Maximum 10 fichiers au total</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <div className="space-y-4">
            <VoiceRecorder
              onRecordingComplete={onRecordingComplete}
              onRecordingDelete={onRecordingDelete}
              maxDuration={300}
              enableTranscription={true}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Enregistrement audio :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Durée maximale : 5 minutes par enregistrement</li>
                <li>Décrivez verbalement les faits</li>
                <li>Donnez des détails sur les circonstances</li>
                <li>Vous pouvez faire plusieurs enregistrements</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground text-center">
          Les preuves renforcent votre signalement mais ne sont pas obligatoires.
          <br />
          Vous pouvez passer à l'étape suivante sans ajouter de fichiers.
        </p>
      </div>
    </div>
  );
};

