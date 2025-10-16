import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading || hasNavigated.current) return;
    if (!user) return; // ProtectedRoute gère la redirection vers /auth

    if (role) {
      hasNavigated.current = true;
      const target = role === 'super_admin' ? '/dashboard/super-admin'
        : role === 'admin' ? '/dashboard/admin'
        : role === 'agent' ? '/dashboard/agent'
        : '/dashboard/user';
      navigate(target, { replace: true });
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
