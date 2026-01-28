import { SEOHead } from "@/components/SEOHead";
import Header from "@/components/Header";
import HeroWithVideo from "@/components/HeroWithVideo";
import CTACards from "@/components/CTACards";
import AnonymousReportForm from "@/components/AnonymousReportForm";
import ReportTracker from "@/components/ReportTracker";
import TrustSection from "@/components/TrustSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
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
        <AnonymousReportForm />
        <ReportTracker />
        <TrustSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
