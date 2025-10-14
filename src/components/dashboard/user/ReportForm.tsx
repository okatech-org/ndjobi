import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Upload, MapPin, Navigation, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [locationType, setLocationType] = useState<'manual' | 'gps'>('manual');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
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
        setDetectedAddress(address);
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

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const reportData: any = {
        title: `Signalement de ${data.type}`,
        user_id: isAnonymous ? null : user?.id,
        type: data.type,
        location: data.location,
        description: data.description,
        is_anonymous: isAnonymous,
        status: 'pending',
        submission_method: 'form',
        metadata: {
          witness_name: isAnonymous ? null : data.witness_name,
          witness_contact: isAnonymous ? null : data.witness_contact,
        },
      };

      // Ajouter les coordonnées GPS si disponibles
      if (coordinates) {
        reportData.gps_latitude = coordinates.lat;
        reportData.gps_longitude = coordinates.lng;
      }

      const { error } = await supabase
        .from('signalements')
        .insert(reportData);

      if (error) throw error;

      toast({
        title: 'Ndjobi tapé !',
        description: 'Votre dénonciation a été enregistrée et sera traitée sous 48h.',
      });
      
      reset();
      setCoordinates(null);
      setDetectedAddress(null);
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
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Taper le Ndjobi</CardTitle>
            <CardDescription>Votre dénonciation restera 100% confidentielle</CardDescription>
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
                    placeholder="Ex: Ministère, Mairie, Service public..."
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-destructive mt-1">{errors.location.message}</p>
                )}
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
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">Position détectée avec succès</p>
                        {detectedAddress && (
                          <p className="text-sm text-green-800 dark:text-green-200 mb-2 font-medium">
                            📍 {detectedAddress}
                          </p>
                        )}
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Coordonnées GPS : {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          L'adresse a été automatiquement générée. Les agents pourront voir la carte pour se rendre sur place.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  💡 La géolocalisation permet une localisation précise des faits. Vos coordonnées restent confidentielles.
                </p>
              </TabsContent>
            </Tabs>
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
                'Taper le Ndjobi'
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