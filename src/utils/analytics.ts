declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function initAnalytics() {
  if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", import.meta.env.VITE_GA_ID);
  }
}

export function trackAIChatEvent(event: string, properties?: object) {
  if (window.gtag) {
    window.gtag("event", event, {
      event_category: "AI_Chat",
      ...properties,
    });
  }
  
  console.log(`[Analytics] ${event}`, properties);
}

export function trackPageView(page: string) {
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: page,
    });
  }
}

export function trackUserAction(action: string, category: string, label?: string) {
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
}

