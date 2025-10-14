import { UseFormReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ReportFormData } from '../ReportFormStepper';

interface ReportStep1DetailsProps {
  form: UseFormReturn<ReportFormData>;
}

const corruptionTypes = [
  { value: 'extorsion', label: 'Extorsion' },
  { value: 'detournement', label: 'Détournement de fonds' },
  { value: 'pot-de-vin', label: 'Pot-de-vin' },
  { value: 'abus-pouvoir', label: 'Abus de pouvoir' },
  { value: 'nepotisme', label: 'Népotisme' },
  { value: 'fraude', label: 'Fraude' },
  { value: 'autre', label: 'Autre' },
];

export const ReportStep1Details = ({ form }: ReportStep1DetailsProps) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const isAnonymous = watch('is_anonymous');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Détails du signalement</h2>
        <p className="text-muted-foreground">
          Décrivez les faits de corruption que vous souhaitez signaler
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Confidentialité garantie
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Votre signalement est chiffré de bout en bout. Personne ne pourra remonter jusqu'à vous
              si vous choisissez de rester anonyme.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <Label htmlFor="is_anonymous" className="text-base font-medium">
            Mode anonyme
          </Label>
          <p className="text-sm text-muted-foreground">
            Votre identité restera totalement confidentielle
          </p>
        </div>
        <Switch
          id="is_anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setValue('is_anonymous', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">
          Type de corruption <span className="text-red-500">*</span>
        </Label>
        <Select
          value={watch('type')}
          onValueChange={(value) => setValue('type', value)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            {corruptionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description détaillée <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Décrivez les faits de manière précise : Qui ? Quoi ? Quand ? Comment ? Montant (si applicable)..."
          rows={8}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Minimum 20 caractères, maximum 5000
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {watch('description')?.length || 0} / 5000
          </p>
        </div>
      </div>

      {!isAnonymous && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <p className="text-sm font-medium">Informations de contact (optionnel)</p>
          
          <div className="space-y-2">
            <Label htmlFor="witness_name">Votre nom</Label>
            <Input
              id="witness_name"
              {...register('witness_name')}
              placeholder="Nom complet"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="witness_contact">Téléphone ou email</Label>
            <Input
              id="witness_contact"
              {...register('witness_contact')}
              placeholder="Pour un éventuel suivi"
            />
          </div>
        </div>
      )}
    </div>
  );
};

