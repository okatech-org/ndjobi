import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stepper, StepperNavigation } from '@/components/ui/stepper';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProjectStep1Info } from './project-steps/ProjectStep1Info';
import { ProjectStep2Documentation } from './project-steps/ProjectStep2Documentation';
import { ProjectStep3Team } from './project-steps/ProjectStep3Team';
import { ProjectStep4Confirmation } from './project-steps/ProjectStep4Confirmation';
import { UploadedFile } from '@/components/ui/file-uploader';

const projectSchema = z.object({
  title: z.string()
    .min(3, { message: 'Le titre doit contenir au moins 3 caractères' })
    .max(200, { message: 'Titre trop long' }),
  category: z.string().min(1, { message: 'Sélectionnez une catégorie' }),
  location: z.string().optional(),
  description: z.string()
    .min(20, { message: 'Description trop courte (minimum 20 caractères)' })
    .max(10000, { message: 'Description trop longue (maximum 10000 caractères)' }),
  innovation_level: z.string().min(1, { message: 'Sélectionnez un niveau d\'innovation' }),
  development_stage: z.string().min(1, { message: 'Sélectionnez un stade de développement' }),
  budget_estimate: z.string().optional(),
  timeline: z.string().optional(),
  team_size: z.number().optional(),
  team_members: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormStepperProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  { id: 'info', label: 'Informations', description: 'Détails du projet' },
  { id: 'docs', label: 'Documentation', description: 'Fichiers et preuves' },
  { id: 'team', label: 'Équipe', description: 'Membres (optionnel)' },
  { id: 'confirm', label: 'Confirmation', description: 'Protection blockchain' },
];

export const ProjectFormStepper = ({ onSuccess, onCancel }: ProjectFormStepperProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [blockchainHash, setBlockchainHash] = useState<string | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      category: '',
      location: '',
      description: '',
      innovation_level: '',
      development_stage: '',
      budget_estimate: '',
      timeline: '',
      team_size: 0,
      team_members: '',
    },
  });

  const { watch, trigger } = form;
  const formData = watch();

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger([
          'title',
          'category',
          'description',
          'innovation_level',
          'development_stage',
        ]);
      case 1:
        return true;
      case 2:
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
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('ndjobi-project-progress', JSON.stringify(progress));
  };

  const clearProgressFromLocalStorage = () => {
    localStorage.removeItem('ndjobi-project-progress');
  };

  const uploadFilesToSupabase = async (projectId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const uploadedFile of uploadedFiles) {
      if (uploadedFile.status === 'success' || uploadedFile.status === 'idle') {
        try {
          const fileExt = uploadedFile.file.name.split('.').pop();
          const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('project-documents')
            .upload(fileName, uploadedFile.file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('project-documents')
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    }

    return uploadedUrls;
  };

  const generateBlockchainHash = async (projectData: Record<string, unknown>): Promise<string> => {
    const dataString = JSON.stringify(projectData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const tempProjectId = `project-${Date.now()}`;
      const fileUrls = await uploadFilesToSupabase(tempProjectId);

      const projectData = {
        user_id: user?.id,
        title: formData.title,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        innovation_level: formData.innovation_level,
        development_stage: formData.development_stage,
        budget_estimate: formData.budget_estimate,
        timeline: formData.timeline,
        team_size: formData.team_size,
        team_members: formData.team_members,
        documents: fileUrls,
        status: 'protected',
      };

      const hash = await generateBlockchainHash(projectData);
      setBlockchainHash(hash);

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            blockchain_hash: hash,
            protected_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProjectId(data.id);
      clearProgressFromLocalStorage();

      toast({
        title: 'Projet protégé !',
        description: 'Votre projet a été enregistré avec succès sur la blockchain.',
        variant: 'default',
      });

      setCurrentStep(steps.length - 1);

      setTimeout(() => {
        onSuccess?.();
      }, 5000);
    } catch (error) {
      console.error('Error submitting project:', error);
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
        return <ProjectStep1Info form={form} />;
      case 1:
        return (
          <ProjectStep2Documentation
            uploadedFiles={uploadedFiles}
            onFilesChange={setUploadedFiles}
          />
        );
      case 2:
        return <ProjectStep3Team form={form} />;
      case 3:
        return (
          <ProjectStep4Confirmation
            projectId={projectId}
            blockchainHash={blockchainHash}
            formData={formData}
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

        {currentStep < 3 && (
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
            submitLabel="Protéger mon projet"
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

