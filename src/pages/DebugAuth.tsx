import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function DebugAuth() {
  const { user, role, profile, isLoading } = useAuth();
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          setSupabaseStatus(`❌ Error: ${error.message}`);
        } else {
          setSupabaseStatus('✅ Connected');
        }
      } catch (e: any) {
        setSupabaseStatus(`❌ Exception: ${e.message}`);
      }
    };
    checkSupabase();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🐛 Debug Auth</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Supabase Status</h2>
          <p>{supabaseStatus}</p>
          <p className="text-xs text-gray-500 mt-2">
            URL: {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Auth Hook Status</h2>
          <div className="space-y-1 text-sm">
            <p>isLoading: <span className={isLoading ? 'text-orange-600' : 'text-green-600'}>{isLoading ? '🔄 TRUE (LOADING...)' : '✅ FALSE'}</span></p>
            <p>user: {user ? `✅ ${user.email}` : '❌ null'}</p>
            <p>role: {role ? `✅ ${role}` : '❌ null'}</p>
            <p>profile: {profile?.full_name ? `✅ ${profile.full_name}` : '❌ null'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">User Object</h2>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Console Logs</h2>
          <p className="text-xs text-gray-600">Ouvrez la console (F12) pour voir les erreurs détaillées</p>
        </div>

        <a href="/" className="inline-block mt-4 text-blue-600 underline">← Retour</a>
      </div>
    </div>
  );
}

