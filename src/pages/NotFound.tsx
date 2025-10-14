import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import logoNdjobi from "@/assets/logo_ndjobi.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <img 
          src={logoNdjobi} 
          alt="Logo Ndjobi"
          className="h-24 w-24 mx-auto object-contain opacity-50" 
        />
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Page introuvable</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors inline-block">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
