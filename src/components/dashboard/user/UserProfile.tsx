import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Shield, Edit, AlertCircle, FolderLock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'profile' | 'report' | 'project' | 'files' | 'settings';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Email invalide' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, { message: 'Bio trop longue (max 500 caractères)' }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileProps {
  onNavigate?: (mode: ViewMode) => void;
}

export const UserProfile = ({ onNavigate }: UserProfileProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    reports: 0,
    projects: 0,
    resolved: 0,
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      bio: profile?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil mis à jour !',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Une erreur est survenue',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.user_metadata?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.id) return;
        const [reportsResult, projectsResult, pinResult] = await Promise.all([
          supabase.from('signalements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('projets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('user_pins').select('id').eq('user_id', user.id).maybeSingle(),
        ]);

        setStats({
          reports: (reportsResult as any)?.count ?? 0,
          projects: (projectsResult as any)?.count ?? 0,
          resolved: 0,
        });
        const pinRow = (pinResult as any)?.data;
        setTwoFAEnabled(!!pinRow?.id);
      } catch (e) {
        // Ignore silently for dashboard counters
      }
    };
    load();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {onNavigate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('report')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-lg">Taper le Ndjobi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Taper le Ndjobi de manière anonyme pour dénoncer la corruption
              </CardDescription>
              <Button className="w-full" variant="destructive" size="sm">
                Taper le Ndjobi
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('project')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FolderLock className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">Protéger un projet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Enregistrer votre idée avec horodatage
              </CardDescription>
              <Button className="w-full" variant="secondary" size="sm">
                Nouveau projet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('files')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Mes dossiers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Consulter vos dénonciations et projets
              </CardDescription>
              <Button className="w-full" variant="outline" size="sm">
                Voir mes dossiers
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Utilisateur'}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
              
              <div className="flex gap-4 text-sm">
                <Badge variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  Citoyen
                </Badge>
                <Badge variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Compte vérifié
                </Badge>
                {user?.created_at && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Membre depuis {formatDistanceToNow(new Date(user.created_at), { locale: fr })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ndjobi tapés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports}</div>
            <p className="text-xs text-muted-foreground">Total envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projets protégés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">Enregistrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cas résolus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Grâce à vous</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Gérez vos informations personnelles et vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    {...register('email')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+241 XX XXX XXXX"
                    {...register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Ville, Quartier"
                    {...register('address')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {profile?.full_name || user?.user_metadata?.full_name || '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile?.phone || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{profile?.address || '-'}</p>
                </div>
              </div>

              {profile?.bio && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sécurité du compte</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authentification à deux facteurs</span>
              <Badge variant="outline">{twoFAEnabled ? 'Activée' : 'Désactivée'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dernière connexion</span>
              <span>{user?.last_sign_in_at ? 
                formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true, locale: fr }) 
                : 'Maintenant'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notifications par email</span>
              <Badge variant="outline">Activées</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Protection Notice */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Vos données sont protégées</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toutes vos dénonciations sont chiffrées avec AES-256 et votre identité reste 100% confidentielle. 
            Nos serveurs sont hébergés au Gabon et respectent la souveraineté des données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
