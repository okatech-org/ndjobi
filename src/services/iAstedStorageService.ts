import { supabase } from '@/integrations/supabase/client';

/**
 * Service de stockage pour les conversations iAsted
 */

export interface ConversationEntry {
  session_id: string;
  mode: 'voice' | 'text';
  user_message: string;
  user_message_audio_url?: string;
  user_message_transcription?: string;
  assistant_message: string;
  assistant_audio_url?: string;
  context_data?: any;
  artifacts_generated?: string[];
  actions_triggered?: any;
  response_time_ms?: number;
}

export class IAstedStorageService {

  /**
   * Sauvegarder une conversation
   */
  static async saveConversation(
    entry: ConversationEntry
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('iasted_conversations')
        .insert({
          user_id: userData?.user?.id,
          ...entry
        })
        .select('id')
        .single();

      if (error) throw error;

      console.log('✅ Conversation sauvegardée:', data.id);
      return { success: true, id: data.id };

    } catch (error: any) {
      console.error('Erreur sauvegarde conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Uploader un fichier audio vers Supabase Storage
   */
  static async uploadAudio(
    audioBlob: Blob,
    filename: string
  ): Promise<{ url: string; error?: string } | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const path = `iasted-audio/${userData?.user?.id}/${Date.now()}-${filename}`;

      const { data, error } = await supabase.storage
        .from('conversations')
        .upload(path, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('conversations')
        .getPublicUrl(path);

      return { url: urlData.publicUrl };

    } catch (error: any) {
      console.error('Erreur upload audio:', error);
      return { url: '', error: error.message };
    }
  }

  /**
   * Récupérer l'historique des conversations
   */
  static async getConversationHistory(
    limit: number = 50
  ): Promise<any[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('iasted_conversations')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  /**
   * Enrichir la base de connaissances
   */
  static async enrichKnowledgeBase(
    type: string,
    title: string,
    content: string,
    sourceConversationId?: string,
    sourceData?: any
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('iasted_knowledge_base')
        .insert({
          knowledge_type: type,
          title,
          content,
          summary: content.substring(0, 200),
          source_conversation_id: sourceConversationId,
          source_data: sourceData,
          confidence_score: 0.8,
          relevance_score: 0.8
        });

      if (error) throw error;

      console.log('✅ Base de connaissances enrichie');
      return { success: true };

    } catch (error: any) {
      console.error('Erreur enrichissement KB:', error);
      return { success: false };
    }
  }

  /**
   * Rechercher dans la base de connaissances
   */
  static async searchKnowledgeBase(
    query: string,
    type?: string
  ): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('iasted_knowledge_base')
        .select('*')
        .textSearch('content_vector', query, {
          type: 'websearch',
          config: 'french'
        })
        .order('relevance_score', { ascending: false })
        .limit(10);

      if (type) {
        queryBuilder = queryBuilder.eq('knowledge_type', type);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Erreur recherche KB:', error);
      return [];
    }
  }
}
