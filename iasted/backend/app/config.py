"""
Configuration centrale de l'application iAsted
Charge les variables d'environnement et valide la configuration
"""

from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import secrets


class Settings(BaseSettings):
    """Configuration principale de l'application"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    app_env: str = "development"
    app_debug: bool = True
    app_name: str = "iAsted"
    api_version: str = "v1"
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 10
    database_echo: bool = False
    
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 50
    redis_decode_responses: bool = True
    
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    celery_broker_url: str = "amqp://guest:guest@localhost:5672/"
    celery_result_backend: str = "redis://localhost:6379/1"
    
    deepgram_api_key: str
    deepgram_model: str = "nova-3"
    deepgram_language: str = "fr"
    
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    
    anthropic_api_key: str
    anthropic_model: str = "claude-3-5-haiku-20241022"
    
    google_ai_api_key: str
    gemini_model: str = "gemini-2.0-flash-exp"
    
    google_application_credentials: Optional[str] = None
    google_tts_language: str = "fr-FR"
    google_tts_voice: str = "fr-FR-Neural2-B"
    
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_voice_id: Optional[str] = None
    
    aws_region: str = "af-south-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_artifacts_bucket: str = "iasted-artifacts"
    s3_logs_bucket: str = "iasted-logs"
    
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: str
    
    jwt_secret: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 30
    audit_secret: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    
    rate_limit_per_minute: int = 100
    rate_limit_agent_daily_tokens: int = 10000
    rate_limit_admin_daily_tokens: int = 50000
    rate_limit_super_admin_daily_tokens: int = 100000
    
    semantic_cache_enabled: bool = True
    semantic_cache_threshold: float = 0.92
    semantic_cache_ttl: int = 86400
    
    llm_router_enable_cost_optimization: bool = True
    llm_router_default_provider: str = "gemini-flash"
    
    prometheus_enabled: bool = True
    prometheus_port: int = 9090
    sentry_dsn: Optional[str] = None
    sentry_traces_sample_rate: float = 0.1
    
    log_level: str = "INFO"
    log_format: str = "json"
    
    cors_origins: List[str] = ["http://localhost:5174", "http://localhost:3000"]
    cors_allow_credentials: bool = True
    
    dpo_email: str = "dpo@ndjobi.ga"
    cnpdcp_registration_number: str = "GA-2025-XXXXX"
    data_retention_conversations_days: int = 90
    data_retention_audit_years: int = 7
    
    ws_max_connections_per_user: int = 3
    ws_heartbeat_interval: int = 30
    ws_message_max_size: int = 10485760
    
    artifact_max_size_mb: int = 50
    artifact_generation_timeout_seconds: int = 300
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v
    
    @property
    def is_production(self) -> bool:
        """Vérifie si on est en production"""
        return self.app_env.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Vérifie si on est en développement"""
        return self.app_env.lower() == "development"


settings = Settings()

