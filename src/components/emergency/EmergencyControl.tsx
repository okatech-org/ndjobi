import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Unlock, User, MapPin, Mic, Activity, Clock, FileText, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { emergencyDecoder } from '@/services/emergencyDecoder';
import { supabase } from '@/integrations/supabase/client';

interface DecodedUser {
  userId: string;
  realName?: string;
  phoneNumber?: string;
  ipAddress: string;
  location?: any;
  lastActivity: string;
  signalements: any[];
}

export function EmergencyControl() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [currentActivation, setCurrentActivation] = useState<any>(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showDecoderDialog, setShowDecoderDialog] = useState(false);
  const [decodedUsers, setDecodedUsers] = useState<DecodedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DecodedUser | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Formulaire d'activation
  const [activationForm, setActivationForm] = useState({
    password: '',
    legalReference: '',
    judicialAuthorization: '',
    reason: '',
    duration: 1,
    twoFactorCode: ''
  });

  // Vérifier le statut au chargement
  useEffect(() => {
    checkEmergencyStatus();
    loadAuditLog();
  }, []);

  // Timer pour le temps restant
  useEffect(() => {
    if (!isEmergencyActive || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isEmergencyActive, remainingTime]);

  const checkEmergencyStatus = () => {
    const status = emergencyDecoder.getStatus();
    setIsEmergencyActive(status.isActive);
    setCurrentActivation(status.activation);
    setRemainingTime(status.remainingTime || 0);
  };

  const loadAuditLog = async () => {
    const { data } = await supabase
      .from('emergency_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    setAuditLog(data || []);
  };

  const handleActivation = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const result = await emergencyDecoder.activateEmergencyMode({
        superAdminId: user.id,
        superAdminPassword: activationForm.password,
        legalReference: activationForm.legalReference,
        judicialAuthorizationNumber: activationForm.judicialAuthorization,
        reason: activationForm.reason,
        durationHours: activationForm.duration,
        secondFactorCode: activationForm.twoFactorCode
      });

      if (result.success) {
        toast({
          title: "⚠️ Mode Urgence Activé",
          description: result.message,
          variant: "default"
        });
        setShowActivationDialog(false);
        checkEmergencyStatus();
        loadAuditLog();
      } else {
        toast({
          title: "❌ Activation Refusée",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivation = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver le mode urgence ?')) return;
    
    await emergencyDecoder.deactivateEmergencyMode('MANUAL_DEACTIVATION');
    toast({
      title: "Mode urgence désactivé",
      description: "Tous les accès ont été révoqués",
    });
    checkEmergencyStatus();
    loadAuditLog();
  };

  const decodeUser = async (userId: string) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const decodedData = await emergencyDecoder.decodeUserData(userId, user.id);
      
      if (decodedData) {
        setDecodedUsers(prev => [...prev, decodedData]);
        setSelectedUser(decodedData);
        toast({
          title: "Données décodées",
          description: `Utilisateur ${userId} décodé avec succès`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur décodage",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activateAudioMonitoring = async (userId: string) => {
    if (!confirm(`Activer la surveillance audio pour ${userId} (30 secondes max) ?`)) return;
    
    const result = await emergencyDecoder.activateAudioMonitoring(userId, 30);
    
    if (result.success) {
      toast({
        title: "🎤 Surveillance audio activée",
        description: `ID: ${result.recordingId}`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'activer la surveillance audio",
        variant: "destructive"
      });
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6">
      {/* En-tête avec statut */}
      <Card className={`mb-6 ${isEmergencyActive ? 'border-red-500' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-8 w-8 ${isEmergencyActive ? 'text-red-500' : 'text-gray-400'}`} />
              <div>
                <CardTitle className="text-2xl">Module d'Urgence Sécurisé</CardTitle>
                <CardDescription>
                  Accès restreint - Autorisation judiciaire requise
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEmergencyActive ? (
                <>
                  <Badge variant="destructive" className="animate-pulse">
                    MODE ACTIF
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Expire dans {formatTime(remainingTime)}
                  </span>
                </>
              ) : (
                <Badge variant="secondary">INACTIF</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEmergencyActive && currentActivation && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Activation en cours</strong><br />
                Référence légale : {currentActivation.legalReference}<br />
                Autorisation : {currentActivation.judicialAuthorization}<br />
                Raison : {currentActivation.reason}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            {!isEmergencyActive ? (
              <Button 
                onClick={() => setShowActivationDialog(true)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Activer le Mode Urgence
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleDeactivation}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Désactiver
                </Button>
                <Button 
                  onClick={() => setShowDecoderDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Décoder un Utilisateur
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs pour les différentes sections */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="users">Utilisateurs Décodés</TabsTrigger>
          <TabsTrigger value="audit">Journal d'Audit</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* Utilisateurs décodés */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Décodés ({decodedUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {decodedUsers.length === 0 ? (
                <p className="text-muted-foreground">Aucun utilisateur décodé</p>
              ) : (
                <div className="space-y-4">
                  {decodedUsers.map((user) => (
                    <Card key={user.userId} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{user.realName || 'Anonyme'}</span>
                            <Badge variant="outline">{user.userId.substring(0, 8)}</Badge>
                          </div>
                          
                          {user.phoneNumber && (
                            <div className="text-sm text-muted-foreground">
                              📱 {user.phoneNumber}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.location?.city || 'Position inconnue'}
                            </span>
                            <span>IP: {user.ipAddress}</span>
                          </div>
                          
                          <div className="text-sm">
                            {user.signalements.length} signalement(s)
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateAudioMonitoring(user.userId)}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal d'audit */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'Audit Sécurisé</CardTitle>
              <CardDescription>
                Tous les accès sont enregistrés et transmis aux autorités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLog.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          log.event_type.includes('ERROR') ? 'destructive' :
                          log.event_type.includes('ACTIVATED') ? 'default' : 'secondary'
                        }>
                          {log.event_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {log.details && (
                        <pre className="text-xs mt-1 text-muted-foreground">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{auditLog.filter(l => l.event_type === 'EMERGENCY_MODE_ACTIVATED').length}</div>
                <p className="text-sm text-muted-foreground">Total des activations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Décodages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{decodedUsers.length}</div>
                <p className="text-sm text-muted-foreground">Utilisateurs décodés</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tentatives Bloquées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {auditLog.filter(l => l.event_type.includes('UNAUTHORIZED')).length}
                </div>
                <p className="text-sm text-muted-foreground">Accès non autorisés</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog d'activation */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Activation du Mode Urgence
            </DialogTitle>
            <DialogDesc>
              Cette action nécessite une triple authentification et sera enregistrée
            </DialogDesc>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>AVERTISSEMENT LÉGAL</strong><br />
                L'activation de ce mode est strictement encadrée par la loi. Toute utilisation 
                abusive est passible de poursuites judiciaires. Tous les accès sont enregistrés 
                et transmis aux autorités de contrôle.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mot de passe Super Admin</Label>
                <Input 
                  type="password"
                  value={activationForm.password}
                  onChange={(e) => setActivationForm({...activationForm, password: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Code 2FA</Label>
                <Input 
                  placeholder="123456"
                  value={activationForm.twoFactorCode}
                  onChange={(e) => setActivationForm({...activationForm, twoFactorCode: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Référence Légale (Décret/Loi)</Label>
                <Input 
                  placeholder="Décret n°2025-XXX"
                  value={activationForm.legalReference}
                  onChange={(e) => setActivationForm({...activationForm, legalReference: e.target.value})}
                />
              </div>
              
              <div>
                <Label>N° Autorisation Judiciaire</Label>
                <Input 
                  placeholder="AJ-2025-XXXXX"
                  value={activationForm.judicialAuthorization}
                  onChange={(e) => setActivationForm({...activationForm, judicialAuthorization: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label>Raison de l'activation</Label>
              <Input 
                placeholder="Menace terroriste, atteinte à la sûreté de l'État..."
                value={activationForm.reason}
                onChange={(e) => setActivationForm({...activationForm, reason: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Durée (heures)</Label>
              <Input 
                type="number"
                min="1"
                max="72"
                value={activationForm.duration}
                onChange={(e) => setActivationForm({...activationForm, duration: parseInt(e.target.value)})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 72 heures. Renouvellement nécessite nouvelle autorisation.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivationDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleActivation}
              disabled={isLoading || !activationForm.password || !activationForm.legalReference}
            >
              {isLoading ? "Vérification..." : "Activer le Mode Urgence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de décodage */}
      <Dialog open={showDecoderDialog} onOpenChange={setShowDecoderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Décoder un Utilisateur</DialogTitle>
            <DialogDesc>
              Entrez l'ID de l'utilisateur à décoder
            </DialogDesc>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Cette action sera enregistrée et notifiée aux autorités de contrôle.
              </AlertDescription>
            </Alert>
            
            <div>
              <Label>ID Utilisateur</Label>
              <Input 
                id="decode-user-id"
                placeholder="user_xxxxx ou UUID"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecoderDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => {
                const userId = (document.getElementById('decode-user-id') as HTMLInputElement)?.value;
                if (userId) {
                  decodeUser(userId);
                  setShowDecoderDialog(false);
                }
              }}
            >
              Décoder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Détails utilisateur */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails Utilisateur Décodé</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom Réel</Label>
                  <div className="font-medium">{selectedUser.realName || 'Non disponible'}</div>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <div className="font-medium">{selectedUser.phoneNumber || 'Non disponible'}</div>
                </div>
                <div>
                  <Label>Adresse IP</Label>
                  <div className="font-medium">{selectedUser.ipAddress}</div>
                </div>
                <div>
                  <Label>Dernière Activité</Label>
                  <div className="font-medium">
                    {new Date(selectedUser.lastActivity).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
              
              {selectedUser.location && (
                <div>
                  <Label>Localisation</Label>
                  <div className="p-3 border rounded-lg">
                    <div>📍 {selectedUser.location.address || 'Adresse non disponible'}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Lat: {selectedUser.location.latitude}, Long: {selectedUser.location.longitude}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label>Signalements ({selectedUser.signalements.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUser.signalements.map((s: any) => (
                    <div key={s.id} className="p-2 border rounded">
                      <div className="text-sm">
                        <Badge>{s.type}</Badge>
                        <span className="ml-2">{s.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(s.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
