import { useState } from 'react';
import { FileText, AlertCircle, FolderLock, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - Replace with actual Supabase queries
const mockReports = [
  {
    id: '1',
    title: 'Demande de pot-de-vin au ministère',
    type: 'corruption',
    status: 'en_cours',
    date: '2025-10-10',
    tracking: 'RPT-2025-001',
  },
  {
    id: '2',
    title: 'Extorsion lors d\'une procédure administrative',
    type: 'extorsion',
    status: 'resolu',
    date: '2025-09-15',
    tracking: 'RPT-2025-002',
  },
];

const mockProjects = [
  {
    id: '1',
    title: 'Application mobile de gestion agricole',
    category: 'agriculture',
    status: 'protege',
    date: '2025-10-05',
    certificate: 'CERT-2025-ABC123',
  },
];

export const MyFiles = () => {
  const [selectedTab, setSelectedTab] = useState('reports');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En cours</Badge>;
      case 'resolu':
        return <Badge><CheckCircle className="h-3 w-3 mr-1" />Résolu</Badge>;
      case 'rejete':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      case 'protege':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Protégé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Mes dossiers</CardTitle>
            <CardDescription>
              Consultez vos signalements et projets protégés
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Signalements
              <Badge variant="secondary" className="ml-1">{mockReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderLock className="h-4 w-4" />
              Projets
              <Badge variant="secondary" className="ml-1">{mockProjects.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-6">
            {mockReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun signalement pour le moment</p>
              </div>
            ) : (
              mockReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          N° de suivi : <span className="font-mono">{report.tracking}</span>
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Déposé le {new Date(report.date).toLocaleDateString('fr-FR')}
                      </span>
                      <Button variant="outline" size="sm">
                        Voir les détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-6">
            {mockProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderLock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun projet protégé pour le moment</p>
              </div>
            ) : (
              mockProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow border-secondary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Certificat : <span className="font-mono">{project.certificate}</span>
                        </p>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Protégé le {new Date(project.date).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir le certificat
                        </Button>
                        <Button variant="secondary" size="sm">
                          Détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
