import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Shield, 
  User, 
  Loader2, 
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  signalement_id: string;
}

interface SignalementWithComments {
  id: string;
  reference_number: string;
  title: string;
  status: string;
  type: string;
  priority: string;
  created_at: string;
  comment_count: number;
  last_comment_at: string | null;
  has_unread: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { 
    label: "En attente", 
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    icon: <Clock className="h-3 w-3" />
  },
  in_progress: { 
    label: "En cours", 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: <Loader2 className="h-3 w-3" />
  },
  investigating: { 
    label: "Investigation", 
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    icon: <FileSearch className="h-3 w-3" />
  },
  resolved: { 
    label: "Résolu", 
    color: "bg-green-500/10 text-green-600 border-green-500/30",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  rejected: { 
    label: "Rejeté", 
    color: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: <AlertCircle className="h-3 w-3" />
  },
};

const AdminSignalementComments = () => {
  const [signalements, setSignalements] = useState<SignalementWithComments[]>([]);
  const [selectedSignalement, setSelectedSignalement] = useState<SignalementWithComments | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchUser();
    fetchSignalementsWithComments();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchSignalementsWithComments = async () => {
    try {
      // Fetch all signalements that have comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('signalement_comments')
        .select('signalement_id, created_at, is_admin')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Group comments by signalement
      const commentsBySignalement = commentsData?.reduce((acc, comment) => {
        if (!acc[comment.signalement_id]) {
          acc[comment.signalement_id] = {
            count: 0,
            lastAt: comment.created_at,
            hasUnread: false
          };
        }
        acc[comment.signalement_id].count++;
        // Mark as unread if last comment is from user (not admin)
        if (!comment.is_admin && !acc[comment.signalement_id].hasUnread) {
          acc[comment.signalement_id].hasUnread = true;
        }
        return acc;
      }, {} as Record<string, { count: number; lastAt: string; hasUnread: boolean }>) || {};

      const signalementIds = Object.keys(commentsBySignalement);

      if (signalementIds.length === 0) {
        setSignalements([]);
        setLoadingList(false);
        return;
      }

      // Fetch signalement details
      const { data: signalementsData, error: signalementsError } = await supabase
        .from('signalements')
        .select('id, reference_number, title, status, type, priority, created_at')
        .in('id', signalementIds);

      if (signalementsError) throw signalementsError;

      const enrichedSignalements: SignalementWithComments[] = (signalementsData || [])
        .map(s => ({
          ...s,
          comment_count: commentsBySignalement[s.id]?.count || 0,
          last_comment_at: commentsBySignalement[s.id]?.lastAt || null,
          has_unread: commentsBySignalement[s.id]?.hasUnread || false
        }))
        .sort((a, b) => {
          // Sort by unread first, then by last comment date
          if (a.has_unread && !b.has_unread) return -1;
          if (!a.has_unread && b.has_unread) return 1;
          return new Date(b.last_comment_at || 0).getTime() - new Date(a.last_comment_at || 0).getTime();
        });

      setSignalements(enrichedSignalements);
    } catch (error) {
      console.error('Error fetching signalements:', error);
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchComments = async (signalementId: string) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('signalement_comments')
        .select('*')
        .eq('signalement_id', signalementId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSelectSignalement = async (signalement: SignalementWithComments) => {
    setSelectedSignalement(signalement);
    await fetchComments(signalement.id);
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`admin-comments-${signalement.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalement_comments',
          filter: `signalement_id=eq.${signalement.id}`
        },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReply.trim() || !selectedSignalement || !user) {
      toast.error("Veuillez entrer un message");
      return;
    }

    if (newReply.trim().length < 5) {
      toast.error("Le message doit contenir au moins 5 caractères");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('signalement_comments')
        .insert({
          signalement_id: selectedSignalement.id,
          content: newReply.trim(),
          is_admin: true,
          admin_id: user.id
        });

      if (error) throw error;
      
      setNewReply("");
      toast.success("Réponse envoyée");
      
      // Refresh the list to update unread status
      fetchSignalementsWithComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSignalements = signalements.filter(s => 
    s.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.pending;

  if (loadingList) {
    return (
      <Card className="glass-effect border-none">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des signalements avec commentaires */}
      <Card className="glass-effect border-none lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Messages anonymes</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => fetchSignalementsWithComments()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {signalements.length} signalement(s) avec messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          {/* List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-3">
              {filteredSignalements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun message à afficher</p>
                </div>
              ) : (
                filteredSignalements.map((signalement) => (
                  <button
                    key={signalement.id}
                    onClick={() => handleSelectSignalement(signalement)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                      selectedSignalement?.id === signalement.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {signalement.reference_number}
                          </span>
                          {signalement.has_unread && (
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="font-medium text-sm truncate mt-0.5">
                          {signalement.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${getStatusInfo(signalement.status).color}`}
                          >
                            {getStatusInfo(signalement.status).icon}
                            <span className="ml-1">{getStatusInfo(signalement.status).label}</span>
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {signalement.comment_count}
                          </span>
                        </div>
                      </div>
                    </div>
                    {signalement.last_comment_at && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Dernier message: {format(new Date(signalement.last_comment_at), "d MMM 'à' HH:mm", { locale: fr })}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de conversation */}
      <Card className="glass-effect border-none lg:col-span-2">
        {selectedSignalement ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{selectedSignalement.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getStatusInfo(selectedSignalement.status).color}
                    >
                      {getStatusInfo(selectedSignalement.status).label}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono">
                    {selectedSignalement.reference_number}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingComments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`flex ${comment.is_admin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-xl px-4 py-3 ${
                              comment.is_admin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted border'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {comment.is_admin ? (
                                <>
                                  <Shield className="h-3.5 w-3.5" />
                                  <span className="text-xs opacity-80">Administration</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-3.5 w-3.5" />
                                  <Badge variant="secondary" className="text-xs">
                                    Signalant anonyme
                                  </Badge>
                                </>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            <p className={`text-xs mt-1 ${comment.is_admin ? 'opacity-70' : 'text-muted-foreground'}`}>
                              {format(new Date(comment.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Reply Form */}
                  <form onSubmit={handleSubmitReply} className="p-4 border-t bg-muted/30">
                    <div className="flex gap-2">
                      <Textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Répondre au signalant anonyme..."
                        className="min-h-[60px] resize-none bg-background"
                        maxLength={2000}
                      />
                      <Button 
                        type="submit" 
                        disabled={submitting || newReply.trim().length < 5}
                        className="self-end"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {newReply.length}/2000 caractères • Votre réponse sera visible par le signalant anonyme
                    </p>
                  </form>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-[550px] text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Sélectionnez un signalement</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Choisissez un signalement dans la liste pour voir les messages et répondre au signalant anonyme
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminSignalementComments;
