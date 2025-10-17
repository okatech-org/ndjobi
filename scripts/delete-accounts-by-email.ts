#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deleteByEmails(emails: string[]) {
  console.log('🗑️ Suppression des comptes pour:', emails);

  // Récupérer les ids des users par email
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', emails);

  if (profileErr) {
    console.error('Erreur recherche profils:', profileErr.message);
    process.exit(1);
  }

  const userIds = (profiles || []).map(p => p.id);
  console.log('IDs trouvés:', userIds);

  // Nettoyer les tables dépendantes simples
  if (userIds.length > 0) {
    await supabase.from('user_roles').delete().in('user_id', userIds);
    await supabase.from('signalements').delete().in('user_id', userIds);
    await supabase.from('projets').delete().in('user_id', userIds);
    await supabase.from('profiles').delete().in('id', userIds);
  }

  // Supprimer dans auth (si accessible)
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const authUsers = (users || []).filter(u => emails.includes(u.email || ''));

  for (const u of authUsers) {
    try {
      await supabase.auth.admin.deleteUser(u.id);
      console.log('✅ Supprimé auth:', u.email);
    } catch (e: any) {
      console.warn('⚠️ Erreur suppression auth', u.email, e?.message);
    }
  }

  console.log('✅ Terminé');
}

async function main() {
  const emails = (process.argv.slice(2) || []).filter(Boolean);
  if (emails.length === 0) {
    console.log('Usage: delete-accounts-by-email.ts <email1> <email2> ...');
    process.exit(0);
  }
  await deleteByEmails(emails);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
