import { useState, useEffect } from 'react';
import {
  Shield, Radio, AlertTriangle, Lock, Eye, Clock,
  FileText, CheckCircle, XCircle, Zap, Scale, AlertCircle,
  Search, ChevronDown, BookOpen, Gavel, Crown, Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProtocoleActivation {
  signalement_id: string;
  raison: string;
  autorisation_judiciaire: string;
  duree_heures: number;
  reference_legale: string;
  protection_temoins: boolean;
  preservation_preuves: boolean;
}

interface Signalement {
  id: string;
  reference_id?: string;
  titre: string;
  type: string;
  categorie: string;
  montant: string;
  location: string;
  status: string;
  urgence: string;
  priority: string;
  ai_priority_score: number;
  created_at: string;
}

// Données présélectionnées - Cas critiques Pêche GAB et autres
const CAS_CRITIQUES_PRESELECTIONNES: Signalement[] = [
  {
    id: 'mock-sig-2025-014',
    reference_id: 'SIG-2025-014',
    titre: 'Coopérative fantôme Gab Pêche - Détournement subventions',
    type: 'denonciation_corruption',
    categorie: 'malversation_gab_peche',
    montant: '5,00 Mrd FCFA',
    location: 'Libreville, Estuaire',
    status: 'pending',
    urgence: 'Critique',
    priority: 'critique',
    ai_priority_score: 99,
    created_at: '2025-01-10T16:23:41Z'
  },
  {
    id: 'mock-sig-2025-027',
    reference_id: 'SIG-2025-027',
    titre: 'Matériel de pêche Gab Pêche revendu en Guinée Équatoriale',
    type: 'denonciation_corruption',
    categorie: 'malversation_gab_peche',
    montant: '450 M FCFA',
    location: 'Libreville, Estuaire',
    status: 'pending',
    urgence: 'Haute',
    priority: 'critique',
    ai_priority_score: 83,
    created_at: '2025-01-06T09:23:51Z'
  },
  {
    id: 'mock-sig-2025-011',
    reference_id: 'SIG-2025-011',
    titre: 'Détournement budget santé - Achat ambulances fantômes',
    type: 'denonciation_corruption',
    categorie: 'detournement_fonds',
    montant: '1,20 Mrd FCFA',
    location: 'Franceville, Haut-Ogooué',
    status: 'pending',
    urgence: 'Critique',
    priority: 'critique',
    ai_priority_score: 98,
    created_at: '2025-01-11T18:32:14Z'
  },
  {
    id: 'mock-sig-2025-022',
    reference_id: 'SIG-2025-022',
    titre: 'Directeur CNSS - Villa 12 chambres et fleet de luxe',
    type: 'denonciation_corruption',
    categorie: 'enrichissement_illicite',
    montant: '6,70 Mrd FCFA',
    location: 'Libreville, Estuaire',
    status: 'pending',
    urgence: 'Critique',
    priority: 'critique',
    ai_priority_score: 92,
    created_at: '2025-01-07T21:45:19Z'
  }
];

// Lois et décrets présidentiels sélectionnables
const LOIS_ET_DECRETS = [
  {
    id: 'loi-2021-001',
    type: 'Loi',
    reference: 'Loi organique sur la lutte contre la corruption et l\'enrichissement illicite',
    numero: 'Loi N°2021/001',
    date: '2021',
    article: 'Art. 15-25',
    description: 'Protection des lanceurs d\'alerte et témoins'
  },
  {
    id: 'decret-2024-001',
    type: 'Décret',
    reference: 'Décret présidentiel sur le protocole XR-7',
    numero: 'Décret N°2024/001',
    date: '2024',
    article: 'Art. 1-10',
    description: 'Activation protocole d\'urgence judiciaire'
  },
  {
    id: 'ordonnance-2025-001',
    type: 'Ordonnance',
    reference: 'Ordonnance du Procureur de la République',
    numero: 'Ordonnance N°2025/PGR/001',
    date: '2025',
    article: 'Art. 142 Code Pénal',
    description: 'Autorisation activation XR-7 pour cas critiques'
  },
  {
    id: 'loi-2020-002',
    type: 'Loi',
    reference: 'Loi sur la transparence financière',
    numero: 'Loi N°2020/002',
    date: '2020',
    article: 'Art. 30-45',
    description: 'Audit et contrôle des fonds publics'
  },
  {
    id: 'decret-2023-003',
    type: 'Décret',
    reference: 'Décret sur la protection des témoins',
    numero: 'Décret N°2023/003',
    date: '2023',
    article: 'Art. 5-12',
    description: 'Mesures de protection renforcées'
  }
];

// Raisons d'activation préremplies
const RAISONS_PREEMPLIES = [
  {
    id: 'menaces-temoins',
    titre: 'Menaces avérées sur témoins clés',
    description: 'Témoins identifiés soumis à des pressions, intimidations ou menaces directes nécessitant une protection immédiate.',
    urgence: 'Critique',
    duree_recommandee: 48
  },
  {
    id: 'destruction-preuves',
    titre: 'Tentative de destruction de preuves',
    description: 'Risque imminent de destruction, altération ou dissimulation de preuves documentaires critiques.',
    urgence: 'Critique',
    duree_recommandee: 72
  },
  {
    id: 'reseau-organise',
    titre: 'Réseau de corruption organisé',
    description: 'Détection d\'un réseau structuré de corruption avec implications multiples nécessitant une intervention coordonnée.',
    urgence: 'Haute',
    duree_recommandee: 24
  },
  {
    id: 'detournement-majeur',
    titre: 'Détournement de fonds publics majeur',
    description: 'Détournement avéré de fonds publics supérieur à 1 milliard FCFA avec impact national.',
    urgence: 'Critique',
    duree_recommandee: 48
  },
  {
    id: 'implication-haut-fonctionnaire',
    titre: 'Implication de hauts fonctionnaires',
    description: 'Implication avérée de ministres, directeurs généraux ou hauts responsables dans des actes de corruption.',
    urgence: 'Critique',
    duree_recommandee: 72
  },
  {
    id: 'menace-securite-nationale',
    titre: 'Menace à la sécurité nationale',
    description: 'Corruption ayant des implications sur la sécurité nationale ou les intérêts stratégiques du Gabon.',
    urgence: 'Critique',
    duree_recommandee: 72
  }
];

export function ModuleXR7() {
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationForm, setActivationForm] = useState<Partial<ProtocoleActivation>>({
    duree_heures: 24,
    protection_temoins: true,
    preservation_preuves: true
  });
  
  // États pour la recherche intelligente
  const [signalements, setSignalements] = useState<Signalement[]>(CAS_CRITIQUES_PRESELECTIONNES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [showSignalementSearch, setShowSignalementSearch] = useState(false);
  const [showRaisonSearch, setShowRaisonSearch] = useState(false);
  const [showLegalSearch, setShowLegalSearch] = useState(false);
  const [selectedRaison, setSelectedRaison] = useState<any>(null);
  const [selectedLegal, setSelectedLegal] = useState<any>(null);
  
  const { toast } = useToast();

  // Filtrer les signalements selon la recherche
  const filteredSignalements = signalements.filter(sig => 
    sig.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sig.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sig.categorie.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sig.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction pour sélectionner un signalement
  const handleSelectSignalement = (signalement: Signalement) => {
    setSelectedSignalement(signalement);
    setActivationForm(prev => ({
      ...prev,
      signalement_id: signalement.id
    }));
    setShowSignalementSearch(false);
    setSearchQuery('');
  };

  // Fonction pour sélectionner une raison préremplie
  const handleSelectRaison = (raison: any) => {
    setSelectedRaison(raison);
    setActivationForm(prev => ({
      ...prev,
      raison: raison.description,
      duree_heures: raison.duree_recommandee
    }));
    setShowRaisonSearch(false);
  };

  // Fonction pour sélectionner une référence légale
  const handleSelectLegal = (legal: any) => {
    setSelectedLegal(legal);
    setActivationForm(prev => ({
      ...prev,
      autorisation_judiciaire: legal.numero,
      reference_legale: legal.article
    }));
    setShowLegalSearch(false);
  };

  const handleActiverProtocole = async () => {
    if (!activationForm.signalement_id || !activationForm.raison || !activationForm.autorisation_judiciaire) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    setIsActivating(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      // Store all activation data in signalement metadata
      const { error } = await supabase
        .from('signalements')
        .update({
          status: 'xr7_protocol_active',
          priority: 'critique',
          metadata: {
            xr7_activated: true,
            xr7_activation_date: new Date().toISOString(),
            xr7_reason: activationForm.raison,
            xr7_judicial_authorization: activationForm.autorisation_judiciaire,
            xr7_duration_hours: activationForm.duree_heures || 24,
            xr7_legal_reference: activationForm.reference_legale || 'Protocole XR-7 Emergency',
            xr7_start_date: new Date().toISOString(),
            xr7_end_date: new Date(Date.now() + (activationForm.duree_heures || 24) * 60 * 60 * 1000).toISOString(),
            xr7_activated_by: userData?.user?.id || '',
            xr7_protection_temoins: activationForm.protection_temoins,
            xr7_preservation_preuves: activationForm.preservation_preuves
          }
        })
        .eq('id', activationForm.signalement_id);

      if (error) throw error;

      toast({
        title: '🚨 Protocole XR-7 Activé',
        description: `Protection judiciaire activée pour ${activationForm.duree_heures}h`,
      });

      setShowActivationDialog(false);
      setActivationForm({
        duree_heures: 24,
        protection_temoins: true,
        preservation_preuves: true
      });

    } catch (error: any) {
      console.error('Erreur activation XR-7:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer le protocole XR-7',
        variant: 'destructive'
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-red-500 bg-red-50/50 dark:bg-red-950/20">
        <Radio className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900 dark:text-red-100">
          MODULE XR-7 - PROTOCOLE D'URGENCE JUDICIAIRE
        </AlertTitle>
        <AlertDescription className="text-red-800 dark:text-red-200">
          Ce module permet l'activation d'un protocole d'urgence pour la protection des témoins
          et la préservation des preuves dans les cas de corruption critiques nécessitant
          une intervention judiciaire immédiate.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Protection Témoins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activation immédiate de la protection des témoins clés et des lanceurs d'alerte
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Préservation Preuves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sécurisation et horodatage blockchain de toutes les preuves documentaires
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-600" />
              Autorisation Judiciaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Traçabilité complète avec référence légale et validation procureur
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conditions d'Activation XR-7</CardTitle>
          <CardDescription>
            Le protocole d'urgence ne peut être activé que si les conditions suivantes sont réunies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Cas de corruption avérée critique</div>
              <div className="text-sm text-muted-foreground">
                Montant ≥ 500M FCFA ou impact national majeur
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Autorisation judiciaire valide</div>
              <div className="text-sm text-muted-foreground">
                Ordonnance du Procureur de la République ou mandat présidentiel
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Risque imminent pour témoins ou preuves</div>
              <div className="text-sm text-muted-foreground">
                Menaces avérées ou tentatives de destruction de preuves
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Validation Protocole d'État</div>
              <div className="text-sm text-muted-foreground">
                Approbation présidentielle requise pour activation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/10 dark:bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cadre Légal et Responsabilités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Fondement légal :</strong> Loi organique sur la lutte contre la corruption
            et l'enrichissement illicite (Gabon, 2021)
          </p>
          <p>
            <strong>Durée maximale :</strong> 72 heures renouvelables sur autorisation judiciaire
          </p>
          <p>
            <strong>Audit :</strong> Toutes les activations sont enregistrées et auditées
            par le Conseil Constitutionnel
          </p>
          <p className="text-orange-800 dark:text-orange-200">
            ⚠️ <strong>Avertissement :</strong> L'activation abusive du protocole XR-7 constitue
            une faute grave passible de sanctions pénales selon l'article 142 du Code Pénal.
          </p>
        </CardContent>
      </Card>

      {/* Section des cas critiques présélectionnés */}
      <Card className="border-orange-200 bg-orange-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cas Critiques Éligibles au Protocole XR-7
          </CardTitle>
          <CardDescription>
            Signalements prioritaires nécessitant une activation immédiate du protocole d'urgence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAS_CRITIQUES_PRESELECTIONNES.map((cas) => (
              <Card key={cas.id} className="border-red-200 bg-red-50/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{cas.urgence}</Badge>
                      <Badge variant="outline">{cas.ai_priority_score}/100</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSignalement(cas);
                        setActivationForm(prev => ({
                          ...prev,
                          signalement_id: cas.id
                        }));
                        setShowActivationDialog(true);
                      }}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Activer XR-7
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{cas.titre}</div>
                    <div className="text-xs text-muted-foreground">
                      <div>Référence: {cas.reference_id}</div>
                      <div>Montant: {cas.montant}</div>
                      <div>Localisation: {cas.location}</div>
                      <div>Catégorie: {cas.categorie}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowActivationDialog(true)}
        >
          <Zap className="h-5 w-5 mr-2" />
          Activer Protocole XR-7
        </Button>
      </div>

      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-600" />
              Activation Protocole XR-7 - Urgence Judiciaire
            </DialogTitle>
            <DialogDescription>
              Veuillez renseigner les informations requises pour l'activation du protocole d'urgence
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
            {/* Recherche intelligente des signalements */}
            <div className="space-y-2">
              <Label>Signalement Concerné *</Label>
              <Popover open={showSignalementSearch} onOpenChange={setShowSignalementSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showSignalementSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedSignalement ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedSignalement.priority === 'critique' ? 'destructive' : 'secondary'}>
                          {selectedSignalement.urgence}
                        </Badge>
                        <span className="truncate">{selectedSignalement.titre}</span>
                      </div>
                    ) : (
                      "Rechercher un signalement..."
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Rechercher par titre, référence, catégorie..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun signalement trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredSignalements.map((signalement) => (
                          <CommandItem
                            key={signalement.id}
                            value={signalement.titre}
                            onSelect={() => handleSelectSignalement(signalement)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Badge variant={signalement.priority === 'critique' ? 'destructive' : 'secondary'}>
                                {signalement.urgence}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{signalement.titre}</div>
                                <div className="text-sm text-muted-foreground">
                                  {signalement.reference_id} • {signalement.montant} • {signalement.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{signalement.ai_priority_score}/100</div>
                                <div className="text-xs text-muted-foreground">Score IA</div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage du signalement sélectionné */}
              {selectedSignalement && (
                <Card className="mt-2 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-blue-900 break-words">{selectedSignalement.titre}</div>
                        <div className="text-sm text-blue-700 mt-1 space-y-1">
                          <div className="break-words">Référence: {selectedSignalement.reference_id}</div>
                          <div>Montant: {selectedSignalement.montant}</div>
                          <div className="break-words">Localisation: {selectedSignalement.location}</div>
                          <div>Score IA: {selectedSignalement.ai_priority_score}/100</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sélection de raison préremplie */}
            <div className="space-y-2">
              <Label>Raison de l'Activation *</Label>
              <Popover open={showRaisonSearch} onOpenChange={setShowRaisonSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showRaisonSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedRaison ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedRaison.urgence === 'Critique' ? 'destructive' : 'secondary'}>
                          {selectedRaison.urgence}
                        </Badge>
                        <span className="truncate">{selectedRaison.titre}</span>
                      </div>
                    ) : (
                      "Sélectionner une raison d'activation..."
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher une raison..." />
                    <CommandList>
                      <CommandEmpty>Aucune raison trouvée.</CommandEmpty>
                      <CommandGroup>
                        {RAISONS_PREEMPLIES.map((raison) => (
                          <CommandItem
                            key={raison.id}
                            value={raison.titre}
                            onSelect={() => handleSelectRaison(raison)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <Badge variant={raison.urgence === 'Critique' ? 'destructive' : 'secondary'}>
                                {raison.urgence}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{raison.titre}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {raison.description}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Durée recommandée: {raison.duree_recommandee}h
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage de la raison sélectionnée */}
              {selectedRaison && (
                <Card className="mt-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-green-900 break-words">{selectedRaison.titre}</div>
                        <div className="text-sm text-green-700 mt-1 break-words">
                          {selectedRaison.description}
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Durée recommandée: {selectedRaison.duree_recommandee} heures
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sélection de référence légale */}
            <div className="space-y-2">
              <Label>Autorisation Judiciaire *</Label>
              <Popover open={showLegalSearch} onOpenChange={setShowLegalSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showLegalSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedLegal ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {selectedLegal.type}
                        </Badge>
                        <span className="truncate">{selectedLegal.numero}</span>
                      </div>
                    ) : (
                      "Sélectionner une autorisation judiciaire..."
                    )}
                    <Gavel className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher une loi ou décret..." />
                    <CommandList>
                      <CommandEmpty>Aucune référence trouvée.</CommandEmpty>
                      <CommandGroup>
                        {LOIS_ET_DECRETS.map((legal) => (
                          <CommandItem
                            key={legal.id}
                            value={legal.reference}
                            onSelect={() => handleSelectLegal(legal)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className="flex items-center gap-2">
                                {legal.type === 'Loi' && <BookOpen className="h-4 w-4 text-blue-600" />}
                                {legal.type === 'Décret' && <Crown className="h-4 w-4 text-purple-600" />}
                                {legal.type === 'Ordonnance' && <Gavel className="h-4 w-4 text-red-600" />}
                                <Badge variant="outline">{legal.type}</Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{legal.numero}</div>
                                <div className="text-sm text-muted-foreground">
                                  {legal.reference}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {legal.article} • {legal.description}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage de la référence légale sélectionnée */}
              {selectedLegal && (
                <Card className="mt-2 border-purple-200 bg-purple-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {selectedLegal.type === 'Loi' && <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />}
                        {selectedLegal.type === 'Décret' && <Crown className="h-5 w-5 text-purple-600 mt-0.5" />}
                        {selectedLegal.type === 'Ordonnance' && <Gavel className="h-5 w-5 text-purple-600 mt-0.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-purple-900 break-words">{selectedLegal.numero}</div>
                        <div className="text-sm text-purple-700 mt-1 break-words">
                          {selectedLegal.reference}
                        </div>
                        <div className="text-xs text-purple-600 mt-2 break-words">
                          {selectedLegal.article} • {selectedLegal.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Durée de protection avec suggestion automatique */}
            <div className="space-y-2">
              <Label>Durée de Protection (heures)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="72"
                  value={activationForm.duree_heures || 24}
                  onChange={(e) => setActivationForm(prev => ({
                    ...prev,
                    duree_heures: parseInt(e.target.value)
                  }))}
                  className="flex-1"
                />
                {selectedRaison && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivationForm(prev => ({
                      ...prev,
                      duree_heures: selectedRaison.duree_recommandee
                    }))}
                  >
                    {selectedRaison.duree_recommandee}h
                  </Button>
                )}
              </div>
              {selectedRaison && (
                <p className="text-xs text-muted-foreground">
                  Durée recommandée pour cette raison: {selectedRaison.duree_recommandee} heures
                </p>
              )}
            </div>

            <Alert className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                L'activation du protocole XR-7 déclenchera immédiatement :
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Notification automatique du Procureur de la République</li>
                  <li>Protection renforcée des témoins identifiés</li>
                  <li>Horodatage blockchain de toutes les preuves</li>
                  <li>Audit trail complet pour traçabilité judiciaire</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowActivationDialog(false)}
              disabled={isActivating}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleActiverProtocole}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Confirmer Activation XR-7
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

