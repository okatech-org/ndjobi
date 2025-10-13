import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, Upload, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const projectSchema = z.object({
  title: z.string()
    .min(3, { message: 'Le titre doit contenir au moins 3 caractères' })
    .max(200, { message: 'Titre trop long' }),
  category: z.string().min(1, { message: 'Sélectionnez une catégorie' }),
  description: z.string()
    .min(20, { message: 'Description trop courte (minimum 20 caractères)' })
    .max(10000, { message: 'Description trop longue (maximum 10000 caractères)' }),
  innovation_level: z.string().min(1, { message: 'Sélectionnez un niveau d\'innovation' }),
  development_stage: z.string().min(1, { message: 'Sélectionnez un stade de développement' }),
  budget_estimate: z.string().optional(),
  timeline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectProtectionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectProtectionForm = ({ onSuccess, onCancel }: ProjectProtectionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('protected_projects')
        .insert({
          ...data,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          status: 'protected',
        });

      if (error) throw error;

      toast({
        title: 'Projet protégé !',
        description: 'Votre projet a été enregistré avec un horodatage infalsifiable.',
      });
      
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Une erreur est survenue',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Shield className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <CardTitle>Protéger un projet innovant</CardTitle>
            <CardDescription>Enregistrez votre idée avec un horodatage certifié</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="title"
                placeholder="Ex: Application mobile de gestion agricole"
                className="pl-10"
                {...register('title')}
              />
            </div>
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technologie / IT</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="sante">Santé</SelectItem>
                <SelectItem value="education">Éducation</SelectItem>
                <SelectItem value="energie">Énergie</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="social">Social / ONG</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre projet, son objectif, son innovation..."
              rows={6}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="innovation_level">Niveau d'innovation</Label>
              <Select onValueChange={(value) => setValue('innovation_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incremental">Incrémental</SelectItem>
                  <SelectItem value="substantiel">Substantiel</SelectItem>
                  <SelectItem value="disruptif">Disruptif</SelectItem>
                  <SelectItem value="radical">Radical</SelectItem>
                </SelectContent>
              </Select>
              {errors.innovation_level && (
                <p className="text-xs text-destructive">{errors.innovation_level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="development_stage">Stade de développement</Label>
              <Select onValueChange={(value) => setValue('development_stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idee">Idée</SelectItem>
                  <SelectItem value="conception">Conception</SelectItem>
                  <SelectItem value="prototype">Prototype</SelectItem>
                  <SelectItem value="test">Test/Pilote</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="commercialisation">Commercialisation</SelectItem>
                </SelectContent>
              </Select>
              {errors.development_stage && (
                <p className="text-xs text-destructive">{errors.development_stage.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_estimate">Budget estimé (optionnel)</Label>
              <Input
                id="budget_estimate"
                placeholder="Ex: 500 000 FCFA"
                {...register('budget_estimate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Délai de réalisation (optionnel)</Label>
              <Input
                id="timeline"
                placeholder="Ex: 6 mois"
                {...register('timeline')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Documents du projet (optionnel)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Business plan, maquettes, brevets, prototypes...
              </p>
              <Input
                id="files"
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
              />
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Protection garantie</p>
                  <p className="text-muted-foreground">
                    Votre projet sera protégé par horodatage blockchain et chiffrement AES-256.
                    Vous recevrez un certificat de protection avec l'empreinte unique de votre projet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Protection en cours...
                </>
              ) : (
                'Protéger mon projet'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};