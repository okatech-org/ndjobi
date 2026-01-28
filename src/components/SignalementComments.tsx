import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Shield, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

interface SignalementCommentsProps {
  signalementId: string;
  referenceNumber: string;
}

const SignalementComments = ({ signalementId, referenceNumber }: SignalementCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments-${signalementId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalement_comments',
          filter: `signalement_id=eq.${signalementId}`
        },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [signalementId]);

  const fetchComments = async () => {
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
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Veuillez entrer un message");
      return;
    }

    if (newComment.trim().length < 10) {
      toast.error("Le message doit contenir au moins 10 caractères");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('signalement_comments')
        .insert({
          signalement_id: signalementId,
          content: newComment.trim(),
          is_admin: false,
          admin_id: null
        });

      if (error) throw error;
      
      setNewComment("");
      toast.success("Message envoyé avec succès");
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Communication anonyme
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Échangez avec l'administration de manière anonyme concernant votre signalement {referenceNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Soyez le premier à envoyer un message</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex ${comment.is_admin ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    comment.is_admin
                      ? 'bg-muted border'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {comment.is_admin ? (
                      <>
                        <Shield className="h-3.5 w-3.5" />
                        <Badge variant="secondary" className="text-xs">
                          Administration
                        </Badge>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs opacity-80">Vous</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  <p className={`text-xs mt-1 ${comment.is_admin ? 'text-muted-foreground' : 'opacity-70'}`}>
                    {format(new Date(comment.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre message ici... (minimum 10 caractères)"
            className="min-h-[100px] resize-none"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newComment.length}/2000 caractères
            </p>
            <Button type="submit" disabled={submitting || newComment.trim().length < 10}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Envoyer
            </Button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Votre identité reste anonyme. L'administration ne peut pas voir qui vous êtes. 
            Conservez votre numéro de référence pour accéder à cette conversation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalementComments;
