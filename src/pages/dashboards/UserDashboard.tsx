import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, FileText, AlertCircle, FolderLock, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportFormStepper } from '@/components/dashboard/user/ReportFormStepper';
import { ProjectFormStepper } from '@/components/dashboard/user/ProjectFormStepper';
import { MyFiles } from '@/components/dashboard/user/MyFiles';
import { UserProfile } from '@/components/dashboard/user/UserProfile';
import { UserSettings } from '@/components/dashboard/user/UserSettings';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';

type ViewMode = 'profile' | 'report' | 'project' | 'files' | 'settings';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role, isLoading, profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('profile');

  // Lire la vue depuis les paramètres de l'URL
  useEffect(() => {
    const view = searchParams.get('view') as ViewMode;
    const action = searchParams.get('action');
    
    // Convertir l'action "protect" en vue "project"
    if (action === 'protect') {
      if (viewMode !== 'project') {
        setViewMode('project');
        setSearchParams({ view: 'project' });
      }
    } else if (view && ['report', 'project', 'files', 'settings'].includes(view)) {
      if (viewMode !== view) {
        setViewMode(view);
      }
    } else if (!view && !action) {
      if (viewMode !== 'profile') {
        setViewMode('profile');
      }
    }
  }, [searchParams, setSearchParams, viewMode]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Fonction pour changer de vue et mettre à jour l'URL
  const handleViewChange = (mode: ViewMode) => {
    if (viewMode === mode) return;
    setViewMode(mode);
    if (mode === 'profile') {
      setSearchParams({});
    } else {
      setSearchParams({ view: mode });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'report':
        return (
          <ReportFormStepper 
            onSuccess={() => handleViewChange('files')} 
            onCancel={() => handleViewChange('profile')}
          />
        );
      case 'project':
        return (
          <ProjectFormStepper 
            onSuccess={() => handleViewChange('files')} 
            onCancel={() => handleViewChange('profile')}
          />
        );
      case 'files':
        return <MyFiles />;
      case 'settings':
        return <UserSettings />;
      case 'profile':
      default:
        return (
          <>
            {/* Profile Component with Quick Actions */}
            <UserProfile onNavigate={handleViewChange} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="container py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Navigation - Desktop only */}
            <div className="hidden lg:block lg:col-span-3">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1 p-2">
                    <Button
                      variant={viewMode === 'profile' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleViewChange('profile')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon Profil
                    </Button>
                    <Button
                      variant={viewMode === 'report' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleViewChange('report')}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Taper le Ndjobi
                    </Button>
                    <Button
                      variant={viewMode === 'project' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleViewChange('project')}
                    >
                      <FolderLock className="h-4 w-4 mr-2" />
                      Protéger
                    </Button>
                    <Button
                      variant={viewMode === 'files' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleViewChange('files')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Mes Dossiers
                    </Button>
                    <Button
                      variant={viewMode === 'settings' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleViewChange('settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Button>
                  </nav>
                </CardContent>
              </Card>

            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {viewMode === 'profile' && 'Mon Profil'}
                    {viewMode === 'files' && 'Mes Dossiers'}
                    {viewMode === 'settings' && 'Paramètres'}
                    {viewMode === 'report' && 'Taper le Ndjobi'}
                    {viewMode === 'project' && 'Protéger un projet'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {profile?.full_name ? `Bienvenue ${profile.full_name}` : 'Bienvenue dans votre espace personnel sécurisé'}
                  </p>
                </div>

                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - visible sur toutes les tailles */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        items={[
          { mode: 'profile', icon: User, label: 'Profil' },
          { mode: 'report', icon: AlertCircle, label: 'Taper le Ndjobi' },
          { mode: 'project', icon: FolderLock, label: 'Protéger' },
          { mode: 'files', icon: FileText, label: 'Dossiers' },
          { mode: 'settings', icon: Settings, label: 'Paramètres' },
        ]}
        activeMode={viewMode}
        onModeChange={(mode) => handleViewChange(mode as ViewMode)}
      />
    </div>
  );
};

export default UserDashboard;
