import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TIMEOUT = 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface AIResponse {
  response: string;
  conversationId: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    responseTime?: number;
  };
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("supabase.auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = getOrCreateSessionId();
    config.headers["X-Session-ID"] = sessionId;

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Non authentifié");
    }

    if (error.response?.status === 429) {
      throw new Error("Trop de requêtes. Veuillez patienter quelques instants.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Délai d'attente dépassé. Veuillez réessayer.");
    }

    if (!error.response) {
      throw new Error("Erreur de connexion. Vérifiez votre connexion internet.");
    }

    return Promise.reject(error);
  }
);

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<AIResponse> {
  try {
    const { data } = await apiClient.post<AIResponse>("/ai/chat", {
      message: sanitizeInput(message),
      conversationId,
      context: "ndjobi_assistant",
      language: "fr",
      metadata: {
        timestamp: new Date().toISOString(),
        platform: "web",
        version: "1.0.0",
      },
    });

    return data;
  } catch (error) {
    console.error("Erreur sendMessage:", error);
    throw handleAPIError(error);
  }
}

export async function getConversationHistory(
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const { data } = await apiClient.get<{ messages: ChatMessage[] }>(
      `/ai/conversations/${conversationId}`
    );
    return data.messages;
  } catch (error) {
    console.error("Erreur getConversationHistory:", error);
    throw handleAPIError(error);
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    await apiClient.delete(`/ai/conversations/${conversationId}`);
  } catch (error) {
    console.error("Erreur deleteConversation:", error);
    throw handleAPIError(error);
  }
}

export async function sendFeedback(
  messageId: string,
  feedback: "positive" | "negative",
  comment?: string
): Promise<void> {
  try {
    await apiClient.post("/ai/feedback", {
      messageId,
      feedback,
      comment,
    });
  } catch (error) {
    console.error("Erreur sendFeedback:", error);
  }
}

export async function getUsageStats(): Promise<{
  messagesCount: number;
  conversationsCount: number;
  averageResponseTime: number;
}> {
  try {
    const { data } = await apiClient.get("/ai/stats");
    return data;
  } catch (error) {
    console.error("Erreur getUsageStats:", error);
    return {
      messagesCount: 0,
      conversationsCount: 0,
      averageResponseTime: 0,
    };
  }
}

function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .slice(0, 5000);
}

function handleAPIError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>;

    if (axiosError.response?.data?.message) {
      return new Error(axiosError.response.data.message);
    }

    if (axiosError.code === "ERR_NETWORK") {
      return new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }

    if (axiosError.response?.status === 500) {
      return new Error("Erreur serveur. Nos équipes ont été notifiées.");
    }

    return new Error(axiosError.message || "Une erreur est survenue");
  }

  return error instanceof Error 
    ? error 
    : new Error("Une erreur inconnue est survenue");
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem("ndjobi_session_id");
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("ndjobi_session_id", sessionId);
  }
  
  return sessionId;
}

function getSimulatedResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  if (input.includes("signaler") || input.includes("corruption")) {
    return `Pour signaler un cas de corruption, suivez ces étapes :

1. Cliquez sur le bouton rouge "Taper le Ndjobi"
2. Choisissez le mode anonyme ou identifié
3. Décrivez les faits en détail
4. Joignez vos preuves (photos, audio, documents)
5. Recevez votre numéro de dossier unique

Votre anonymat est garanti par cryptage AES-256. Besoin d'aide pour commencer ?`;
  }

  if (input.includes("projet") || input.includes("protéger")) {
    return `Pour protéger votre projet contre le vol d'idées :

1. Créez un compte identifié (requis)
2. Décrivez votre projet en détail
3. Joignez vos documents (business plan, maquettes...)
4. Recevez un certificat d'horodatage blockchain

Ce certificat prouve votre antériorité de manière infalsifiable. Voulez-vous commencer ?`;
  }

  if (input.includes("anonymat") || input.includes("sécurité")) {
    return `Votre anonymat est notre priorité absolue :

✅ Cryptage AES-256 bout en bout
✅ Aucune donnée personnelle collectée en mode anonyme
✅ Suppression automatique des métadonnées (GPS, appareil...)
✅ Serveurs sécurisés au Gabon
✅ Audits de sécurité réguliers

Même les administrateurs de Ndjobi ne peuvent pas vous identifier. Avez-vous d'autres questions ?`;
  }

  if (input.includes("délai") || input.includes("temps") || input.includes("traitement")) {
    return `Délais de traitement estimés :

⚡ Réception : Immédiate
📊 Analyse préliminaire : 24-48h
🔍 Vérification : 5-15 jours
📤 Transmission : Si cas avéré
✅ Résolution : Variable selon complexité

Vous recevez des notifications à chaque étape. Puis-je vous aider avec autre chose ?`;
  }

  return `Merci pour votre question. Pour une réponse plus précise, je vous invite à consulter notre FAQ détaillée ou à contacter notre équipe de support.

Vous pouvez également :
• Signaler un cas de corruption
• Protéger un projet innovant
• Consulter vos dossiers

Comment puis-je vous assister davantage ?`;
}

export const NDJOBI_SYSTEM_PROMPT = `Tu es l'Assistant Ndjobi, l'IA officielle de la plateforme anti-corruption du Gabon.

CONTEXTE :
- Ndjobi est une plateforme pour signaler la corruption et protéger les projets innovants
- Tu t'adresses à des citoyens gabonais de tous niveaux d'éducation
- Tu dois être rassurant, professionnel et pédagogique

DOMAINES D'EXPERTISE :
1. Signalement de corruption (anonyme ou identifié)
2. Protection de projets innovants (horodatage blockchain)
3. Sécurité et anonymat (cryptage AES-256)
4. Processus de traitement des dossiers
5. Droits et protections des lanceurs d'alerte

STYLE DE RÉPONSE :
- Français accessible, sans jargon excessif
- Structure : courts paragraphes + listes numérotées/à puces
- Empathique mais factuel
- Toujours proposer des actions concrètes
- Utiliser des emojis avec parcimonie (✅ 📊 🔒)

RESTRICTIONS :
- NE JAMAIS demander d'informations personnelles identifiantes
- NE JAMAIS minimiser un cas de corruption
- NE JAMAIS donner de conseils juridiques (orienter vers avocats)
- NE JAMAIS partager de données sur d'autres utilisateurs

Réponds UNIQUEMENT en français. Sois concis (max 150 mots par réponse).`;

export default {
  sendMessage,
  getConversationHistory,
  deleteConversation,
  sendFeedback,
  getUsageStats,
};

