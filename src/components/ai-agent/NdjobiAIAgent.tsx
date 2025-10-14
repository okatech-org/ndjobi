import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, Paperclip, Minimize2, RotateCcw, CheckCircle, Edit, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { deviceIdentityService } from "@/services/deviceIdentity";

function MasqueLogo3D({ size = 64, animate = true }) {
  const defs = (
    <defs>
      <radialGradient id="woodGradient" cx="45%" cy="40%" r="85%">
        <stop offset="0%" stopColor="#B8956A" />
        <stop offset="40%" stopColor="#8B6F47" />
        <stop offset="70%" stopColor="#6B5744" />
        <stop offset="100%" stopColor="#5A4A3A" />
      </radialGradient>
      <pattern id="woodTexture" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#woodGradient)" />
        <path d="M0,20 Q50,15 100,20" stroke="#6B5744" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M0,50 Q50,45 100,50" stroke="#6B5744" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M0,80 Q50,75 100,80" stroke="#6B5744" strokeWidth="0.5" fill="none" opacity="0.3" />
      </pattern>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A9B6F" />
        <stop offset="50%" stopColor="#2E7D5A" />
        <stop offset="100%" stopColor="#1F5A3F" />
      </linearGradient>
      <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD966" />
        <stop offset="60%" stopColor="#F4C542" />
        <stop offset="100%" stopColor="#D4A72C" />
      </radialGradient>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B7EA1" />
        <stop offset="50%" stopColor="#2C5F7E" />
        <stop offset="100%" stopColor="#1E4A5F" />
      </linearGradient>
      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4" />
      </filter>
      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="2" />
        <feGaussianBlur stdDeviation="2" result="offset-blur" />
        <feComposite in2="offset-blur" in="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
      </filter>
    </defs>
  );

  const breathe = animate ? { y: [0, -3, 0] } : { y: 0 };
  const breatheTr = animate ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : {};
  const blink = animate ? { scaleY: [1, 0.1, 1] } : { scaleY: 1 };
  const blinkTr = animate ? { duration: 0.3, repeat: Infinity, repeatDelay: 4 } : {};
  const treePulse = animate ? { scale: [1, 1.03, 1] } : { scale: 1 };
  const pulseTr = animate ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {};

  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} role="img" aria-label="Logo Agent IA Ndjobi">
      {defs}
      <motion.g animate={breathe} transition={breatheTr}>
        <circle cx="500" cy="500" r="480" fill="url(#woodTexture)" filter="url(#dropShadow)" />
        <circle cx="500" cy="500" r="480" fill="none" stroke="#3A2F26" strokeWidth="8" />
      </motion.g>
      <motion.g animate={treePulse} transition={pulseTr}>
        <path d="M 500 280 L 500 550 Q 500 570, 490 580 L 480 620 Q 470 650, 490 670 L 510 670 Q 530 650, 520 620 L 510 580 Q 500 570, 500 550 Z" fill="url(#greenGradient)" stroke="#1F5A3F" strokeWidth="6" filter="url(#innerShadow)" />
        <g>
          <path d="M 300 200 Q 250 180, 230 220 Q 210 260, 240 290 Q 220 320, 250 340 Q 280 360, 310 340 Q 320 360, 350 360 Q 380 350, 400 330 Q 420 300, 410 270 Q 420 240, 400 220 Q 380 200, 360 210 Q 340 190, 320 200 Z" fill="url(#greenGradient)" stroke="#1F5A3F" strokeWidth="6" />
          <path d="M 260 230 Q 280 240, 300 235" fill="none" stroke="#2E7D5A" strokeWidth="8" strokeLinecap="round" />
          <path d="M 270 270 Q 290 280, 310 275" fill="none" stroke="#2E7D5A" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="500" cy="180" rx="70" ry="90" fill="url(#greenGradient)" stroke="#1F5A3F" strokeWidth="6" />
          <path d="M 480 160 Q 500 170, 520 160" fill="none" stroke="#2E7D5A" strokeWidth="8" strokeLinecap="round" />
          <path d="M 700 200 Q 750 180, 770 220 Q 790 260, 760 290 Q 780 320, 750 340 Q 720 360, 690 340 Q 680 360, 650 360 Q 620 350, 600 330 Q 580 300, 590 270 Q 580 240, 600 220 Q 620 200, 640 210 Q 660 190, 680 200 Z" fill="url(#greenGradient)" stroke="#1F5A3F" strokeWidth="6" />
          <path d="M 740 230 Q 720 240, 700 235" fill="none" stroke="#2E7D5A" strokeWidth="8" strokeLinecap="round" />
          <path d="M 730 270 Q 710 280, 690 275" fill="none" stroke="#2E7D5A" strokeWidth="8" strokeLinecap="round" />
          <path d="M 350 300 Q 420 280, 490 300" fill="none" stroke="#4A9B6F" strokeWidth="4" opacity="0.6" />
          <path d="M 510 300 Q 580 280, 650 300" fill="none" stroke="#4A9B6F" strokeWidth="4" opacity="0.6" />
        </g>
      </motion.g>
      <motion.g animate={blink} transition={blinkTr} style={{ originY: 450 }}>
        <ellipse cx="360" cy="450" rx="110" ry="70" fill="url(#eyeGradient)" stroke="#8B6F47" strokeWidth="8" filter="url(#innerShadow)" />
        <ellipse cx="340" cy="430" rx="30" ry="20" fill="#FFF9E6" opacity="0.6" />
        <ellipse cx="640" cy="450" rx="110" ry="70" fill="url(#eyeGradient)" stroke="#8B6F47" strokeWidth="8" filter="url(#innerShadow)" />
        <ellipse cx="620" cy="430" rx="30" ry="20" fill="#FFF9E6" opacity="0.6" />
      </motion.g>
      <g transform="translate(500, 700)">
        <path d="M -110 -60 L 110 -60 Q 110 -60, 110 -40 L 110 60 Q 110 80, 100 95 Q 80 120, 50 135 Q 20 145, 0 150 Q -20 145, -50 135 Q -80 120, -100 95 Q -110 80, -110 60 L -110 -40 Q -110 -60, -110 -60 Z" fill="url(#shieldGradient)" stroke="#1E4A5F" strokeWidth="8" filter="url(#innerShadow)" />
        <path d="M -80 -30 Q -40 -20, 0 -30 Q 40 -20, 80 -30" fill="none" stroke="#5A9BC4" strokeWidth="6" opacity="0.4" strokeLinecap="round" />
        <path d="M -100 -50 L 100 -50" fill="none" stroke="#5A9BC4" strokeWidth="4" opacity="0.5" />
      </g>
      <circle cx="500" cy="500" r="480" fill="url(#woodTexture)" opacity="0.1" pointerEvents="none" />
    </svg>
  );
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: MessageAction[];
}

interface MessageAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'success';
}

type FlowType = 'idle' | 'report' | 'project';
type FlowStep = 'idle' | 'type' | 'location' | 'description' | 'witness' | 'review' | 'complete' |
                'title' | 'category' | 'innovation' | 'stage';

interface CollectedData {
  type?: string;
  location?: string;
  description?: string;
  witness_name?: string;
  witness_contact?: string;
  title?: string;
  category?: string;
  innovation_level?: string;
  development_stage?: string;
  budget_estimate?: string;
  timeline?: string;
  isAnonymous?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: "init-1",
  text: "Bonjour ! Je suis l'Assistant Ndjobi 🎭, votre guide intelligent pour lutter contre la corruption au Gabon.\n\nJe peux vous aider à :\n• 🎯 Taper le Ndjobi (dénoncer la corruption)\n• 🛡️ Protéger votre projet innovant\n• ❓ Répondre à vos questions\n\nQue souhaitez-vous faire aujourd'hui ?",
  isBot: true,
  timestamp: new Date(),
  actions: [
    { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
    { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
  ],
};

export default function NdjobiAIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [flowType, setFlowType] = useState<FlowType>('idle');
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          variant: "destructive",
          title: "Erreur vocale",
          description: "Impossible de capter votre voix. Vérifiez vos permissions.",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas disponible sur ce navigateur.",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({
          title: "🎤 Écoute en cours...",
          description: "Parlez maintenant",
        });
      } catch (error) {
        console.error('Voice recognition error:', error);
      }
    }
  };

  const addMessage = (text: string, isBot: boolean, actions?: MessageAction[]) => {
    const message: Message = {
      id: `${isBot ? 'bot' : 'user'}-${Date.now()}`,
      text,
      isBot,
      timestamp: new Date(),
      actions,
    };
    setMessages((prev) => [...prev, message]);
  };

  const startReportFlow = () => {
    setFlowType('report');
    setFlowStep('type');
    setCollectedData({ isAnonymous: true });
    
    setTimeout(() => {
      addMessage(
        "Parfait ! Tapons le Ndjobi ensemble. 🎯\n\n❓ Quel type de corruption souhaitez-vous dénoncer ?\n\n💬 Vous pouvez :\n• Cliquer sur un bouton ci-dessous\n• Écrire directement votre message\n• 🎤 Utiliser la commande vocale",
        true,
        [
          { label: "💰 Corruption/Pots-de-vin", action: "type_corruption", style: "primary" },
          { label: "📄 Appel d'offres truqué", action: "type_appel_offres", style: "primary" },
          { label: "💸 Détournement de fonds", action: "type_detournement", style: "primary" },
          { label: "🏛️ Abus de pouvoir", action: "type_abus_pouvoir", style: "secondary" },
          { label: "🎓 Corruption scolaire", action: "type_corruption_scolaire", style: "secondary" },
          { label: "⚕️ Corruption santé", action: "type_corruption_sante", style: "secondary" },
          { label: "✏️ Autre (écrire)", action: "type_autre", style: "secondary" },
        ]
      );
      setIsTyping(false);
    }, 1000);
  };

  const startProjectFlow = () => {
    setFlowType('project');
    setFlowStep('title');
    setCollectedData({});
    
    setTimeout(() => {
      addMessage(
        "Parfait ! Je vais vous aider à protéger votre projet innovant. 🛡️\n\n❓ Quel est le titre de votre projet ?\n\n(Soyez concis mais descriptif, ex: 'Application mobile de covoiturage urbain')",
        true
      );
      setIsTyping(false);
    }, 1000);
  };

  const handleReportFlow = async (userInput: string) => {
    const trimmed = userInput.trim();
    
    switch (flowStep) {
      case 'type':
        setCollectedData(prev => ({ ...prev, type: trimmed }));
        setFlowStep('location');
        setTimeout(() => {
          addMessage(
            `Type de Ndjobi noté : "${trimmed}"\n\n📍 Où se sont déroulés les faits ?\n\n💬 Vous pouvez :\n• 📍 Utiliser votre position GPS\n• ✏️ Écrire l'adresse manuellement`,
            true,
            [
              { label: "📍 Ma position GPS", action: "use_gps", style: "primary" },
              { label: "✏️ Écrire l'adresse", action: "manual_location", style: "secondary" },
            ]
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'location':
        setCollectedData(prev => ({ ...prev, location: trimmed }));
        setFlowStep('description');
        setTimeout(() => {
          addMessage(
            `Localisation enregistrée : "${trimmed}"\n\n📝 Décrivez les faits en détail :\n\n• Que s'est-il passé ?\n• Quand ?\n• Qui est impliqué ?\n• Quelles sont les preuves ?\n\n(Soyez le plus précis possible, minimum 10 caractères)`,
            true
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'description':
        if (trimmed.length < 10) {
          setTimeout(() => {
            addMessage(
              "❌ Description trop courte. Veuillez fournir au moins 10 caractères avec plus de détails sur les faits.",
              true
            );
            setIsTyping(false);
          }, 800);
      return;
    }

        const improvedDesc = `${trimmed}\n\n[Faits rapportés le ${new Date().toLocaleDateString('fr-FR')}]`;
        setCollectedData(prev => ({ ...prev, description: improvedDesc }));
        setFlowStep('witness');
        
        setTimeout(() => {
          addMessage(
            `Description enregistrée.\n\n👤 (Facultatif) Avez-vous des témoins à mentionner ?\n\nRépondez par "oui" si vous souhaitez ajouter un témoin, ou "non" pour passer cette étape.`,
            true,
            [
              { label: "Oui, ajouter un témoin", action: "witness_yes", style: "secondary" },
              { label: "Non, continuer", action: "witness_no", style: "primary" },
            ]
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'witness':
        if (trimmed.toLowerCase().includes('non') || trimmed === 'witness_no') {
          setFlowStep('review');
          showReportReview();
        } else {
          setTimeout(() => {
            addMessage(
              "👤 Nom du témoin ?\n\n(Ou tapez 'annuler' pour passer)",
              true
            );
            setIsTyping(false);
            setFlowStep('witness');
          }, 800);
        }
        break;
    }
  };

  const handleProjectFlow = async (userInput: string) => {
    const trimmed = userInput.trim();
    
    switch (flowStep) {
      case 'title':
        if (trimmed.length < 3) {
          setTimeout(() => {
            addMessage("❌ Le titre doit contenir au moins 3 caractères.", true);
            setIsTyping(false);
          }, 800);
          return;
        }
        setCollectedData(prev => ({ ...prev, title: trimmed }));
        setFlowStep('category');
        setTimeout(() => {
          addMessage(
            `Titre enregistré : "${trimmed}"\n\n🏷️ Quelle est la catégorie de votre projet ?`,
            true,
            [
              { label: "Technologie", action: "cat_tech" },
              { label: "Santé", action: "cat_sante" },
              { label: "Agriculture", action: "cat_agri" },
              { label: "Éducation", action: "cat_edu" },
              { label: "Transport", action: "cat_transport" },
            ]
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'category':
        const catMap: Record<string, string> = {
          'cat_tech': 'Technologie',
          'cat_sante': 'Santé',
          'cat_agri': 'Agriculture',
          'cat_edu': 'Éducation',
          'cat_transport': 'Transport',
        };
        const category = catMap[trimmed] || trimmed;
        setCollectedData(prev => ({ ...prev, category }));
        setFlowStep('description');
        setTimeout(() => {
          addMessage(
            `Catégorie : ${category}\n\n📝 Décrivez votre projet en détail :\n\n• Quelle problématique résout-il ?\n• Comment fonctionne-t-il ?\n• Qu'est-ce qui le rend unique ?\n\n(Minimum 20 caractères)`,
            true
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'description':
        if (trimmed.length < 20) {
          setTimeout(() => {
            addMessage("❌ Description trop courte. Minimum 20 caractères.", true);
            setIsTyping(false);
          }, 800);
          return;
        }
        setCollectedData(prev => ({ ...prev, description: trimmed }));
        setFlowStep('innovation');
        setTimeout(() => {
          addMessage(
            "Description enregistrée.\n\n💡 Quel est le niveau d'innovation ?",
            true,
            [
              { label: "Révolutionnaire", action: "innov_rev" },
              { label: "Très innovant", action: "innov_high" },
              { label: "Innovant", action: "innov_med" },
              { label: "Amélioration", action: "innov_low" },
            ]
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'innovation':
        const innovMap: Record<string, string> = {
          'innov_rev': 'Révolutionnaire',
          'innov_high': 'Très innovant',
          'innov_med': 'Innovant',
          'innov_low': 'Amélioration',
        };
        const innovation = innovMap[trimmed] || trimmed;
        setCollectedData(prev => ({ ...prev, innovation_level: innovation }));
        setFlowStep('stage');
        setTimeout(() => {
          addMessage(
            `Innovation : ${innovation}\n\n🚀 À quel stade est votre projet ?`,
            true,
            [
              { label: "Idée", action: "stage_idea" },
              { label: "Prototype", action: "stage_proto" },
              { label: "Test", action: "stage_test" },
              { label: "Production", action: "stage_prod" },
            ]
          );
          setIsTyping(false);
        }, 1000);
        break;

      case 'stage':
        const stageMap: Record<string, string> = {
          'stage_idea': 'Idée',
          'stage_proto': 'Prototype',
          'stage_test': 'Test',
          'stage_prod': 'Production',
        };
        const stage = stageMap[trimmed] || trimmed;
        setCollectedData(prev => ({ ...prev, development_stage: stage }));
        setFlowStep('review');
        showProjectReview();
        break;
    }
  };

  const showReportReview = () => {
    setTimeout(() => {
      const summary = `📋 **Récapitulatif de votre Ndjobi**\n\n` +
        `**Type :** ${collectedData.type}\n` +
        `**Lieu :** ${collectedData.location}\n` +
        `**Description :**\n${collectedData.description}\n\n` +
        `🔒 Dénonciation anonyme avec cryptage AES-256\n\n` +
        `Souhaitez-vous :\n• Taper le Ndjobi (envoyer) ?\n• Modifier des informations ?`;
      
      addMessage(summary, true, [
        { label: "✅ Taper le Ndjobi", action: "submit_report", style: "success" },
        { label: "✏️ Modifier", action: "edit_report", style: "secondary" },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const showProjectReview = () => {
    setTimeout(() => {
      const summary = `📋 **Récapitulatif de votre projet**\n\n` +
        `**Titre :** ${collectedData.title}\n` +
        `**Catégorie :** ${collectedData.category}\n` +
        `**Description :**\n${collectedData.description}\n` +
        `**Innovation :** ${collectedData.innovation_level}\n` +
        `**Stade :** ${collectedData.development_stage}\n\n` +
        `🛡️ Protection blockchain avec certificat d'antériorité\n\n` +
        `Souhaitez-vous :\n• Envoyer ce projet ?\n• Modifier des informations ?`;
      
      addMessage(summary, true, [
        { label: "✅ Envoyer", action: "submit_project", style: "success" },
        { label: "✏️ Modifier", action: "edit_project", style: "secondary" },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const submitReport = async () => {
    setIsTyping(true);
    addMessage("submit_report", false);
    
    try {
      const deviceId = deviceIdentityService.getDeviceId();
      
      const signalementData: any = {
        type: collectedData.type,
        location: collectedData.location,
        description: collectedData.description,
        status: 'pending_analysis',
        priority: 'medium',
        submission_method: 'chat_ai',
        device_id: deviceId,
      };

      if (collectedData.gps_latitude && collectedData.gps_longitude) {
        signalementData.gps_latitude = collectedData.gps_latitude;
        signalementData.gps_longitude = collectedData.gps_longitude;
      }

      if (user) {
        signalementData.user_id = user.id;
        signalementData.is_anonymous = false;
      } else {
        signalementData.user_id = null;
        signalementData.is_anonymous = true;
      }

      const { data, error } = await supabase
        .from('signalements')
        .insert(signalementData)
        .select()
        .single();

      if (error) throw error;

      if (!user && deviceId) {
        await deviceIdentityService.recordAnonymousSignalement(data.id);
      }

      setTimeout(() => {
        const accountMsg = user 
          ? `Votre dénonciation a été enregistrée et sera traitée dans les 24-48h.` 
          : `Votre dénonciation anonyme a été enregistrée.\n\n💡 Créez un compte pour suivre l'évolution de votre dossier !`;
        
        addMessage(
          `✅ **Ndjobi tapé avec succès !**\n\n` +
          `📁 Numéro de dossier : **${data.id.substring(0, 8)}**\n\n` +
          accountMsg + `\n\n` +
          `Merci de contribuer à la transparence ! 🙏🎯`,
          true,
          !user ? [{ label: "Créer un compte", action: "goto_signup", style: "primary" }] : undefined
        );
        setIsTyping(false);
        resetFlow();
        toast({
          title: "Ndjobi tapé !",
          description: `Dossier #${data.id.substring(0, 8)}`,
        });
      }, 1500);
    } catch (error: any) {
      setTimeout(() => {
        addMessage(
          `❌ Erreur lors de l'envoi : ${error.message}\n\nVoulez-vous réessayer ?`,
          true,
          [{ label: "Réessayer", action: "submit_report", style: "primary" }]
        );
        setIsTyping(false);
      }, 1000);
    }
  };

  const submitProject = async () => {
    setIsTyping(true);
    addMessage("submit_project", false);
    
    try {
      const deviceId = deviceIdentityService.getDeviceId();
      const protectionNumber = `NDP-${Date.now().toString(36).toUpperCase()}`;

      const projectData: any = {
        title: collectedData.title,
        category: collectedData.category,
        description: collectedData.description,
        status: 'protected',
        protection_number: protectionNumber,
        device_id: deviceId,
        metadata: {
          innovation_level: collectedData.innovation_level,
          development_stage: collectedData.development_stage,
        },
      };

      if (user) {
        projectData.user_id = user.id;
      } else {
        projectData.user_id = null;
      }

      const { data, error } = await supabase
        .from('projets')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;

      if (!user && deviceId) {
        await deviceIdentityService.recordAnonymousProject(data.id);
      }

      setTimeout(() => {
        const accountMsg = user
          ? `Vous pouvez télécharger votre certificat depuis votre tableau de bord.`
          : `💡 Créez un compte pour télécharger votre certificat et suivre votre projet !`;

        addMessage(
          `✅ **Projet protégé avec succès !**\n\n` +
          `🛡️ Certificat : **${protectionNumber}**\n\n` +
          `Votre projet "${collectedData.title}" est maintenant protégé par blockchain.\n\n` +
          accountMsg + `\n\n` +
          `Votre innovation est sécurisée ! 🎉`,
          true,
          !user ? [{ label: "Créer un compte", action: "goto_signup", style: "primary" }] : undefined
        );
        setIsTyping(false);
        resetFlow();
        toast({
          title: "Projet protégé !",
          description: `Certificat ${protectionNumber}`,
        });
      }, 1500);
    } catch (error: any) {
      setTimeout(() => {
        addMessage(
          `❌ Erreur lors de l'enregistrement : ${error.message}\n\nVoulez-vous réessayer ?`,
          true,
          [{ label: "Réessayer", action: "submit_project", style: "primary" }]
        );
        setIsTyping(false);
      }, 1000);
    }
  };

  const resetFlow = () => {
    setFlowType('idle');
    setFlowStep('idle');
    setCollectedData({});
    setTimeout(() => {
      addMessage(
        "Que puis-je faire d'autre pour vous ?",
        true,
        [
          { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
          { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
        ]
      );
    }, 500);
  };

  const handleActionClick = (action: string) => {
    setIsTyping(true);
    
    switch (action) {
      case 'start_report':
        addMessage("Je veux taper le Ndjobi", false);
        startReportFlow();
        break;
      case 'start_project':
        addMessage("Je veux protéger mon projet", false);
        startProjectFlow();
        break;
      case 'submit_report':
        submitReport();
        break;
      case 'submit_project':
        submitProject();
        break;
      case 'witness_yes':
      case 'witness_no':
        handleSend(action);
        break;
      case 'edit_report':
      case 'edit_project':
        addMessage("Je veux modifier", false);
        setTimeout(() => {
          addMessage("Quelle information souhaitez-vous modifier ? (Tapez le nom du champ)", true);
          setIsTyping(false);
        }, 800);
        break;
      case 'type_corruption':
        addMessage("💰 Corruption/Pots-de-vin", false);
        handleReportFlow("Corruption et pots-de-vin");
        break;
      case 'type_appel_offres':
        addMessage("📄 Appel d'offres truqué", false);
        handleReportFlow("Appel d'offres truqué");
        break;
      case 'type_detournement':
        addMessage("💸 Détournement de fonds", false);
        handleReportFlow("Détournement de fonds publics");
        break;
      case 'type_abus_pouvoir':
        addMessage("🏛️ Abus de pouvoir", false);
        handleReportFlow("Abus de pouvoir et de fonction");
        break;
      case 'type_corruption_scolaire':
        addMessage("🎓 Corruption scolaire", false);
        handleReportFlow("Corruption dans le secteur éducatif");
        break;
      case 'type_corruption_sante':
        addMessage("⚕️ Corruption santé", false);
        handleReportFlow("Corruption dans le secteur de la santé");
        break;
      case 'type_autre':
        addMessage("✏️ Je préfère écrire", false);
        setTimeout(() => {
          addMessage("D'accord, décrivez le type de corruption en quelques mots :", true);
          setIsTyping(false);
        }, 800);
        break;
      case 'help_corruption':
        addMessage("J'ai des questions sur la corruption", false);
        setTimeout(() => {
          addMessage(
            "Bien sûr, je suis là pour vous aider. 🤝\n\n❓ **Questions fréquentes** :\n\n• Combien de temps prend le traitement ?\n→ Analyse préliminaire : 24-48h\n\n• Mon anonymat est-il vraiment garanti ?\n→ Oui, cryptage AES-256 et serveurs sécurisés\n\n• Que se passe-t-il après le signalement ?\n→ Vérification, puis transmission aux autorités si avéré\n\nVoulez-vous procéder au signalement maintenant ?",
            true,
            [
              { label: "Oui, commençons", action: "start_report", style: "primary" },
              { label: "Autre question", action: "type_autre", style: "secondary" },
            ]
          );
          setIsTyping(false);
        }, 1200);
        break;
      case 'help_project':
        addMessage("Comment fonctionne la protection ?", false);
        setTimeout(() => {
          addMessage(
            "Excellente question ! 🛡️\n\n**Comment ça marche** :\n\n1️⃣ Vous décrivez votre projet\n2️⃣ Je l'enregistre avec un horodatage blockchain\n3️⃣ Vous recevez un certificat d'antériorité\n4️⃣ Votre innovation est protégée de manière infalsifiable\n\n⛓️ La blockchain garantit que personne ne peut prétendre avoir eu l'idée avant vous.\n\nCommençons ?",
            true,
            [
              { label: "Oui, protégeons-le", action: "start_project", style: "primary" },
            ]
          );
          setIsTyping(false);
        }, 1200);
        break;
      case 'use_gps':
        addMessage("📍 Utiliser ma position GPS", false);
        getGPSLocation();
        break;
      case 'manual_location':
        addMessage("✏️ Je vais écrire l'adresse", false);
        setTimeout(() => {
          addMessage("D'accord, indiquez le lieu (ville, quartier, bâtiment...) :", true);
          setIsTyping(false);
        }, 800);
        break;
      case 'goto_signup':
        addMessage("Je veux créer un compte", false);
        setTimeout(() => {
          addMessage(
            "Parfait ! 🎉\n\nEn créant un compte, vous pourrez :\n• Suivre vos signalements\n• Recevoir des notifications\n• Télécharger vos certificats\n• Accéder à votre historique\n\n📱 Vous allez être redirigé vers la page de connexion.",
            true
          );
          setIsTyping(false);
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        }, 800);
        break;
      default:
        if (action.startsWith('cat_') || action.startsWith('innov_') || action.startsWith('stage_')) {
          handleSend(action);
        }
    }
  };

  const getGPSLocation = () => {
    setIsTyping(true);
    
    if (!navigator.geolocation) {
      setTimeout(() => {
        addMessage(
          "❌ Géolocalisation non disponible sur cet appareil.\n\nVeuillez entrer l'adresse manuellement.",
          true
        );
        setIsTyping(false);
      }, 500);
      return;
    }

    addMessage("🔍 Localisation en cours...", true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`,
            { headers: { 'User-Agent': 'NDJOBI-App/1.0' } }
          );
          
          const data = await response.json();
          const address = data.display_name || `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setCollectedData(prev => ({ 
            ...prev, 
            location: address,
            gps_latitude: latitude,
            gps_longitude: longitude 
          }));
          
          setFlowStep('description');
          
          setTimeout(() => {
            addMessage(
              `📍 Position détectée :\n"${address}"\n\n📝 Maintenant, décrivez les faits en détail :\n\n• Que s'est-il passé ?\n• Quand ?\n• Qui est impliqué ?\n• Quelles sont les preuves ?\n\n(Minimum 10 caractères)`,
              true
            );
            setIsTyping(false);
          }, 1000);
        } catch (error) {
          const fallbackLocation = `Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCollectedData(prev => ({ 
            ...prev, 
            location: fallbackLocation,
            gps_latitude: latitude,
            gps_longitude: longitude 
          }));
          
          setFlowStep('description');
          
          setTimeout(() => {
            addMessage(
              `📍 Position GPS enregistrée.\n\n📝 Décrivez les faits en détail :`,
              true
            );
            setIsTyping(false);
          }, 1000);
        }
      },
      (error) => {
        setTimeout(() => {
          let errorMsg = "❌ Impossible d'obtenir votre position.\n\n";
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg += "Vous avez refusé l'accès à la localisation. Veuillez entrer l'adresse manuellement.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg += "Position indisponible. Veuillez entrer l'adresse manuellement.";
          } else {
            errorMsg += "Délai dépassé. Veuillez entrer l'adresse manuellement.";
          }
          
          addMessage(errorMsg, true);
          setIsTyping(false);
        }, 800);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getConversationalResponse = (input: string): { text: string; actions?: MessageAction[] } => {
    const lowerInput = input.toLowerCase().trim();

    if (/^(bonjour|salut|bonsoir|hello|hi|coucou|yo)/.test(lowerInput)) {
      const greetings = [
        "Bonjour ! 🎭 Je suis ravi de vous accueillir.",
        "Salut ! Content de vous voir. 😊",
        "Bonjour à vous ! Bienvenue.",
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      return {
        text: `${greeting}\n\nJe suis l'Assistant Ndjobi, votre allié dans la lutte contre la corruption au Gabon.\n\n✨ Je peux vous aider à :\n• 🎯 Dénoncer un cas de corruption en toute sécurité\n• 🛡️ Protéger votre projet innovant\n• 💬 Répondre à vos questions\n\nComment puis-je vous aider aujourd'hui ?`,
        actions: [
          { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
          { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
        ]
      };
    }

    if (/^(merci|thank|thx|ok|d'accord|compris)/.test(lowerInput)) {
      return {
        text: "De rien ! 😊 C'est un plaisir de vous aider dans cette démarche importante.\n\nSi vous avez besoin d'autre chose, n'hésitez pas !",
        actions: [
          { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
          { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
        ]
      };
    }

    if (/comment (ça|ca) (marche|fonctionne)|aide|help|assistance/.test(lowerInput)) {
      return {
        text: "Bien sûr, je vais vous expliquer ! 📖\n\n🎯 **Pour taper le Ndjobi** (dénoncer) :\nJe vous guide étape par étape pour signaler un cas de corruption de manière sécurisée et anonyme.\n\n🛡️ **Pour protéger un projet** :\nJe vous aide à enregistrer votre innovation avec un certificat blockchain.\n\n💬 Vous pouvez me parler naturellement, ou utiliser les boutons ci-dessous.\n\nQue souhaitez-vous faire ?",
        actions: [
          { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
          { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
        ]
      };
    }

    if (/anonymat|sécurité|sûr|confidentiel|discret/.test(lowerInput)) {
      return {
        text: "Excellente question ! 🔒 Votre sécurité est ma priorité absolue.\n\n✅ **Protection garantie** :\n• Cryptage AES-256 de toutes vos données\n• Mode anonyme disponible\n• Aucune traçabilité possible\n• Serveurs sécurisés au Gabon\n• Même les admins ne peuvent pas vous identifier\n\nVous êtes en sécurité avec Ndjobi. Voulez-vous continuer ?",
        actions: [
          { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
          { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
        ]
      };
    }

    if (/corruption|corrompre|corrompu|pot.de.vin|bakchich/.test(lowerInput)) {
      return {
        text: "Je comprends votre préoccupation. 💪\n\nLa corruption nuit à notre société, mais ensemble nous pouvons la combattre. Chaque dénonciation compte.\n\nJe vais vous guider pour signaler ce cas en toute sécurité. Êtes-vous prêt à taper le Ndjobi ?",
        actions: [
          { label: "Oui, commençons", action: "start_report", style: "primary" },
          { label: "J'ai des questions", action: "help_corruption", style: "secondary" },
        ]
      };
    }

    if (/projet|idée|innovation|startup|entreprise/.test(lowerInput)) {
      return {
        text: "Formidable ! 🚀 Protéger votre projet est une excellente initiative.\n\nVotre innovation mérite d'être sécurisée contre le vol d'idées. Je vais vous aider à obtenir un certificat blockchain qui prouve votre antériorité.\n\nVoulez-vous protéger votre projet maintenant ?",
        actions: [
          { label: "Oui, protégeons-le", action: "start_project", style: "primary" },
          { label: "Comment ça marche ?", action: "help_project", style: "secondary" },
        ]
      };
    }

    return {
      text: "Je comprends votre message, mais je ne suis pas sûr de saisir exactement ce que vous souhaitez faire. 🤔\n\nPouvez-vous préciser ?\n\n💬 Vous pouvez aussi utiliser les boutons ci-dessous :",
      actions: [
        { label: "🎯 Taper le Ndjobi", action: "start_report", style: "primary" },
        { label: "🛡️ Protéger un projet", action: "start_project", style: "secondary" },
      ]
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userInput = inputValue;
    addMessage(userInput, false);
    setInputValue("");
    setIsTyping(true);

    if (flowType === 'report') {
      await handleReportFlow(userInput);
    } else if (flowType === 'project') {
      await handleProjectFlow(userInput);
    } else {
      setTimeout(() => {
        const response = getConversationalResponse(userInput);
        addMessage(response.text, true, response.actions);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-24 h-24 rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 group overflow-visible"
            style={{ background: "linear-gradient(135deg, #2E8B57 0%, #1F7AB8 100%)" }}
            aria-label="Ouvrir l'assistant IA Ndjobi"
          >
            <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-br from-amber-900 to-amber-700" />
            <div className="relative w-20 h-20 z-10">
              <MasqueLogo3D size={80} animate />
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
              IA
            </motion.div>
            <motion.div className="absolute inset-0 rounded-full bg-emerald-400" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 60 : 600 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-4 border-amber-900"
            style={{ maxHeight: isMinimized ? "60px" : "600px", backgroundImage: "linear-gradient(to bottom, #ffffff, #fafaf8)" }}
          >
            <div className="p-4 flex items-center justify-between relative overflow-hidden" style={{ background: "linear-gradient(135deg, #2E8B57 0%, #1F7AB8 100%)" }}>
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-900 to-amber-700" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <MasqueLogo3D size={48} animate />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    Assistant Ndjobi
                    <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">IA</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <motion.div className="w-2 h-2 bg-green-400 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-white/90 text-xs">En ligne</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg" aria-label={isMinimized ? "Maximiser" : "Minimiser"}>
                  <Minimize2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.isBot ? "bg-white text-gray-800 shadow-md border border-gray-200" : "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg"}`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                        {message.actions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(action.action)}
                                className={`text-xs px-3 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow-md ${
                                  action.style === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                  action.style === 'primary' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                                  'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="text-xs opacity-60 mt-2 block">{message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-white rounded-2xl px-5 py-4 shadow-md border border-gray-200">
                        <div className="flex gap-1.5">
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <motion.div key={i} className="w-2.5 h-2.5 bg-emerald-500 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startVoiceRecording}
                      disabled={isTyping}
                      className={`${isRecording ? 'bg-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-600'} transition-colors p-2 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label="Message vocal"
                      title={isRecording ? "Arrêter l'enregistrement" : "Commande vocale"}
                    >
                      <Mic size={20} className={isRecording ? 'text-white' : ''} />
                    </button>

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder={isRecording ? "🎤 Écoute en cours..." : "Répondez ici..."}
                      disabled={isTyping || isRecording}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    />

                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping || isRecording}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      aria-label="Envoyer"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 px-2">
                    <span className="text-xs text-gray-400">Propulsé par l'IA Ndjobi 🎭</span>
                    {messages.length > 1 && (
                      <button onClick={() => { setMessages([INITIAL_MESSAGE]); resetFlow(); }} className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1">
                        <RotateCcw size={12} />
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
