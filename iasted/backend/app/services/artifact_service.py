"""
Service de génération d'artefacts (PDF, présentations, etc.)
Utilise WeasyPrint pour les PDFs et LLM pour le contenu
"""

import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any
from weasyprint import HTML
from jinja2 import Template
import boto3
from botocore.exceptions import ClientError

from app.config import settings
from app.services.llm_router import LLMRouter

logger = logging.getLogger(__name__)


class ArtifactService:
    """Service de génération d'artefacts documentaires"""
    
    def __init__(self):
        """Initialise le service"""
        self.s3_client = boto3.client(
            's3',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key
        )
        self.bucket = settings.s3_artifacts_bucket
        self.llm_router = LLMRouter()
        
        logger.info("✅ Service Artifact initialisé")
    
    async def generate_pdf_report(
        self,
        topic: str,
        sections: List[str],
        user_info: Dict[str, Any]
    ) -> str:
        """
        Génère un rapport PDF complet
        
        Args:
            topic: Sujet du rapport
            sections: Liste des sections à générer
            user_info: Infos utilisateur
            
        Returns:
            str: URL signée du PDF généré
        """
        try:
            logger.info(f"📄 Génération rapport PDF: {topic}")
            
            prompt = f"""Génère un rapport détaillé professionnel sur : {topic}

Sections requises :
{chr(10).join(f'- {s}' for s in sections)}

Format de réponse : JSON avec structure :
{{
  "sections": [
    {{"title": "...", "content": "..."}},
    ...
  ]
}}

Style : Professionnel, factuel, données chiffrées quand possible."""
            
            content_response, _, _ = await self.llm_router.route_and_generate(
                prompt,
                {"user_role": user_info.get('role', 'user')}
            )
            
            import json
            try:
                content_data = json.loads(content_response)
                sections_data = content_data.get("sections", [])
            except json.JSONDecodeError:
                sections_data = [{
                    "title": "Contenu généré",
                    "content": content_response
                }]
            
            html_content = self._render_pdf_template(
                title=topic,
                sections=sections_data,
                user_info=user_info
            )
            
            pdf_bytes = HTML(string=html_content).write_pdf()
            
            reference = f"RPT-{uuid.uuid4().hex[:8].upper()}"
            file_key = f"artifacts/{datetime.now().strftime('%Y/%m')}/{reference}.pdf"
            
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=file_key,
                Body=pdf_bytes,
                ContentType='application/pdf',
                Metadata={
                    'generator': 'iasted',
                    'user_id': user_info.get('id', 'unknown'),
                    'topic': topic,
                    'reference': reference,
                    'created_at': datetime.now().isoformat()
                }
            )
            
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': file_key},
                ExpiresIn=86400
            )
            
            logger.info(f"✅ PDF généré: {reference} ({len(pdf_bytes)} bytes)")
            
            return url
            
        except Exception as e:
            logger.error(f"❌ Erreur génération PDF: {e}", exc_info=True)
            raise
    
    def _render_pdf_template(
        self,
        title: str,
        sections: List[Dict[str, str]],
        user_info: Dict[str, Any]
    ) -> str:
        """Rendu du template HTML pour PDF"""
        
        template = Template("""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
    <style>
        @page { 
            size: A4; 
            margin: 2.5cm; 
            @bottom-right {
                content: "Page " counter(page) " / " counter(pages);
            }
        }
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            font-size: 11pt; 
            line-height: 1.6;
            color: #333;
        }
        h1 { 
            color: #1a5490; 
            border-bottom: 4px solid #1a5490;
            padding-bottom: 0.5em;
            margin-bottom: 1em;
        }
        h2 { 
            color: #2d5fa6; 
            margin-top: 2em; 
            margin-bottom: 0.8em;
        }
        .header { 
            text-align: center; 
            margin-bottom: 3em; 
        }
        .metadata { 
            background: #f5f5f5; 
            padding: 1.5em; 
            border-radius: 4px;
            margin-bottom: 2em;
        }
        .footer { 
            text-align: center; 
            font-size: 9pt; 
            color: #666; 
            margin-top: 3em;
            padding-top: 1em;
            border-top: 1px solid #ddd;
        }
        .section { 
            margin-bottom: 2em; 
        }
        .logo {
            font-size: 2em;
            font-weight: bold;
            color: #1a5490;
            margin-bottom: 0.5em;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">NDJOBI</div>
        <h1>{{ title }}</h1>
        <div class="metadata">
            <p><strong>Généré par :</strong> {{ user_name }}</p>
            <p><strong>Date :</strong> {{ date }}</p>
            <p><strong>Référence :</strong> {{ reference }}</p>
            <p><strong>Organisation :</strong> {{ organization }}</p>
        </div>
    </div>
    
    {% for section in sections %}
    <div class="section">
        <h2>{{ section.title }}</h2>
        <p>{{ section.content }}</p>
    </div>
    {% endfor %}
    
    <div class="footer">
        <p><strong>Document confidentiel</strong></p>
        <p>Plateforme Ndjobi - République Gabonaise</p>
        <p>Généré par iAsted AI - {{ reference }}</p>
        <p>Ce document a été généré automatiquement le {{ date }}</p>
    </div>
</body>
</html>
        """)
        
        html = template.render(
            title=title,
            user_name=user_info.get('email', 'Utilisateur'),
            date=datetime.now().strftime('%d/%m/%Y à %H:%M'),
            reference=f"RPT-{uuid.uuid4().hex[:8].upper()}",
            organization=user_info.get('organization', 'Ndjobi'),
            sections=sections
        )
        
        return html

