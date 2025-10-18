import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'agent' | 'admin' | 'sub_admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface AuthUser extends User {
  role?: UserRole;
  profile?: UserProfile;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  color: string;
  displayPhone?: string; // Numéro de téléphone à afficher
}
