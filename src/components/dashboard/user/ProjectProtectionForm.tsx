import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, Upload, Briefcase, MapPin, Navigation, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectProtectionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectProtectionForm = ({ onSuccess, onCancel }: ProjectProtectionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locationType, setLocationType] = useState<'manual' | 'gps'>('manual');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NDJOBI-App/1.0',
          },
        }
      );
      
      if (!response.ok) throw new Error('Erreur de géocodage');
      
      const data = await response.json();
      
      if (data.error) {
        return `Position GPS (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
      }
      
      const address = data.address;
      const parts = [];
      
      // Construire une adresse complète et précise
      if (address.house_number && (address.road || address.street)) {
        parts.push(`${address.house_number} ${address.road || address.street}`);
      } else if (address.road || address.street) {
        parts.push(address.road || address.street);
      }
      
      if (address.suburb || address.neighbourhood || address.quarter) {
        parts.push(address.suburb || address.neighbourhood || address.quarter);
      }
      
      if (address.postcode && (address.city || address.town || address.village)) {
        parts.push(`${address.postcode} ${address.city || address.town || address.village}`);
      } else if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      
      if (address.state && address.state !== (address.city || address.town)) {
        parts.push(address.state);
      }
      
      if (address.country) {
        parts.push(address.country);
      }
      
      return parts.length > 0 ? parts.join(', ') : data.display_name;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `Position GPS (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    }
  };

  const getGeolocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Géolocalisation non disponible',
        description: 'Votre navigateur ne supporte pas la géolocalisation',
      });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        toast({
          title: 'Position détectée',
          description: 'Récupération de l\'adresse...',
        });
        
        const address = await reverseGeocode(latitude, longitude);
        setValue('location', address);
        
        toast({
          title: 'Localisation réussie',
          description: 'L\'adresse a été détectée automatiquement',
        });
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur de localisation',
          description: 'Impossible de récupérer votre position. Vérifiez vos permissions.',
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const projectData: any = {
        ...data,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        status: 'protected',
      };

      // Ajouter les coordonnées GPS si disponibles
      if (coordinates) {
        projectData.gps_latitude = coordinates.lat;
        projectData.gps_longitude = coordinates.lng;
      }

      const { error } = await supabase
        .from('protected_projects')
        .insert(projectData);

      if (error) throw error;

      toast({
        title: 'Projet protégé !',
        description: 'Votre projet a été enregistré avec un horodatage infalsifiable.',
      });
      
      reset();
      setCoordinates(null);
      setLocationType('manual');
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
            <Label htmlFor="location">Lieu du projet (optionnel)</Label>
            <Tabs value={locationType} onValueChange={(value) => setLocationType(value as 'manual' | 'gps')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="gap-2">
                  <Keyboard className="h-4 w-4" />
                  Saisie manuelle
                </TabsTrigger>
                <TabsTrigger value="gps" className="gap-2">
                  <Navigation className="h-4 w-4" />
                  Géolocalisation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Ex: Libreville, Port-Gentil..."
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="gps" className="mt-3 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={getGeolocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Localisation en cours...
                    </>
                  ) : coordinates ? (
                    <>
                      <MapPin className="mr-2 h-4 w-4 text-green-500" />
                      Position enregistrée
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Détecter ma position
                    </>
                  )}
                </Button>
                
                {coordinates && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">Position détectée avec succès</p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Coordonnées GPS : {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          L'adresse a été automatiquement générée.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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