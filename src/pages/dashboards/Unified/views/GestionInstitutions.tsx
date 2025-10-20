import React from 'react';
import { Building2, Eye, FileText, Mic, Search, UserPlus, X, Mail, Phone, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useProtocolEtat } from '@/hooks/useProtocolEtat';

export const GestionInstitutions: React.FC = () => {
  const { sousAdmins } = useProtocolEtat();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = React.useState<string>('all');

  const filteredAgents = sousAdmins.filter(admin => {
    const matchesSearch = searchQuery === '' || 
      admin.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.secteur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || admin.role === selectedRole;
    const matchesOrganization = selectedOrganization === 'all' || admin.organization === selectedOrganization;
    
    return matchesSearch && matchesRole && matchesOrganization && admin.role === 'agent';
  });

  const uniqueOrganizations = Array.from(new Set(sousAdmins.map(admin => admin.organization))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
            Gestion Institutions
          </h3>
          <p className="text-muted-foreground mt-1">
            Supervision des agents sectoriels et performance
          </p>
        </div>
        <Button className="bg-[hsl(var(--accent-intel))] hover:bg-[hsl(var(--accent-intel))]/90 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Nommer Agent
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, secteur, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect border-none"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les agents</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par organisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les organisations</SelectItem>
              {uniqueOrganizations.map(org => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} trouvé{filteredAgents.length > 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </span>
          {(searchQuery || selectedRole !== 'all' || selectedOrganization !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedOrganization('all');
              }}
              className="text-xs h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Effacer filtres
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((admin, idx) => (
          <Card key={idx} className="glass-effect border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{admin.nom}</h4>
                  <CardDescription>{admin.secteur}</CardDescription>
                </div>
                <Badge className={admin.statut === 'Actif' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>
                  {admin.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{admin.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Cas traités</div>
                  <div className="text-2xl font-bold">{admin.casTraites || admin.cas_traites}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Taux succès</div>
                  <div className="text-2xl font-bold text-green-600">{admin.taux || admin.taux_succes}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Délai moyen</div>
                  <div className="text-2xl font-bold text-blue-600">{admin.delai || admin.delai_moyen_jours}j</div>
                </div>
              </div>

              <Progress value={admin.taux || admin.taux_succes} className="h-2" />

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <Mic className="h-4 w-4 mr-1" />
                  iAsted
                </Button>
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <FileText className="h-4 w-4 mr-1" />
                  Rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="glass-effect border-none bg-gradient-to-br from-blue-500/10 to-transparent">
        <Building2 className="h-4 w-4 text-blue-600" />
        <AlertTitle>Coordination Nationale</AlertTitle>
        <AlertDescription>
          {sousAdmins.length} comptes actifs coordonnent les opérations sur l'ensemble du territoire national.
          Performance globale: {Math.round(sousAdmins.reduce((acc, a) => acc + (a.taux || a.taux_succes), 0) / sousAdmins.length)}%
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GestionInstitutions;

