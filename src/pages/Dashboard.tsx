import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (role) {
        // Redirect based on role
        switch (role) {
          case 'super_admin':
            navigate('/dashboard/super-admin', { replace: true });
            break;
          case 'admin':
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'agent':
            navigate('/dashboard/agent', { replace: true });
            break;
          case 'user':
            navigate('/dashboard/user', { replace: true });
            break;
          default:
            navigate('/auth');
        }
      }
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
