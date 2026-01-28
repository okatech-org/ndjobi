import { useState } from "react";
import { Search, Clock, CheckCircle2, AlertCircle, FileSearch, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportStatus {
  reference_number: string;
  status: string;
  type: string;
  created_at: string;
  priority: string;
  resolved_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { 
    label: "En attente", 
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    icon: <Clock className="h-4 w-4" />
  },
  in_progress: { 
    label: "En cours", 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: <Loader2 className="h-4 w-4" />
  },
  investigating: { 
    label: "Sous investigation", 
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    icon: <FileSearch className="h-4 w-4" />
  },
  resolved: { 
    label: "Résolu", 
    color: "bg-green-500/10 text-green-600 border-green-500/30",
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  closed: { 
    label: "Clôturé", 
    color: "bg-muted text-muted-foreground border-muted",
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  rejected: { 
    label: "Rejeté", 
    color: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: <AlertCircle className="h-4 w-4" />
  },
};

const typeLabels: Record<string, string> = {
  corruption: "Corruption",
  detournement: "Détournement de fonds",
  extorsion: "Extorsion",
  abus_pouvoir: "Abus de pouvoir",
  favoritisme: "Favoritisme",
  fraude: "Fraude",
  autre: "Autre",
};

const ReportTracker = () => {
  const [referenceInput, setReferenceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedReference = referenceInput.trim().toUpperCase();
    
    if (!cleanedReference) {
      toast({
        title: "Référence requise",
        description: "Veuillez entrer un numéro de référence",
        variant: "destructive",
      });
      return;
    }

    // Validate format
    if (!/^NDJ-\d{4}-[A-Z0-9]{6}$/.test(cleanedReference)) {
      toast({
        title: "Format invalide",
        description: "Le format doit être NDJ-AAAA-XXXXXX",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setReportStatus(null);

    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('reference_number, status, type, created_at, priority, resolved_at')
        .eq('reference_number', cleanedReference)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setReportStatus(data as ReportStatus);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const reset = () => {
    setReportStatus(null);
    setNotFound(false);
    setReferenceInput("");
  };

  return (
    <section id="suivi-signalement" className="container py-12 md:py-16">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <Badge variant="outline" className="mb-2">
            <FileSearch className="h-3 w-3 mr-1" />
            Suivi anonyme
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Suivre mon signalement
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Consultez l'état d'avancement de votre signalement en toute confidentialité
          </p>
        </div>

        {/* Search Card */}
        <Card className="border-2 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary/70 shadow-lg">
                <Search className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Recherche par référence</CardTitle>
                <CardDescription>Entrez le numéro reçu lors de votre signalement</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {!reportStatus && !notFound ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="NDJ-2024-XXXXXX"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
                    className="font-mono text-center tracking-wider bg-background"
                    maxLength={17}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Format: NDJ-AAAA-XXXXXX (ex: NDJ-2024-A1B2C3)
                </p>
              </form>
            ) : notFound ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Signalement introuvable</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Aucun signalement ne correspond à la référence <span className="font-mono">{referenceInput}</span>
                  </p>
                </div>
                <Button variant="outline" onClick={reset}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nouvelle recherche
                </Button>
              </div>
            ) : reportStatus && (
              <div className="space-y-6">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">
                    {reportStatus.reference_number}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusInfo(reportStatus.status).color} flex items-center gap-1.5`}
                  >
                    {getStatusInfo(reportStatus.status).icon}
                    {getStatusInfo(reportStatus.status).label}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{typeLabels[reportStatus.type] || reportStatus.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Priorité</span>
                    <Badge variant="secondary" className="capitalize">
                      {reportStatus.priority === 'high' ? 'Haute' : 
                       reportStatus.priority === 'critical' ? 'Critique' :
                       reportStatus.priority === 'low' ? 'Basse' : 'Normale'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Date de signalement</span>
                    <span>{formatDate(reportStatus.created_at)}</span>
                  </div>
                  {reportStatus.resolved_at && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Date de résolution</span>
                      <span>{formatDate(reportStatus.resolved_at)}</span>
                    </div>
                  )}
                </div>

                {/* Timeline Hint */}
                <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                  Les signalements sont généralement traités dans un délai de 7 à 14 jours ouvrés.
                </div>

                {/* Back button */}
                <Button variant="outline" onClick={reset} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nouvelle recherche
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ReportTracker;
