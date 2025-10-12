import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CTACards from "@/components/CTACards";
import TrustSection from "@/components/TrustSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CTACards />
        <TrustSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
