import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
  showMap?: boolean;
}

export const LocationMap = ({ latitude, longitude, address, showMap = true }: LocationMapProps) => {
  if (!latitude || !longitude) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Localisation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{address}</p>
          <Badge variant="outline" className="mt-2">Saisie manuelle</Badge>
        </CardContent>
      </Card>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  const wazeUrl = `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Localisation GPS</CardTitle>
        </div>
        <CardDescription>{address}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showMap && (
          <div className="rounded-lg overflow-hidden border">
            <iframe
              width="100%"
              height="300"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
              title="Carte de localisation"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Coordonnées précises :</p>
          <div className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Ouvrir dans une application de navigation :</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(googleMapsUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(openStreetMapUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              OpenStreetMap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(wazeUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Waze
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pour les agents :</strong> Utilisez ces coordonnées GPS pour vous rendre sur place. 
            La carte interactive vous permet de visualiser l'emplacement exact et de planifier votre itinéraire.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
