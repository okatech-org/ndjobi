"""
Service LLM Router Intelligent
Route les requêtes vers le LLM optimal selon la complexité et le coût
"""

import logging
from typing import Literal, Tuple, Optional, Dict, Any
from enum import Enum
import openai
import anthropic
import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """Providers LLM disponibles"""
    GEMINI_FLASH = "gemini-flash"
    GPT_4O_MINI = "gpt-4o-mini"
    CLAUDE_HAIKU = "claude-haiku"


class ComplexityLevel(str, Enum):
    """Niveaux de complexité de requête"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


class LLMRouter:
    """Router intelligent pour dispatcher les requêtes LLM"""
    
    def __init__(self):
        """Initialise les clients LLM"""
        genai.configure(api_key=settings.google_ai_api_key)
        self.gemini = genai.GenerativeModel(settings.gemini_model)
        
        self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        
        self.anthropic_client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key
        )
        
        self.cost_tracker = {
            LLMProvider.GEMINI_FLASH: 0.0,
            LLMProvider.GPT_4O_MINI: 0.0,
            LLMProvider.CLAUDE_HAIKU: 0.0,
        }
        
        logger.info("✅ LLM Router initialisé (Gemini, OpenAI, Anthropic)")
    
    async def classify_complexity(self, query: str) -> ComplexityLevel:
        """
        Classifie la complexité d'une requête
        
        Args:
            query: Requête utilisateur
            
        Returns:
            ComplexityLevel: Niveau de complexité détecté
        """
        try:
            prompt = f"""Analyse cette requête et classe sa complexité en : simple, medium, complex

Critères :
- SIMPLE : question factuelle, info basique, salutation
- MEDIUM : analyse simple, comparaison, explication courte
- COMPLEX : analyse profonde, code, raisonnement multi-étapes, génération de contenu long

Requête: "{query}"

Réponds UNIQUEMENT avec un mot : simple, medium ou complex"""
            
            response = await self.gemini.generate_content_async(prompt)
            complexity_str = response.text.strip().lower()
            
            if "simple" in complexity_str:
                return ComplexityLevel.SIMPLE
            elif "complex" in complexity_str:
                return ComplexityLevel.COMPLEX
            else:
                return ComplexityLevel.MEDIUM
                
        except Exception as e:
            logger.warning(f"⚠️ Erreur classification complexité: {e}, défaut=MEDIUM")
            return ComplexityLevel.MEDIUM
    
    async def route_and_generate(
        self,
        query: str,
        context: Dict[str, Any],
        force_provider: Optional[LLMProvider] = None
    ) -> Tuple[str, LLMProvider, Dict[str, Any]]:
        """
        Route vers le LLM optimal et génère la réponse
        
        Args:
            query: Requête utilisateur
            context: Contexte de conversation (historique, profil, etc.)
            force_provider: Forcer un provider spécifique (optionnel)
            
        Returns:
            Tuple[str, LLMProvider, Dict]: (réponse, provider utilisé, métadonnées)
        """
        try:
            if force_provider:
                provider = force_provider
            else:
                provider = await self._select_provider(query, context)
            
            logger.info(f"🤖 Routing vers {provider.value} pour: {query[:50]}...")
            
            response, metadata = await self._generate(provider, query, context)
            
            self._track_cost(provider, metadata.get("tokens", 0))
            
            return response, provider, metadata
            
        except Exception as e:
            logger.error(f"❌ Erreur route_and_generate: {e}", exc_info=True)
            raise
    
    async def _select_provider(
        self,
        query: str,
        context: Dict[str, Any]
    ) -> LLMProvider:
        """
        Sélectionne le provider optimal selon complexité et coût
        
        Args:
            query: Requête utilisateur
            context: Contexte
            
        Returns:
            LLMProvider: Provider sélectionné
        """
        query_lower = query.lower()
        query_length = len(query.split())
        
        if any(keyword in query_lower for keyword in ["code", "script", "fonction", "class"]):
            return LLMProvider.CLAUDE_HAIKU
        
        if query_length > 500:
            return LLMProvider.CLAUDE_HAIKU
        
        complexity = await self.classify_complexity(query)
        
        if complexity == ComplexityLevel.SIMPLE:
            return LLMProvider.GEMINI_FLASH
        elif complexity == ComplexityLevel.MEDIUM:
            return LLMProvider.GPT_4O_MINI
        else:
            return LLMProvider.CLAUDE_HAIKU
    
    async def _generate(
        self,
        provider: LLMProvider,
        query: str,
        context: Dict[str, Any]
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Génère la réponse avec le provider sélectionné
        
        Args:
            provider: Provider LLM à utiliser
            query: Requête
            context: Contexte
            
        Returns:
            Tuple[str, Dict]: (réponse, métadonnées)
        """
        system_prompt = self._build_system_prompt(context)
        
        if provider == LLMProvider.GEMINI_FLASH:
            return await self._generate_gemini(system_prompt, query)
        elif provider == LLMProvider.GPT_4O_MINI:
            return await self._generate_openai(system_prompt, query)
        elif provider == LLMProvider.CLAUDE_HAIKU:
            return await self._generate_claude(system_prompt, query)
        else:
            raise ValueError(f"Provider inconnu: {provider}")
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Construit le prompt système avec contexte"""
        user_role = context.get("user_role", "user")
        last_turns = context.get("last_turns", [])
        
        prompt = f"""Tu es iAsted, assistant vocal intelligent de la plateforme anti-corruption Ndjobi au Gabon.

Contexte utilisateur :
- Rôle : {user_role}
- Permissions : {self._get_role_permissions(user_role)}

Historique récent :
{self._format_history(last_turns)}

Directives :
- Réponds en français naturel, accent gabonais
- Sois concis mais complet
- Cite les sources de données officielles
- Respecte la confidentialité et le RBAC
- Pour les données sensibles, vérifie les permissions"""
        
        return prompt
    
    def _get_role_permissions(self, role: str) -> str:
        """Retourne les permissions selon le rôle"""
        permissions_map = {
            "user": "Consultation signalements propres, création rapports",
            "agent": "Consultation régionale, attribution cas, analyses",
            "admin": "Consultation nationale, gestion utilisateurs, métriques",
            "super_admin": "Accès complet, administration système"
        }
        return permissions_map.get(role, "Permissions limitées")
    
    def _format_history(self, turns: list) -> str:
        """Formate l'historique de conversation"""
        if not turns:
            return "Aucun historique"
        
        formatted = []
        for turn in turns[-5:]:
            formatted.append(f"User: {turn.get('user', '')}")
            formatted.append(f"Assistant: {turn.get('assistant', '')}")
        
        return "\n".join(formatted)
    
    async def _generate_gemini(
        self,
        system_prompt: str,
        query: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Génération avec Gemini"""
        try:
            full_prompt = f"{system_prompt}\n\nRequête: {query}"
            
            response = await self.gemini.generate_content_async(full_prompt)
            
            return response.text, {
                "tokens": len(response.text.split()) * 1.3,
                "model": settings.gemini_model
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur Gemini: {e}")
            raise
    
    async def _generate_openai(
        self,
        system_prompt: str,
        query: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Génération avec OpenAI"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=1024
            )
            
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens
            
            return content, {
                "tokens": tokens,
                "model": settings.openai_model
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur OpenAI: {e}")
            raise
    
    async def _generate_claude(
        self,
        system_prompt: str,
        query: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Génération avec Claude"""
        try:
            response = await self.anthropic_client.messages.create(
                model=settings.anthropic_model,
                max_tokens=1024,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": query}
                ]
            )
            
            content = response.content[0].text
            tokens = response.usage.input_tokens + response.usage.output_tokens
            
            return content, {
                "tokens": tokens,
                "model": settings.anthropic_model
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur Claude: {e}")
            raise
    
    def _track_cost(self, provider: LLMProvider, tokens: int):
        """Track les coûts par provider"""
        cost_per_1m = {
            LLMProvider.GEMINI_FLASH: 0.10,
            LLMProvider.GPT_4O_MINI: 0.15,
            LLMProvider.CLAUDE_HAIKU: 1.00,
        }
        
        cost = (tokens / 1_000_000) * cost_per_1m[provider]
        self.cost_tracker[provider] += cost
    
    def get_cost_stats(self) -> Dict[str, float]:
        """Retourne les statistiques de coûts"""
        return dict(self.cost_tracker)

