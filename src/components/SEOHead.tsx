import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

export const SEOHead = ({
  title = 'Ndjobi - Plateforme de Bonne Gouvernance du Gabon',
  description = 'Plateforme citoyenne sécurisée pour promouvoir la bonne gouvernance et protéger vos innovations. Anonymat garanti, protection blockchain.',
  image = '/logo_ndjobi.png',
  url,
  type = 'website',
  keywords = ['corruption', 'gabon', 'anti-corruption', 'blockchain', 'protection', 'innovation', 'anonymat'],
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `https://ndjobi.com${location.pathname}`;
  const fullTitle = title.includes('Ndjobi') ? title : `${title} | Ndjobi`;

  useEffect(() => {
    document.title = fullTitle;

    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords.join(', ') },
      
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Ndjobi' },
      { property: 'og:locale', content: 'fr_GA' },
      
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Ndjobi' },
      
      { name: 'theme-color', content: '#2D5F1E' },
      { name: 'msapplication-TileColor', content: '#2D5F1E' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const attribute = name ? 'name' : 'property';
      const value = name || property;
      
      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value!);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    if (!canonicalLink.parentElement) {
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

  }, [fullTitle, description, image, currentUrl, type, keywords]);

  return null;
};

export const updatePageTitle = (title: string): void => {
  document.title = title.includes('Ndjobi') ? title : `${title} | Ndjobi`;
};

export const updatePageDescription = (description: string): void => {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
};

