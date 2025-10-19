-- Vue Analytics pour iAsted
CREATE OR REPLACE VIEW iasted_analytics AS
SELECT 
  DATE(created_at) as date,
  mode,
  COUNT(*) as total_interactions,
  AVG(response_time_ms)::integer as avg_response_time_ms,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE artifacts_generated IS NOT NULL) as interactions_with_artifacts
FROM iasted_conversations
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), mode
ORDER BY date DESC;

-- Commentaire sur la vue
COMMENT ON VIEW iasted_analytics IS 'Vue analytique pour suivre l''utilisation d''iAsted (interactions, performances, utilisateurs)';
