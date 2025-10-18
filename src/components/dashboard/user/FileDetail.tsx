import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Shield, 
  FileText, 
  Download, 
  AlertCircle, 
  FolderLock,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineEvent } from '@/components/ui/timeline';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FileDetailProps {
  fileId: string;
  fileType: 'report' | 'project';
  onBack: () => void;
}

interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  created_at: string;
  updated_at?: string;
  anonymous: boolean;
  gps_latitude?: number;
  gps_longitude?: number;
  evidence_files?: string[];
}

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'protected' | 'reviewed';
  created_at: string;
  updated_at?: string;
  location?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  blockchain_hash?: string;
  documents?: string[];
  innovation_level?: string;
  development_stage?: string;
  budget_estimate?: string;
  timeline?: string;
  team_size?: number;
  team_members?: string;
}

export const FileDetail = ({ fileId, fileType, onBack }: FileDetailProps) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchFileDetails();
  }, [fileId, fileType]);

  const fetchFileDetails = async () => {
    setLoading(true);
    try {
      if (fileType === 'report') {
        const { data, error } = await supabase
          .from('signalements')
          .select('*')
          .eq('id', fileId)
          .single();

        if (!error && data) {
          // Map is_anonymous to anonymous and ensure status type
          const mappedReport = {
            ...data,
            anonymous: data.is_anonymous ?? false,
            status: data.status || 'pending'
          } as Report;
          setReport(mappedReport);
          generateReportEvents(mappedReport);
        }
      } else {
        const { data, error } = await supabase
          .from('projets')
          .select('*')
          .eq('id', fileId)
          .single();

        if (!error && data) {
          // Ensure proper types
          const mappedProject = {
            ...data,
            status: (data.status === 'protected' || data.status === 'reviewed') ? data.status : 'protected'
          } as Project;
          setProject(mappedProject);
          generateProjectEvents(mappedProject);
        }
      }
    } catch (error) {
      console.error('Error fetching file details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportEvents = (report: Report) => {
    const events: TimelineEvent[] = [];

    events.push({
      id: `created-${report.id}`,
      title: 'Ndjobi tapé',
      description: `Signalement créé - ${getTypeLabel(report.type)}`,
      timestamp: new Date(report.created_at),
      icon: AlertCircle,
      status: 'success',
      metadata: {
        Type: getTypeLabel(report.type),
        Lieu: report.location,
      },
    });

    if (report.status === 'processing') {
      events.push({
        id: `processing-${report.id}`,
        title: 'Analyse en cours',
        description: 'Votre signalement est en cours de traitement par nos équipes',
        timestamp: new Date(report.updated_at || report.created_at),
        icon: Clock,
        status: 'info',
      });
    }

    if (report.status === 'resolved') {
      events.push({
        id: `resolved-${report.id}`,
        title: 'Cas résolu',
        description: 'Le signalement a été traité et résolu',
        timestamp: new Date(report.updated_at || report.created_at),
        icon: CheckCircle,
        status: 'success',
      });
    }

    if (report.status === 'closed') {
      events.push({
        id: `closed-${report.id}`,
        title: 'Dossier clôturé',
        description: 'Le signalement a été clôturé',
        timestamp: new Date(report.updated_at || report.created_at),
        icon: XCircle,
        status: 'warning',
      });
    }

    setEvents(events);
  };

  const generateProjectEvents = (project: Project) => {
    const events: TimelineEvent[] = [];

    events.push({
      id: `created-${project.id}`,
      title: 'Projet créé',
      description: 'Informations du projet enregistrées',
      timestamp: new Date(project.created_at),
      icon: FolderLock,
      status: 'info',
      metadata: {
        Catégorie: getCategoryLabel(project.category),
        Innovation: project.innovation_level ? getInnovationLabel(project.innovation_level) : undefined,
      },
    });

    events.push({
      id: `protected-${project.id}`,
      title: 'Protection blockchain',
      description: 'Projet protégé par horodatage blockchain',
      timestamp: new Date(project.created_at),
      icon: Shield,
      status: 'success',
      metadata: {
        'Hash': project.blockchain_hash?.substring(0, 16) + '...' || 'Généré',
      },
    });

    if (project.status === 'reviewed') {
      events.push({
        id: `reviewed-${project.id}`,
        title: 'Projet examiné',
        description: 'Le projet a été vérifié et validé',
        timestamp: new Date(project.updated_at || project.created_at),
        icon: CheckCircle,
        status: 'success',
      });
    }

    setEvents(events);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'extorsion': 'Extorsion',
      'detournement': 'Détournement de fonds',
      'pot-de-vin': 'Pot-de-vin',
      'abus-pouvoir': 'Abus de pouvoir',
      'nepotisme': 'Népotisme',
      'fraude': 'Fraude',
      'autre': 'Autre',
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'tech': 'Technologie / IT',
      'agriculture': 'Agriculture',
      'sante': 'Santé',
      'education': 'Éducation',
      'energie': 'Énergie',
      'transport': 'Transport',
      'finance': 'Finance',
      'commerce': 'Commerce',
      'social': 'Social / ONG',
      'autre': 'Autre',
    };
    return categories[category] || category;
  };

  const getInnovationLabel = (level: string) => {
    const levels: Record<string, string> = {
      'incremental': 'Incrémental',
      'substantiel': 'Substantiel',
      'disruptif': 'Disruptif',
      'radical': 'Radical',
    };
    return levels[level] || level;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'processing':
        return <Badge variant="default">En cours</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Résolu</Badge>;
      case 'closed':
        return <Badge variant="outline">Clôturé</Badge>;
      case 'protected':
        return <Badge className="bg-blue-500">Protégé</Badge>;
      case 'reviewed':
        return <Badge variant="outline">Examiné</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = () => {
    if (report) {
      const reportData = {
        type: getTypeLabel(report.type),
        location: report.location,
        description: report.description,
        status: report.status,
        created_at: new Date(report.created_at).toISOString(),
        anonymous: report.anonymous,
        report_id: report.id,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ndjobi-${report.id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (project) {
      const certificate = {
        title: project.title,
        category: getCategoryLabel(project.category),
        description: project.description,
        blockchain_hash: project.blockchain_hash,
        protected_at: new Date(project.created_at).toISOString(),
        certificate_id: project.id,
      };

      const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-${project.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const file = report || project;
  if (!file) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Dossier introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à mes dossiers
      </Button>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            {report ? getTypeLabel(report.type) : project?.title}
          </h1>
          <p className="text-muted-foreground">
            Référence : {file.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(file.status)}
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Type de corruption</h3>
                    <p className="text-base">{getTypeLabel(report.type)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lieu des faits</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-base">{report.location}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-base whitespace-pre-wrap">{report.description}</p>
                  </div>
                  {report.anonymous && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Dénonciation anonyme</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Votre identité reste 100% confidentielle.
                      </p>
                    </div>
                  )}
                </>
              )}

              {project && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Catégorie</h3>
                    <p className="text-base">{getCategoryLabel(project.category)}</p>
                  </div>
                  {project.location && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Localisation</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-base">{project.location}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-base whitespace-pre-wrap">{project.description}</p>
                  </div>
                  {project.innovation_level && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Niveau d'innovation</h3>
                      <p className="text-base">{getInnovationLabel(project.innovation_level)}</p>
                    </div>
                  )}
                  {project.blockchain_hash && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Hash Blockchain</h3>
                      <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {project.blockchain_hash}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique du dossier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={events} compact={false} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date de création</span>
                <span className="text-sm font-medium">
                  {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dernière mise à jour</span>
                <span className="text-sm font-medium">
                  {format(new Date(file.updated_at || file.created_at), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                {getStatusBadge(file.status)}
              </div>
            </CardContent>
          </Card>

          {report && report.evidence_files && report.evidence_files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preuves jointes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {report.evidence_files.length} fichier(s) attaché(s)
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Voir les preuves
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {project && project.documents && project.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {project.documents.length} document(s) protégé(s)
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Voir les documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Besoin d'aide ?</p>
                  <p className="text-xs text-muted-foreground">
                    Consultez notre guide ou contactez le support pour plus d'informations.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Contacter le support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

