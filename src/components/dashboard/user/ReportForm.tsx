import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Upload, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const reportSchema = z.object({
  type: z.string().min(1, { message: 'Sélectionnez un type de signalement' }),
  location: z.string().min(3, { message: 'Veuillez indiquer le lieu' }),
  description: z.string()
    .min(10, { message: 'Description trop courte (minimum 10 caractères)' })
    .max(5000, { message: 'Description trop longue (maximum 5000 caractères)' }),
  witness_name: z.string().optional(),
  witness_contact: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReportForm = ({ onSuccess, onCancel }: ReportFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          ...data,
          anonymous: isAnonymous,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Signalement envoyé !',
        description: 'Votre signalement a été enregistré et sera traité sous 48h.',
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
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Signaler un cas de corruption</CardTitle>
            <CardDescription>Votre signalement restera 100% confidentiel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de corruption</Label>
            <Select onValueChange={(value) => setValue('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extorsion">Extorsion</SelectItem>
                <SelectItem value="detournement">Détournement de fonds</SelectItem>
                <SelectItem value="pot-de-vin">Pot-de-vin</SelectItem>
                <SelectItem value="abus-pouvoir">Abus de pouvoir</SelectItem>
                <SelectItem value="nepotisme">Népotisme</SelectItem>
                <SelectItem value="fraude">Fraude</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu des faits</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Ex: Ministère, Mairie, Service public..."
                className="pl-10"
                {...register('location')}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              placeholder="Décrivez les faits de manière précise..."
              rows={5}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Preuves (optionnel)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <Input
                id="files"
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>
          </div>

          {!isAnonymous && (
            <>
              <div className="space-y-2">
                <Label htmlFor="witness_name">Nom (optionnel)</Label>
                <Input
                  id="witness_name"
                  placeholder="Votre nom"
                  {...register('witness_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="witness_contact">Contact (optionnel)</Label>
                <Input
                  id="witness_contact"
                  placeholder="Téléphone ou email"
                  {...register('witness_contact')}
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="text-sm">
              Rester anonyme (recommandé)
            </Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le signalement'
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