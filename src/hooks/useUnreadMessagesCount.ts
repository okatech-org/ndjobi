import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessagesCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      // Get all comments grouped by signalement, checking if latest is from user (not admin)
      const { data: comments, error } = await supabase
        .from('signalement_comments')
        .select('signalement_id, is_admin, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by signalement and check if the most recent comment is from user (unread by admin)
      const signalementLastComment: Record<string, boolean> = {};
      
      comments?.forEach(comment => {
        // Only set if not already set (first occurrence = most recent)
        if (!(comment.signalement_id in signalementLastComment)) {
          signalementLastComment[comment.signalement_id] = !comment.is_admin;
        }
      });

      // Count signalements where last comment is from user
      const unreadCount = Object.values(signalementLastComment).filter(isUnread => isUnread).length;
      setCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('unread-messages-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalement_comments'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, loading, refetch: fetchUnreadCount };
}
