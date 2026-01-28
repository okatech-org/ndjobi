import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, List, Grid3X3, Eye } from 'lucide-react';

interface Signalement {
  id: string;
  title: string;
  location?: string;
  status: string;
  priority: string;
  type: string;
  reference_number?: string;
  created_at: string;
}

interface SignalementsMapViewProps {
  signalements: Signalement[];
  onSelectSignalement?: (signalement: Signalement) => void;
}

// Provinces du Gabon avec leurs coordonnées approximatives sur la carte SVG
const GABON_PROVINCES = [
  { name: 'Estuaire', x: 180, y: 180, keywords: ['libreville', 'estuaire', 'owendo', 'akanda'] },
  { name: 'Haut-Ogooué', x: 340, y: 280, keywords: ['franceville', 'haut-ogooué', 'moanda', 'mounana'] },
  { name: 'Moyen-Ogooué', x: 200, y: 220, keywords: ['lambaréné', 'moyen-ogooué', 'ndjolé'] },
  { name: 'Ngounié', x: 200, y: 300, keywords: ['mouila', 'ngounié', 'ndendé', 'fougamou'] },
  { name: 'Nyanga', x: 180, y: 380, keywords: ['tchibanga', 'nyanga', 'mayumba'] },
  { name: 'Ogooué-Ivindo', x: 300, y: 160, keywords: ['makokou', 'ogooué-ivindo', 'booué', 'mékambo'] },
  { name: 'Ogooué-Lolo', x: 280, y: 280, keywords: ['koulamoutou', 'ogooué-lolo', 'lastoursville'] },
  { name: 'Ogooué-Maritime', x: 140, y: 280, keywords: ['port-gentil', 'ogooué-maritime', 'gamba', 'omboué'] },
  { name: 'Woleu-Ntem', x: 260, y: 80, keywords: ['oyem', 'woleu-ntem', 'bitam', 'minvoul'] },
];

const SignalementsMapView = ({ signalements, onSelectSignalement }: SignalementsMapViewProps) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Grouper les signalements par province
  const signalementsByProvince = useMemo(() => {
    const grouped: Record<string, Signalement[]> = {};
    
    signalements.forEach(s => {
      const location = (s.location || '').toLowerCase();
      let matchedProvince = 'Non localisé';

      for (const province of GABON_PROVINCES) {
        if (province.keywords.some(kw => location.includes(kw))) {
          matchedProvince = province.name;
          break;
        }
      }

      if (!grouped[matchedProvince]) {
        grouped[matchedProvince] = [];
      }
      grouped[matchedProvince].push(s);
    });

    return grouped;
  }, [signalements]);

  // Statistiques par province pour la carte
  const provinceStats = useMemo(() => {
    return GABON_PROVINCES.map(p => ({
      ...p,
      count: signalementsByProvince[p.name]?.length || 0,
      pending: signalementsByProvince[p.name]?.filter(s => s.status === 'pending').length || 0,
    }));
  }, [signalementsByProvince]);

  const getProvinceColor = (count: number, pending: number) => {
    if (count === 0) return 'fill-muted stroke-border';
    if (pending > 3) return 'fill-red-500/30 stroke-red-500';
    if (pending > 0) return 'fill-orange-500/30 stroke-orange-500';
    return 'fill-green-500/30 stroke-green-500';
  };

  const filteredSignalements = selectedProvince
    ? signalementsByProvince[selectedProvince] || []
    : signalements;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Carte des Signalements
            </CardTitle>
            <CardDescription>
              Répartition géographique des signalements au Gabon
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Carte
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Carte SVG simplifiée du Gabon */}
            <div className="lg:col-span-2 relative bg-muted/30 rounded-lg p-4 min-h-[400px]">
              <svg viewBox="0 0 400 450" className="w-full h-full">
                {/* Fond de carte simplifié */}
                <path
                  d="M100,50 L300,30 L350,100 L380,200 L360,350 L300,420 L200,430 L120,380 L80,300 L100,200 L80,100 Z"
                  className="fill-muted/50 stroke-border stroke-2"
                />
                
                {/* Points des provinces */}
                {provinceStats.map((province) => (
                  <g
                    key={province.name}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedProvince(
                      selectedProvince === province.name ? null : province.name
                    )}
                  >
                    <circle
                      cx={province.x}
                      cy={province.y}
                      r={Math.max(15, Math.min(35, 15 + province.count * 3))}
                      className={`${getProvinceColor(province.count, province.pending)} 
                        ${selectedProvince === province.name ? 'stroke-2' : 'stroke-1'}
                        transition-all`}
                    />
                    <text
                      x={province.x}
                      y={province.y + 4}
                      textAnchor="middle"
                      className="fill-foreground text-xs font-bold pointer-events-none"
                    >
                      {province.count}
                    </text>
                    <text
                      x={province.x}
                      y={province.y + 45}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] pointer-events-none"
                    >
                      {province.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
                <p className="text-xs font-semibold mb-2">Légende</p>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500" />
                    <span>Urgents (&gt;3 en attente)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500" />
                    <span>En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500" />
                    <span>Sous contrôle</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des signalements filtrés */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">
                  {selectedProvince || 'Toutes les provinces'}
                </h4>
                {selectedProvince && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProvince(null)}
                  >
                    Effacer
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[320px]">
                <div className="space-y-2">
                  {filteredSignalements.slice(0, 10).map((s) => (
                    <div
                      key={s.id}
                      className="p-2 bg-background rounded border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => onSelectSignalement?.(s)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{s.reference_number || s.id.slice(0, 8)}</span>
                        <Badge
                          variant={s.status === 'pending' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-sm truncate mt-1">{s.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {s.location || 'Non localisé'}
                      </p>
                    </div>
                  ))}
                  {filteredSignalements.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun signalement dans cette zone
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          /* Vue Liste */
          <div className="space-y-2">
            {Object.entries(signalementsByProvince)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([province, items]) => (
                <div key={province} className="border rounded-lg overflow-hidden">
                  <div
                    className="p-3 bg-muted/50 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedProvince(
                      selectedProvince === province ? null : province
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{province}</span>
                    </div>
                    <Badge>{items.length} signalement(s)</Badge>
                  </div>
                  {selectedProvince === province && (
                    <div className="p-3 space-y-2 bg-background">
                      {items.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded border hover:bg-muted/50"
                        >
                          <div>
                            <span className="font-mono text-xs">{s.reference_number}</span>
                            <p className="text-sm">{s.title}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectSignalement?.(s)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignalementsMapView;
