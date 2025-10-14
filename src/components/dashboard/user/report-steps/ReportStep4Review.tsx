import { CheckCircle, FileText, MapPin, AlertCircle, Shield } from 'lucide-react';
import { ReportFormData } from '../ReportFormStepper';
import { UploadedFile } from '@/components/ui/file-uploader';
import { AudioRecording } from '@/components/ui/voice-recorder';
import { Badge } from '@/components/ui/badge';
import { AIAnalysis } from '@/components/ui/ai-analysis';

interface ReportStep4ReviewProps {
  formData: ReportFormData;
  uploadedFiles: UploadedFile[];
  audioRecordings: AudioRecording[];
}

const corruptionTypesLabels: Record<string, string> = {
  'extorsion': 'Extorsion',
  'detournement': 'Détournement de fonds',
  'pot-de-vin': 'Pot-de-vin',
  'abus-pouvoir': 'Abus de pouvoir',
  'nepotisme': 'Népotisme',
  'fraude': 'Fraude',
  'autre': 'Autre',
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ReportStep4Review = ({
  formData,
  uploadedFiles,
  audioRecordings,
}: ReportStep4ReviewProps) => {
  const validFiles = uploadedFiles.filter(f => 
    f.status === 'success' || f.status === 'idle'
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Révision du signalement</h2>
        <p className="text-muted-foreground">
          Vérifiez les informations avant de soumettre
        </p>
      </div>

      <div className="space-y-4">
        {/* Anonymat */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Mode de signalement</h3>
                <Badge variant={formData.is_anonymous ? 'default' : 'secondary'}>
                  {formData.is_anonymous ? 'Anonyme' : 'Identifié'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_anonymous
                  ? 'Votre identité restera totalement confidentielle'
                  : 'Vos informations de contact seront visibles par les enquêteurs'}
              </p>
            </div>
          </div>
        </div>

        {/* Type et Description */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Type de corruption</h3>
                <p className="text-sm">
                  {corruptionTypesLabels[formData.type] || formData.type}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formData.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.description.length} caractères
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Localisation</h3>
              <p className="text-sm">{formData.location}</p>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-muted-foreground font-mono">
                  GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preuves */}
        {(validFiles.length > 0 || audioRecordings.length > 0) && (
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="font-semibold">Preuves jointes</h3>
                
                {validFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Documents ({validFiles.length})
                    </p>
                    <div className="space-y-1.5">
                      {validFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2"
                        >
                          <span className="truncate flex-1">
                            {file.file.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatFileSize(file.file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {audioRecordings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Enregistrements audio ({audioRecordings.length})
                    </p>
                    <div className="space-y-1.5">
                      {audioRecordings.map((recording) => (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2"
                        >
                          <span>Enregistrement audio</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(recording.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact (si non anonyme) */}
        {!formData.is_anonymous && (formData.witness_name || formData.witness_contact) && (
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Informations de contact</h3>
                {formData.witness_name && (
                  <p className="text-sm">
                    <span className="font-medium">Nom :</span> {formData.witness_name}
                  </p>
                )}
                {formData.witness_contact && (
                  <p className="text-sm">
                    <span className="font-medium">Contact :</span> {formData.witness_contact}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Prêt à soumettre
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              En cliquant sur "Soumettre", votre signalement sera chiffré et transmis de manière
              sécurisée. Vous recevrez un numéro de suivi unique pour consulter l'avancement.
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis (optional) */}
      <AIAnalysis
        type="report"
        data={{
          type: formData.type,
          description: formData.description,
          location: formData.location,
        }}
      />
    </div>
  );
};

