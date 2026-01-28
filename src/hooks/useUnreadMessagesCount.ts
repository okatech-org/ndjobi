import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessagesCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      // Get all user comments (is_admin = false) that haven't been read (read_at IS NULL)
      const { data: unreadComments, error } = await supabase
        .from('signalement_comments')
        .select('signalement_id')
        .eq('is_admin', false)
        .is('read_at', null);

      if (error) throw error;

      // Count unique signalements with unread messages
      const uniqueSignalements = new Set(unreadComments?.map(c => c.signalement_id) || []);
      setCount(uniqueSignalements.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to realtime updates for new messages and read status changes
    const channel = supabase
      .channel('unread-messages-count')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
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
  }, [fetchUnreadCount]);

  return { count, loading, refetch: fetchUnreadCount };
}
