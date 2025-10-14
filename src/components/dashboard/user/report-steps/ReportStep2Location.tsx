import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin, Navigation, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportFormData } from '../ReportFormStepper';

interface ReportStep2LocationProps {
  form: UseFormReturn<ReportFormData>;
}

export const ReportStep2Location = ({ form }: ReportStep2LocationProps) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const [locationType, setLocationType] = useState<'manual' | 'gps'>('manual');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

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

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setGettingLocation(true);
    setLocationDetected(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        const address = await reverseGeocode(latitude, longitude);
        setValue('location', address);
        
        setGettingLocation(false);
        setLocationDetected(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        
        let message = 'Impossible de détecter votre position';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Autorisation de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible';
            break;
          case error.TIMEOUT:
            message = 'Délai de géolocalisation dépassé';
            break;
        }
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Localisation</h2>
        <p className="text-muted-foreground">
          Indiquez le lieu où les faits se sont déroulés
        </p>
      </div>

      <Tabs value={locationType} onValueChange={(v) => setLocationType(v as 'manual' | 'gps')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Saisie manuelle
          </TabsTrigger>
          <TabsTrigger value="gps" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            GPS automatique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="location-manual">
              Lieu des faits <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location-manual"
              {...register('location')}
              placeholder="Ex: Ministère de la Santé, Libreville, Gabon"
              className="text-base"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Soyez le plus précis possible : bâtiment, rue, quartier, ville
            </p>
          </div>
        </TabsContent>

        <TabsContent value="gps" className="space-y-4 mt-6">
          <div className="border rounded-lg p-6 bg-card space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-3">
                {!locationDetected && !gettingLocation && (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Navigation className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Détecter ma position</p>
                      <p className="text-sm text-muted-foreground">
                        Utilisez votre localisation actuelle
                      </p>
                    </div>
                  </>
                )}

                {gettingLocation && (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Détection en cours...</p>
                      <p className="text-sm text-muted-foreground">
                        Veuillez patienter
                      </p>
                    </div>
                  </>
                )}

                {locationDetected && !gettingLocation && (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Position détectée !
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {watch('location')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDetectLocation}
              disabled={gettingLocation}
              className="w-full"
              size="lg"
            >
              {gettingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Détection...
                </>
              ) : locationDetected ? (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Détecter à nouveau
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Détecter ma position
                </>
              )}
            </Button>
          </div>

          {locationDetected && watch('latitude') && watch('longitude') && (
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Coordonnées GPS :</p>
              <p className="font-mono">
                {watch('latitude')?.toFixed(6)}, {watch('longitude')?.toFixed(6)}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Précision importante
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Plus le lieu est précis, plus l'enquête sera efficace. N'hésitez pas à mentionner
              le nom exact du bâtiment ou du service concerné.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

