import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stepper, StepperNavigation } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReportStep1Details } from './report-steps/ReportStep1Details';
import { ReportStep2Location } from './report-steps/ReportStep2Location';
import { ReportStep3Evidence } from './report-steps/ReportStep3Evidence';
import { ReportStep4Review } from './report-steps/ReportStep4Review';
import { ReportStep5Confirmation } from './report-steps/ReportStep5Confirmation';
import { UploadedFile } from '@/components/ui/file-uploader';
import { AudioRecording } from '@/components/ui/voice-recorder';

const reportSchema = z.object({
  type: z.string().min(1, { message: 'Sélectionnez un type de signalement' }),
  description: z.string()
    .min(20, { message: 'Description trop courte (minimum 20 caractères)' })
    .max(5000, { message: 'Description trop longue (maximum 5000 caractères)' }),
  location: z.string().min(3, { message: 'Veuillez indiquer le lieu' }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  witness_name: z.string().optional(),
  witness_contact: z.string().optional(),
  is_anonymous: z.boolean().default(true),
});

export type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormStepperProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  { id: 'details', label: 'Détails', description: 'Type et description' },
  { id: 'location', label: 'Localisation', description: 'Lieu des faits' },
  { id: 'evidence', label: 'Preuves', description: 'Documents et audio' },
  { id: 'review', label: 'Révision', description: 'Vérifiez vos infos' },
  { id: 'confirm', label: 'Confirmation', description: 'Terminé' },
];

export const ReportFormStepper = ({ onSuccess, onCancel }: ReportFormStepperProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      is_anonymous: true,
      type: '',
      description: '',
      location: '',
      witness_name: '',
      witness_contact: '',
    },
  });

  const { watch, setValue, trigger } = form;
  const formData = watch();

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger(['type', 'description']);
      case 1:
        return await trigger(['location']);
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      saveProgressToLocalStorage();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const saveProgressToLocalStorage = () => {
    const progress = {
      formData,
      currentStep,
      uploadedFiles: uploadedFiles.map(f => ({
        id: f.id,
        name: f.file.name,
        size: f.file.size,
        type: f.file.type,
      })),
      audioRecordings: audioRecordings.map(a => ({
        id: a.id,
        duration: a.duration,
      })),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('ndjobi-report-progress', JSON.stringify(progress));
  };

  const clearProgressFromLocalStorage = () => {
    localStorage.removeItem('ndjobi-report-progress');
  };

  const uploadFilesToSupabase = async (reportId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const uploadedFile of uploadedFiles) {
      if (uploadedFile.status === 'success' || uploadedFile.status === 'idle') {
        try {
          const fileExt = uploadedFile.file.name.split('.').pop();
          const fileName = `${reportId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('report-evidence')
            .upload(fileName, uploadedFile.file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('report-evidence')
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    }

    return uploadedUrls;
  };

  const uploadAudioToSupabase = async (reportId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const recording of audioRecordings) {
      try {
        const fileName = `${reportId}/audio-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
        
        const { data, error } = await supabase.storage
          .from('report-evidence')
          .upload(fileName, recording.blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'audio/webm',
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('report-evidence')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading audio:', error);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const fileUrls = await uploadFilesToSupabase(reportId || `temp-${Date.now()}`);
      const audioUrls = await uploadAudioToSupabase(reportId || `temp-${Date.now()}`);

      const { data, error } = await supabase
        .from('signalements')
        .insert([
          {
            title: `Signalement de ${formData.type}`,
            user_id: formData.is_anonymous ? null : user?.id,
            type: formData.type,
            description: formData.description,
            location: formData.location,
            gps_latitude: formData.latitude,
            gps_longitude: formData.longitude,
            is_anonymous: formData.is_anonymous,
            attachments: [...fileUrls, ...audioUrls],
            status: 'pending',
            submission_method: 'form',
            metadata: {
              witness_name: formData.is_anonymous ? null : formData.witness_name,
              witness_contact: formData.is_anonymous ? null : formData.witness_contact,
            },
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setReportId(data.id);
      clearProgressFromLocalStorage();

      toast({
        title: 'Signalement enregistré !',
        description: 'Votre signalement a été enregistré avec succès.',
        variant: 'default',
      });

      setCurrentStep(steps.length - 1);

      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ReportStep1Details
            form={form}
          />
        );
      case 1:
        return (
          <ReportStep2Location
            form={form}
          />
        );
      case 2:
        return (
          <ReportStep3Evidence
            uploadedFiles={uploadedFiles}
            onFilesChange={setUploadedFiles}
            audioRecordings={audioRecordings}
            onRecordingComplete={(recording) => setAudioRecordings([...audioRecordings, recording])}
            onRecordingDelete={(id) => setAudioRecordings(audioRecordings.filter(r => r.id !== id))}
          />
        );
      case 3:
        return (
          <ReportStep4Review
            formData={formData}
            uploadedFiles={uploadedFiles}
            audioRecordings={audioRecordings}
          />
        );
      case 4:
        return (
          <ReportStep5Confirmation
            reportId={reportId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <Card className="p-6">
        {renderStep()}

        {currentStep < 4 && (
          <StepperNavigation
            currentStep={currentStep}
            totalSteps={steps.length - 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            canGoPrevious={currentStep > 0}
            previousLabel="Précédent"
            nextLabel="Suivant"
            submitLabel="Soumettre le signalement"
          />
        )}
      </Card>

      {onCancel && currentStep === 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};

