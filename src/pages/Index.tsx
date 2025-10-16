import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import Header from "@/components/Header";
import HeroWithVideo from "@/components/HeroWithVideo";
import CTACards from "@/components/CTACards";
import TrustSection from "@/components/TrustSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher un petit loader pendant la redirection
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Ndjobi - Protégez vos projets, Combattez la corruption"
        description="Plateforme citoyenne sécurisée pour dénoncer la corruption de manière 100% anonyme et protéger vos innovations avec un horodatage blockchain infalsifiable."
        keywords={['corruption', 'gabon', 'anti-corruption', 'blockchain', 'protection innovation', 'anonymat garanti', 'dénoncer corruption']}
      />
      <Header />
      <main className="flex-1">
        <HeroWithVideo />
        <CTACards />
        <TrustSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
