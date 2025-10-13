import { useEffect, useState } from 'react';
import { FileText, Shield, Calendar, Eye, Download, AlertCircle, FolderLock, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LocationMap } from '@/components/dashboard/LocationMap';

interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  created_at: string;
  anonymous: boolean;
  gps_latitude?: number;
  gps_longitude?: number;
}

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'protected' | 'reviewed';
  timestamp: string;
  created_at: string;
  location?: string;
  gps_latitude?: number;
  gps_longitude?: number;
}

export const MyFiles = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Report | Project | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [reportsResult, projectsResult] = await Promise.all([
        supabase
          .from('signalements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (!reportsResult.error) {
        setReports(reportsResult.data || []);
      }
      if (!projectsResult.error) {
        setProjects(projectsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
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

  const handleShowMap = (item: Report | Project) => {
    setSelectedItem(item);
    setMapDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes dossiers</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {reports.length} signalements
          </Badge>
          <Badge variant="outline">
            <FolderLock className="h-3 w-3 mr-1" />
            {projects.length} projets
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
          <TabsTrigger value="projects">Projets protégés</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun signalement pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{getTypeLabel(report.type)}</CardTitle>
                        {getStatusBadge(report.status)}
                      </div>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {report.gps_latitude && report.gps_longitude && (
                        <Button size="sm" variant="outline" onClick={() => handleShowMap(report)}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Lieu :</strong> {report.location}
                      {report.gps_latitude && report.gps_longitude && (
                        <Badge variant="outline" className="ml-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS
                        </Badge>
                      )}
                    </p>
                  </div>
                  <p className="text-sm line-clamp-2">{report.description}</p>
                  {report.anonymous && (
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Anonyme
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderLock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun projet protégé pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Protégé {formatDistanceToNow(new Date(project.timestamp), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {project.gps_latitude && project.gps_longitude && (
                        <Button size="sm" variant="outline" onClick={() => handleShowMap(project)}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Catégorie :</strong> {getCategoryLabel(project.category)}
                  </p>
                  {project.location && (
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Lieu :</strong> {project.location}
                        {project.gps_latitude && project.gps_longitude && (
                          <Badge variant="outline" className="ml-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            GPS
                          </Badge>
                        )}
                      </p>
                    </div>
                  )}
                  <p className="text-sm line-clamp-3">{project.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    Protégé par blockchain • Certificat disponible
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Localisation sur la carte
            </DialogTitle>
            <DialogDescription>
              {selectedItem && 'type' in selectedItem 
                ? `Signalement : ${getTypeLabel(selectedItem.type)}`
                : selectedItem && 'title' in selectedItem
                ? `Projet : ${selectedItem.title}`
                : 'Détails de localisation'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <LocationMap
              latitude={selectedItem.gps_latitude}
              longitude={selectedItem.gps_longitude}
              address={'location' in selectedItem ? selectedItem.location : ''}
              showMap={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};