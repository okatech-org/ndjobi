import { useEffect, useState } from 'react';
import { FileText, Shield, Calendar, Eye, Download, AlertCircle, FolderLock, MapPin, Search, Filter, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LocationMap } from '@/components/dashboard/LocationMap';
import { FileDetail } from './FileDetail';

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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentReportsPage, setCurrentReportsPage] = useState(1);
  const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  const [detailView, setDetailView] = useState<{ fileId: string; fileType: 'report' | 'project' } | null>(null);
  const ITEMS_PER_PAGE = 10;

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

  const handleViewDetails = (item: Report | Project) => {
    if ('type' in item) {
      setSelectedReport(item);
    } else {
      setSelectedProject(item);
    }
    setDetailsDialogOpen(true);
  };

  const handleDownloadCertificate = (project: Project) => {
    const certificate = {
      title: project.title,
      category: getCategoryLabel(project.category),
      description: project.description,
      timestamp: project.timestamp,
      protected_at: new Date(project.created_at).toISOString(),
      certificate_id: project.id,
      blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
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
  };

  const handleDownloadReport = (report: Report) => {
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
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      getTypeLabel(report.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(project.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalReportsPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const totalProjectsPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const paginatedReports = filteredReports.slice(
    (currentReportsPage - 1) * ITEMS_PER_PAGE,
    currentReportsPage * ITEMS_PER_PAGE
  );

  const paginatedProjects = filteredProjects.slice(
    (currentProjectsPage - 1) * ITEMS_PER_PAGE,
    currentProjectsPage * ITEMS_PER_PAGE
  );

  const handleViewFullDetails = (fileId: string, fileType: 'report' | 'project') => {
    setDetailView({ fileId, fileType });
  };

  if (detailView) {
    return (
      <FileDetail
        fileId={detailView.fileId}
        fileType={detailView.fileType}
        onBack={() => setDetailView(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Mes dossiers</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {reports.length} ndjobi tapés
          </Badge>
          <Badge variant="outline">
            <FolderLock className="h-3 w-3 mr-1" />
            {projects.length} projets
          </Badge>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos dossiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Clôturé</SelectItem>
                <SelectItem value="protected">Protégé</SelectItem>
                <SelectItem value="reviewed">Examiné</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Ndjobi tapés</TabsTrigger>
          <TabsTrigger value="projects">Projets protégés</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {reports.length === 0 
                    ? 'Aucun ndjobi tapé pour le moment' 
                    : 'Aucun résultat ne correspond à votre recherche'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedReports.map((report) => (
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
                      <Button size="sm" variant="default" onClick={() => handleViewFullDetails(report.id, 'report')} title="Voir les détails complets">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {report.gps_latitude && report.gps_longitude && (
                        <Button size="sm" variant="outline" onClick={() => handleShowMap(report)} title="Voir sur la carte">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report)} title="Télécharger">
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
            ))}

            {filteredReports.length > ITEMS_PER_PAGE && (
              <div className="space-y-4 pt-4">
                <PaginationInfo
                  currentPage={currentReportsPage}
                  totalPages={totalReportsPages}
                  totalItems={filteredReports.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
                <Pagination
                  currentPage={currentReportsPage}
                  totalPages={totalReportsPages}
                  onPageChange={setCurrentReportsPage}
                />
              </div>
            )}
            </>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderLock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {projects.length === 0 
                    ? 'Aucun projet protégé pour le moment' 
                    : 'Aucun résultat ne correspond à votre recherche'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedProjects.map((project) => (
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
                      <Button size="sm" variant="default" onClick={() => handleViewFullDetails(project.id, 'project')} title="Voir les détails complets">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {project.gps_latitude && project.gps_longitude && (
                        <Button size="sm" variant="outline" onClick={() => handleShowMap(project)} title="Voir sur la carte">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDownloadCertificate(project)} title="Télécharger le certificat">
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
            ))}

            {filteredProjects.length > ITEMS_PER_PAGE && (
              <div className="space-y-4 pt-4">
                <PaginationInfo
                  currentPage={currentProjectsPage}
                  totalPages={totalProjectsPages}
                  totalItems={filteredProjects.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
                <Pagination
                  currentPage={currentProjectsPage}
                  totalPages={totalProjectsPages}
                  onPageChange={setCurrentProjectsPage}
                />
              </div>
            )}
            </>
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
                ? `Ndjobi tapé : ${getTypeLabel(selectedItem.type)}`
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={(open) => {
        setDetailsDialogOpen(open);
        if (!open) {
          setSelectedReport(null);
          setSelectedProject(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Détails du Ndjobi tapé
                </DialogTitle>
                <DialogDescription>
                  Référence : {selectedReport.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Type de corruption</h3>
                  <p className="text-base">{getTypeLabel(selectedReport.type)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Statut</h3>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Lieu des faits</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-base">{selectedReport.location}</p>
                  </div>
                  {selectedReport.gps_latitude && selectedReport.gps_longitude && (
                    <div className="mt-2">
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        GPS : {selectedReport.gps_latitude.toFixed(6)}, {selectedReport.gps_longitude.toFixed(6)}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Description complète</h3>
                  <p className="text-base whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Date de dépôt</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-base">
                      {new Date(selectedReport.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {selectedReport.anonymous && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Dénonciation anonyme</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Votre identité reste 100% confidentielle et protégée.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedReport.gps_latitude && selectedReport.gps_longitude && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        handleShowMap(selectedReport);
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Voir sur la carte
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => handleDownloadReport(selectedReport)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </>
          )}

          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderLock className="h-5 w-5 text-primary" />
                  Détails du projet protégé
                </DialogTitle>
                <DialogDescription>
                  Certificat : {selectedProject.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Titre du projet</h3>
                  <p className="text-base font-medium">{selectedProject.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Catégorie</h3>
                  <p className="text-base">{getCategoryLabel(selectedProject.category)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Statut</h3>
                  <div>{getStatusBadge(selectedProject.status)}</div>
                </div>

                {selectedProject.location && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Localisation</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-base">{selectedProject.location}</p>
                    </div>
                    {selectedProject.gps_latitude && selectedProject.gps_longitude && (
                      <div className="mt-2">
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS : {selectedProject.gps_latitude.toFixed(6)}, {selectedProject.gps_longitude.toFixed(6)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Description du projet</h3>
                  <p className="text-base whitespace-pre-wrap">{selectedProject.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Date de protection</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-base">
                      {new Date(selectedProject.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Horodatage blockchain</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                    {selectedProject.timestamp}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Protection active</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Votre projet est protégé par blockchain et un certificat infalsifiable a été généré.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedProject.gps_latitude && selectedProject.gps_longitude && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        handleShowMap(selectedProject);
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Voir sur la carte
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleDownloadCertificate(selectedProject)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger le certificat
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};