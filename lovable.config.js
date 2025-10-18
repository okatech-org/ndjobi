export default {
  // Configuration de déploiement Lovable
  build: {
    command: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install --legacy-peer-deps'
  },
  
  // Configuration des domaines
  domains: [
    'https://ndjobi.com',
    'https://ndjobi.lovable.app'
  ],
  
  // Variables d'environnement pour la production
  environment: {
    NODE_ENV: 'production',
    VITE_APP_ENV: 'production',
    VITE_APP_URL: 'https://ndjobi.com',
    VITE_SUPABASE_URL: 'https://xfxqwlbqysiezqdpeqpv.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k',
    VITE_SUPER_ADMIN_CODE: '999999',
    VITE_SUPER_ADMIN_EMAIL: 'superadmin@ndjobi.com',
    VITE_SUPER_ADMIN_PASSWORD: 'ChangeMeStrong!123',
    VITE_ENABLE_SUPER_ADMIN_DEMO: 'true'
  }
  
  // Configuration des redirections
  redirects: [
    {
      from: '/*',
      to: '/index.html',
      status: 200
    }
  ],
  
  // Headers de sécurité
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://xfxqwlbqysiezqdpeqpv.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://xfxqwlbqysiezqdpeqpv.supabase.co https://api.openai.com https://nominatim.openstreetmap.org;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), microphone=(self), camera=(self)'
  },
  
  // Configuration PWA
  pwa: {
    enabled: true,
    cacheFirst: true
  }
};
