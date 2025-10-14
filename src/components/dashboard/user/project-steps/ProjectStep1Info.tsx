import { UseFormReturn } from 'react-hook-form';
import { Lightbulb, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFormData } from '../ProjectFormStepper';

interface ProjectStep1InfoProps {
  form: UseFormReturn<ProjectFormData>;
}

const categories = [
  { value: 'tech', label: 'Technologie / IT' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'sante', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'energie', label: 'Énergie' },
  { value: 'transport', label: 'Transport' },
  { value: 'finance', label: 'Finance' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'social', label: 'Social / ONG' },
  { value: 'autre', label: 'Autre' },
];

const innovationLevels = [
  { value: 'incremental', label: 'Incrémental - Amélioration existante' },
  { value: 'substantiel', label: 'Substantiel - Changement significatif' },
  { value: 'disruptif', label: 'Disruptif - Nouvelle approche' },
  { value: 'radical', label: 'Radical - Innovation de rupture' },
];

const developmentStages = [
  { value: 'idee', label: 'Idée - Concept initial' },
  { value: 'conception', label: 'Conception - Phase de design' },
  { value: 'prototype', label: 'Prototype - Version de test' },
  { value: 'test', label: 'Test/Pilote - Phase d\'expérimentation' },
  { value: 'production', label: 'Production - Développement actif' },
  { value: 'commercialisation', label: 'Commercialisation - Prêt au marché' },
];

export const ProjectStep1Info = ({ form }: ProjectStep1InfoProps) => {
  const { register, formState: { errors }, watch, setValue } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Informations du projet</h2>
        <p className="text-muted-foreground">
          Décrivez votre projet innovant à protéger
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Protection blockchain
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Votre projet sera horodaté et protégé par la blockchain. Vous recevrez un certificat
              de protection avec une empreinte unique et infalsifiable.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Titre du projet <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Ex: Application mobile de gestion agricole"
          className="text-base"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            Catégorie <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('category')}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localisation (optionnel)</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="Ex: Libreville, Gabon"
            className="text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description détaillée <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Décrivez votre projet : objectif, innovation, valeur ajoutée, public cible, modèle économique..."
          rows={8}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Minimum 20 caractères, maximum 10000
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {watch('description')?.length || 0} / 10000
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="innovation_level">
          Niveau d'innovation <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch('innovation_level')}
          onValueChange={(value) => setValue('innovation_level', value)}
        >
          <SelectTrigger id="innovation_level">
            <SelectValue placeholder="Sélectionnez un niveau" />
          </SelectTrigger>
          <SelectContent>
            {innovationLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.innovation_level && (
          <p className="text-sm text-red-500">{errors.innovation_level.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="development_stage">
          Stade de développement <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch('development_stage')}
          onValueChange={(value) => setValue('development_stage', value)}
        >
          <SelectTrigger id="development_stage">
            <SelectValue placeholder="Sélectionnez un stade" />
          </SelectTrigger>
          <SelectContent>
            {developmentStages.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.development_stage && (
          <p className="text-sm text-red-500">{errors.development_stage.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget_estimate">Budget estimé (optionnel)</Label>
          <Input
            id="budget_estimate"
            {...register('budget_estimate')}
            placeholder="Ex: 5 000 000 FCFA"
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Délai de réalisation (optionnel)</Label>
          <Input
            id="timeline"
            {...register('timeline')}
            placeholder="Ex: 12 mois"
            className="text-base"
          />
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Conseil
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Plus votre description est détaillée et précise, plus votre protection sera solide
              en cas de litige. N'hésitez pas à mentionner les aspects techniques, économiques
              et sociaux de votre projet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

