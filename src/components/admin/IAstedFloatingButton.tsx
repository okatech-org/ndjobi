/**
 * Bouton flottant iAsted pour accès rapide depuis n'importe quelle page
 * Utilise le bouton sphérique avec animations organiques 3D
 * Intégration complète : mode texte et vocal, transcription, TTS
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, MessageSquare, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IAstedButton } from '@/components/ui/iAstedButton';
import { IAstedService } from '@/services/iAstedService';
import { IAstedVoiceService } from '@/services/iAstedVoiceService';
import { IAstedStorageService } from '@/services/iAstedStorageService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: 'voice' | 'text';
  audioUrl?: string;
}

export const IAstedFloatingButton = () => {
  const { role } = useAuth();
  
  // États - TOUS les hooks doivent être appelés avant tout return conditionnel
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(uuidv4());
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  
  // États pour le drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    // Charger la position sauvegardée ou position par défaut
    const saved = localStorage.getItem('iasted-button-position');
    if (saved) {
      return JSON.parse(saved);
    }
    // Position responsive : en bas à droite avec marges adaptées à l'écran
    const isMobile = window.innerWidth < 768;
    const buttonSize = 60; // taille approximative du bouton
    const margin = isMobile ? 20 : 40;
    return { 
      x: window.innerWidth - margin - buttonSize/2, 
      y: window.innerHeight - margin - buttonSize/2 
    };
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const micPermissionGrantedRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);
  const lastRequestedAdminRef = useRef<any>(null);
  // Parole longue fluide (chunking + pauses courtes)
  const speakLongText = useCallback(async (fullText: string) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const voices = speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang?.toLowerCase().startsWith('fr')) || voices.find(v => /french|français/i.test(v.name));
    const sentences = fullText.replace(/\s+/g, ' ').split(/(?<=[\.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let buf = '';
    for (const s of sentences) {
      if ((buf + ' ' + s).trim().length > 260) { chunks.push(buf.trim()); buf = s; } else { buf = (buf + ' ' + s).trim(); }
    }
    if (buf) chunks.push(buf.trim());
    for (const c of chunks) {
      await new Promise<void>((resolve)=>{
        const u = new SpeechSynthesisUtterance(c);
        u.lang = 'fr-FR'; u.rate = 0.95; u.pitch = 1.0; u.volume = 1.0; if (fr) u.voice = fr;
        u.onend = ()=> setTimeout(resolve, 120); u.onerror = ()=> setTimeout(resolve, 120);
        speechSynthesis.speak(u);
      });
    }
  }, []);

  // Génère un rapport vocal de secours structuré (~1–3 min) basé sur métadonnées connues
  const buildFallbackReport = useCallback((admin: any): string => {
    const org = admin?.organization || "l'administration";
    const nom = admin?.nom || admin?.name || "l'agent concerné";
    const taux = (admin?.taux || admin?.taux_succes)
      ? `${Math.round((admin?.taux || admin?.taux_succes) as number)}%`
      : 'non communiqué';
    const cas = admin?.casTraites || admin?.cas_traites || admin?.totalCas || 'plusieurs cas';
    const delai = admin?.delaiMoyen || admin?.delai_moyen || 'quelques jours';
    const classification = admin?.classification || '';
    const isServiceSecurite = admin?.type_service === 'securite_nationale';

    // **RAPPORT VOCAL SERVICES SPÉCIAUX - TON MILITAIRE/FORMEL**
    if (isServiceSecurite) {
      const intro = `Monsieur le Président, rapport de sécurité nationale du ${org}. Classification ${classification}.`;
      
      const menaces = (() => {
        switch (org) {
          case 'DGSS':
            return `Trois menaces critiques actives. Première: réseau corruption systémique haute administration. Sept hauts fonctionnaires sous surveillance. Preuves en consolidation. Impact: quarante-cinq milliards F C F A estimés. Deuxième: infiltration criminalité organisée transnationale. Agent infiltré opérationnel. Connexions trois pays limitrophes confirmées. Flux: huit milliards annuels. Troisième: menace sécurité intérieure nécessitant coordination renforcée DGSS-DGR-Défense.`;
          case 'DGR':
            return `Deux menaces majeures identifiées. Première: ingérence économique étrangère secteur extractif. Puissance hostile ciblant décideurs. Perte potentielle: quatre-vingts milliards sur cinq ans. Sources HUMINT confirmées niveau élevé. Deuxième: veille corruption secteur pétrolier. Quatre sources actives. Analyses financières en cours. Potentiel: vingt-cinq milliards.`;
          case 'Défense Nationale':
            return `Menace cyber critique installations militaires. Huit sites vulnérables. Tentatives intrusions réseau FAG confirmées. Systèmes obsolètes. Contre-mesures déployées urgence. Coût remédiation: trois virgule cinq milliards. Formation cent pour cent personnel requise.`;
          case 'Intérieur':
            return `Quatre réseaux criminalité transnationale actifs frontières. Trafics: armes, drogues, êtres humains, bois précieux. Vingt-trois agents frontaliers compromis. Pertes État: dix-huit milliards annuels. Surveillance anti-terrorisme: cinq individus radicalisés sous monitoring. Coordination DGSS active.`;
          case 'Affaires Étrangères':
            return `Menace réputation internationale. Indices transparence en recul. Cent vingt-huit sur cent quatre-vingts. Huit places perdues deux ans. Impact: quatre cent cinquante millions euros aides suspendues. Investisseurs étrangers réticents. Enquête internationale corruption diplomatique active. Coordination Interpol. Allégations trois milliards.`;
          default:
            return `Menaces sectorielles identifiées. Surveillance active maintenue.`;
        }
      })();
      
      const operations = `Sur le plan opérationnel: ${cas} opérations menées, taux succès ${taux}, délai moyen ${delai} jours. Coordination interservices: réunions hebdomadaires actives.`;
      
      const reco = (() => {
        switch (org) {
          case 'DGSS':
          case 'DGR':
            return `Trois recommandations présidentielles urgentes. Première: renforcement moyens humains techniques. Besoin: huit cents agents renseignement. Budget: deux virgule huit milliards. Délai: douze mois. Impact: efficacité opérationnelle accrue. Deuxième: coordination interservices renforcée. Cellule DGSS-DGR-Défense temps réel. Budget: quatre cent cinquante millions. Six mois. Troisième: cadre juridique anticorruption. Tribunaux spécialisés. Dix-huit mois. Six cent quatre-vingts millions.`;
          default:
            return `Recommandations: renforcement capacités opérationnelles. Coordination nationale. Réformes juridiques. Budgets détaillés disponibles briefing approfondi.`;
        }
      })();
      
      const cloture = `Situation sécuritaire: ${taux > 75 ? 'maîtrisée, vigilance maintenue' : taux > 60 ? 'préoccupante, surveillance renforcée nécessaire' : 'critique, action présidentielle urgente requise'}. Points décision disponibles. Je reste à disposition pour briefing approfondi. Fin de rapport. ${classification}.`;
      
      return [intro, menaces, operations, reco, cloture].filter(Boolean).join(' ');
    }

    // **RAPPORT VOCAL STANDARD - Agents, Citoyens**
    const mentionPeche = /pêche|mer|économie bleue/i.test(String(org))
      ? `Point urgent: un dossier prioritaire est signalé dans le secteur de la pêche et des mers. Les risques portent sur des détournements possibles et des failles de contrôle. Une coordination rapide avec la gendarmerie maritime et la justice est requise sous 72 heures.`
      : '';
    const intro = `Excellence, voici un rapport clair et utile pour ${org}.`;
    const perf = `Sans détailler les tableaux, la lecture est la suivante: ${cas} dossiers traités récemment, un succès moyen de ${taux}, pour un délai autour de ${delai}.`;
    const lecture = `En pratique, l'activité tient, mais trois nœuds freinent la performance: vérification des pièces, présence opérationnelle sur le terrain, et partage d'information entre services.`;
    const problemes = `Problématiques prioritaires: affaires à fort enjeu financier justifiant un suivi rapproché; retards causés par la coordination; besoin d'appui logistique ciblé.`;
    const reco = `Mes recommandations: 1) Filtre de conformité a priori sur dossiers risqués; 2) Triage des cas par impact public pour concentrer l'effort; 3) Point focal transversal pour synchroniser maritime, justice et administration; 4) Renforcement outillage et formation, avec un jalon de suivi à quinze jours.`;
    const cloture = `Je propose un court point en fin de semaine pour valider les avancées et lever les obstacles. Fin de rapport.`;
    return [intro, mentionPeche, perf, lecture, problemes, reco, cloture].filter(Boolean).join(' ');
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Événement pour rapport vocal automatique (BYPASS du double-clic)
  useEffect(() => {
    const onOpenVoiceReport = (e: CustomEvent) => {
      const admin = (e.detail && (e.detail as any).admin) || null;
      lastRequestedAdminRef.current = admin;

      (async () => {
        try {
          console.log('🎙️ RAPPORT VOCAL AUTOMATIQUE DÉCLENCHÉ - BYPASS double-clic');
          
          // 1. Débloquer l'audio immédiatement (user gesture)
          await unlockAudioIfNeeded();
          
          // 2. Forcer le déblocage audio avec interaction utilisateur
          if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
          }

          // 3. Indicateur visuel que le rapport vocal démarre
          setIsSpeaking(true);

          // 4. Démarrer directement la parole SANS ouvrir le modal
          const org = admin?.organization || "l'administration concernée";
          const intro = `J'analyse la situation de ${org}. Je passe en revue les cas, la performance, les problématiques et les recommandations.`;
          
          // 5. Parler immédiatement avec TTS local (plus fiable)
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel(); // Nettoyer la file
            const utterance = new SpeechSynthesisUtterance(intro);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Sélectionner voix française
            const voices = speechSynthesis.getVoices();
            const frenchVoice = voices.find(v => v.lang?.toLowerCase().startsWith('fr')) || 
                               voices.find(v => /french|français/i.test(v.name));
            if (frenchVoice) utterance.voice = frenchVoice;
            
            // Parler et attendre la fin
            await new Promise<void>((resolve) => {
              utterance.onend = () => resolve();
              utterance.onerror = () => resolve(); // Continuer même en cas d'erreur
              speechSynthesis.speak(utterance);
            });
          }

          // 6. Transition vers traitement IA
          setIsSpeaking(false);
          setIsProcessing(true);

          // 7. Générer et parler le rapport complet
          const isServiceSecurite = admin?.type_service === 'securite_nationale';
          const classification = admin?.classification || '';
          
          const autoPrompt = isServiceSecurite
            ? `Génère un rapport de SÉCURITÉ NATIONALE vocal pour ${org}. Classification: ${classification}. Structure MILITAIRE formelle: 1) Introduction avec classification, 2) Menaces stratégiques critiques actives (détails concrets: acteurs, montants, sources renseignement), 3) Opérations en cours et succès récents, 4) Recommandations présidentielles urgentes avec budgets et délais précis, 5) Conclusion avec niveau menace et points décision. Ton: FORMEL, FACTUEL, MILITAIRE, CHIFFRÉ. Durée: 2-3 minutes. En français.`
            : `Génère un rapport vocal synthétique et structuré pour ${org}. Inclure: performance récente, cas en cours marquants, problématiques critiques avec impacts, et recommandations présidentielles actionnables à court terme. Style: présidentiel, clair, concis, en français, avec enchaînement naturel à l'oral.`;

          // 8. Appeler l'IA et parler la réponse, avec TIMEOUT 3s + fallback local
          const timeoutMs = 3000;
          const timeoutPromise = new Promise<{response: string}>((resolve) => {
            setTimeout(() => resolve({ response: buildFallbackReport(lastRequestedAdminRef.current) }), timeoutMs);
          });

          const aiPromise = IAstedService.sendMessage(autoPrompt, []);
          const result = await Promise.race([aiPromise, timeoutPromise]) as {response: string};

          if (result && result.response) {
            // Passer en mode parole pour la réponse finale
            setIsProcessing(false);
            setIsSpeaking(true);
            
            await speakLongText(result.response);
            setIsSpeaking(false);
          } else {
            setIsProcessing(false);
          }

        } catch (err) {
          console.error('Erreur rapport vocal iAsted:', err);
          setIsSpeaking(false);
          setIsProcessing(false);
        }
      })();
    };

    window.addEventListener('iasted:open-voice-report', onOpenVoiceReport as any);
    return () => window.removeEventListener('iasted:open-voice-report', onOpenVoiceReport as any);
  }, []);

  // Gestion du drag and drop
  const handleMouseDown = (e: React.MouseEvent) => {
    // Empêcher le drag si on clique pour ouvrir/interagir
    if (e.button !== 0) return; // Seulement bouton gauche
    
    hasDraggedRef.current = false;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    hasDraggedRef.current = false;
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      hasDraggedRef.current = true;
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 80));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      hasDraggedRef.current = true;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(touch.clientX - dragStart.x, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(touch.clientY - dragStart.y, window.innerHeight - 80));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Sauvegarder la position
      localStorage.setItem('iasted-button-position', JSON.stringify(position));
      
      // Réinitialiser le flag de drag après un court délai
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem('iasted-button-position', JSON.stringify(position));
      
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, position]);

  // Gérer le redimensionnement de la fenêtre pour garder le bouton visible
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const buttonSize = 60;
      const margin = isMobile ? 20 : 40;
      
      // Vérifier si le bouton est hors de l'écran
      const maxX = window.innerWidth - margin;
      const maxY = window.innerHeight - margin;
      
      setPosition(prev => ({
        x: Math.min(prev.x, maxX),
        y: Math.min(prev.y, maxY)
      }));
    };

    window.addEventListener('resize', handleResize);
    // Vérifier aussi au montage
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  /**
   * GESTION DES CLICS
   * Simple clic : Mode texte
   * Double clic : Mode vocal
   */
  const handleButtonClick = () => {
    // Ne pas traiter le clic si on vient de drag
    if (hasDraggedRef.current) {
      console.log('🚫 Clic ignoré car on vient de drag');
      return;
    }
    
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        handleSingleClick();
      } else if (clickCountRef.current >= 2) {
        handleDoubleClick();
      }
      clickCountRef.current = 0;
    }, 350); // Fenêtre élargie pour détecter le double-clic
  };

  /**
   * Simple clic : Mode texte
   */
  const handleSingleClick = () => {
    console.log('📝 Mode texte activé');
    setIsOpen(true);
    setMode('text');
    
    if (messages.length === 0) {
      addAssistantMessage(
        "Excellence, je suis iAsted, votre assistant IA présidentiel. Comment puis-je vous aider ?",
        'text'
      );
    }
  };

  // Débloquer la lecture audio via un court bip (politique d'autoplay)
  const primeAudio = async () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      await ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.05);
      setTimeout(() => ctx.close(), 120);
    } catch (e) {
      console.warn('Prime audio failed:', e);
    }
  };

  const unlockAudioIfNeeded = async () => {
    if (audioUnlockedRef.current) return;
    await primeAudio();
    audioUnlockedRef.current = true;
  };

  /**
   * Vérifier et demander l'accès micro une seule fois
   */
  const ensureMicrophoneAccess = async (): Promise<boolean> => {
    // Si déjà accordé dans cette session, ne pas redemander
    if (micPermissionGrantedRef.current) {
      console.log('✅ Micro: accès déjà accordé dans cette session');
      return true;
    }

    try {
      // Vérifier l'état de la permission via l'API Permissions
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('🎤 État permission micro:', permissionStatus.state);
        
        if (permissionStatus.state === 'granted') {
          micPermissionGrantedRef.current = true;
          return true;
        } else if (permissionStatus.state === 'denied') {
          toast({
            title: 'Microphone bloqué',
            description: 'Veuillez autoriser l\'accès au microphone dans les paramètres du navigateur',
            variant: 'destructive'
          });
          return false;
        }
      }

      // Si l'état est 'prompt' ou API non disponible, demander l'accès
      console.log('🎤 Demande d\'accès au microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      micPermissionGrantedRef.current = true;
      console.log('✅ Accès micro accordé et mémorisé');
      return true;

    } catch (error: any) {
      console.error('❌ Erreur accès microphone:', error);
      toast({
        title: 'Microphone requis',
        description: 'Veuillez autoriser l\'accès au microphone pour utiliser la fonction vocale',
        variant: 'destructive'
      });
      return false;
    }
  };

  /**
   * Double clic : Mode vocal
   */
  const handleDoubleClick = async () => {
    console.log('🎙️ Mode vocal activé - Double clic détecté');

    // Débloquer l'audio immédiatement (user gesture)
    await unlockAudioIfNeeded();
    
    // Si déjà ouvert en mode texte, basculer vers vocal
    if (isOpen && mode === 'text') {
      await switchToVoice();
      return;
    }

    // Démarrer en mode vocal sans ouvrir l'interface
    setMode('voice');

    // Vérifier/demander l'accès micro (une seule fois)
    const hasMic = await ensureMicrophoneAccess();
    if (!hasMic) {
      return;
    }

    // Saluer puis lancer l'écoute
    await speakGreeting();
    await startVoiceInteraction();
  };

  /**
   * Message de salutation selon l'heure
   */
  const speakGreeting = async () => {
    await unlockAudioIfNeeded();
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    
    if (hour >= 18 || hour < 6) {
      greeting = 'Bonsoir';
    }
    
    const greetingText = `${greeting} Excellence. Je suis iAsted, votre assistant présidentiel. Comment puis-je vous aider aujourd'hui ?`;
    addAssistantMessage(greetingText, 'voice');

    // 1) Essayer TTS local pour être instantané (plus fiable pour la salutation)
    if ('speechSynthesis' in window) {
      try {
        // Petite annulation pour s'assurer que la file est propre
        speechSynthesis.cancel();
        const ensureVoices = () => new Promise<void>((res) => {
          const v = speechSynthesis.getVoices();
          if (v && v.length) return res();
          const onVoices = () => { speechSynthesis.removeEventListener('voiceschanged', onVoices); res(); };
          speechSynthesis.addEventListener('voiceschanged', onVoices);
          setTimeout(() => { speechSynthesis.removeEventListener('voiceschanged', onVoices); res(); }, 800);
        });
        await ensureVoices();

        const u = new SpeechSynthesisUtterance(greetingText);
        u.lang = 'fr-FR';
        u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
        const voices = speechSynthesis.getVoices();
        const fr = voices.find(v => v.lang?.toLowerCase().startsWith('fr')) || voices.find(v => /fr|french/i.test(v.name));
        if (fr) u.voice = fr;
        await new Promise<void>((resolve) => { u.onend = () => resolve(); speechSynthesis.speak(u); });
        return; // Salutation OK, on sort
      } catch (e) {
        console.warn('Local TTS failed, fallback to ElevenLabs:', e);
      }
    }

    // 2) Fallback sur ElevenLabs via edge function
    setIsSpeaking(true);
    const result = await IAstedVoiceService.speakText(greetingText);
    setIsSpeaking(false);

    if (!result?.success) {
      toast({
        title: 'Audio bloqué',
        description: "Le son a été bloqué. Activez le son du navigateur.",
        variant: 'destructive'
      });
      return;
    }
  };

  /**
   * Message de bienvenue vocal
   */
  const speakWelcomeMessage = async () => {
    const welcomeText = "Excellence, que puis-je faire pour vous ?";
    
    addAssistantMessage(welcomeText, 'voice');
    
    setIsSpeaking(true);
    const result = await IAstedVoiceService.speakText(welcomeText);
    setIsSpeaking(false);

    if (!result?.success) {
      console.warn('Aucune sortie audio détectée pour le message de bienvenue');
      toast({
        title: 'Audio bloqué',
        description: "Activez le son du navigateur puis réessayez (double-clic).",
        variant: 'destructive'
      });
      return;
    }

    if (result.audioUrl) {
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].audioUrl = result.audioUrl;
        }
        return updated;
      });
    }
  };

  /**
   * Démarrer interaction vocale avec détection de silence
   */
  const startVoiceInteraction = async () => {
    try {
      setIsListening(true);
      
      console.log('🎙️ Démarrage de l\'enregistrement avec détection de silence...');

      const startResult = await IAstedVoiceService.startRecording();
      
      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      console.log('✅ Enregistrement démarré avec détection automatique');

      // Sécurité: arrêt auto après 15s si aucune fin détectée
      if (silenceTimer) clearTimeout(silenceTimer as any);
      const t = setTimeout(() => {
        if (isListening) {
          console.log('⏱️ Sécurité: arrêt automatique après 15s');
          stopVoiceInteraction();
        }
      }, 15000);
      setSilenceTimer(t as any);

      // Démarrer la détection de silence
      startSilenceDetection();

    } catch (error: any) {
      console.error('❌ Erreur interaction vocale:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
      setIsListening(false);
    }
  };

  /**
   * Détection automatique de silence avec VAD amélioré
   */
  const startSilenceDetection = () => {
    try {
      const stream = IAstedVoiceService.getCurrentStream?.() ?? (IAstedVoiceService as any).stream;
      if (!stream) {
        console.warn('SilenceDetection: aucun stream micro disponible');
        return;
      }

      const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      setAudioAnalyser(analyser);

      // VAD amélioré avec seuils adaptatifs
      const bufferLength = analyser.fftSize;
      const floatData = new Float32Array(bufferLength);
      
      let silenceDuration = 0;
      let hadSpeech = false;
      let speechStartTime = 0;
      let maxRMS = 0; // Niveau maximal détecté pour s'adapter au volume
      
      // Seuils adaptatifs
      let RMS_SILENCE = 0.01;   // Seuil initial de silence
      let RMS_SPEECH = 0.018;    // Seuil initial d'activation
      const MIN_SPEECH_DURATION = 500; // Minimum 500ms de parole avant de considérer la fin
      const SILENCE_DURATION = 800; // 800ms de silence pour terminer (plus réactif)
      const ADAPTIVE_FACTOR = 0.15; // Facteur d'adaptation

      // Smoother pour éviter les faux positifs
      analyser.smoothingTimeConstant = 0.2;

      const checkAudioLevel = async () => {
        if (!isListening) return;

        try { await audioCtxRef.current?.resume(); } catch {}

        analyser.getFloatTimeDomainData(floatData);

        // Calculer RMS (Root Mean Square)
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const s = floatData[i];
          sumSquares += s * s;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Adapter les seuils selon le niveau maximal détecté
        if (rms > maxRMS) {
          maxRMS = rms;
          RMS_SPEECH = Math.max(0.015, maxRMS * ADAPTIVE_FACTOR);
          RMS_SILENCE = RMS_SPEECH * 0.5;
          console.log(`📊 Seuils adaptés: Parole=${RMS_SPEECH.toFixed(4)}, Silence=${RMS_SILENCE.toFixed(4)}`);
        }

        // Détection de parole
        if (rms > RMS_SPEECH) {
          if (!hadSpeech) {
            console.log('🗣️ Parole détectée - Début d\'énoncé');
            hadSpeech = true;
            speechStartTime = Date.now();
          }
          silenceDuration = 0;
        } 
        // Détection de silence après parole
        else if (hadSpeech && rms < RMS_SILENCE) {
          const speechDuration = Date.now() - speechStartTime;
          
          // Ne compter le silence que si on a eu assez de parole
          if (speechDuration >= MIN_SPEECH_DURATION) {
            silenceDuration += 100;
            
            // Afficher progression du silence
            if (silenceDuration % 200 === 0) {
              console.log(`🔇 Silence: ${silenceDuration}ms / ${SILENCE_DURATION}ms`);
            }
            
            if (silenceDuration >= SILENCE_DURATION) {
              console.log('✅ Fin de parole détectée - Traitement...');
              stopVoiceInteraction();
              return;
            }
          }
        }
        // Bruit ambiant (ni parole ni silence)
        else if (hadSpeech && rms >= RMS_SILENCE && rms <= RMS_SPEECH) {
          // Zone grise : ne pas incrémenter le silence si c'est juste après la parole
          const timeSinceSpeech = Date.now() - speechStartTime;
          if (timeSinceSpeech > MIN_SPEECH_DURATION) {
            silenceDuration += 50; // Incrément plus lent dans la zone grise
          }
        }

        setTimeout(checkAudioLevel, 100);
      };

      checkAudioLevel();
    } catch (error) {
      console.error('Erreur détection silence:', error);
    }
  };

  /**
   * Arrêter interaction vocale et traiter la réponse
   */
  const stopVoiceInteraction = async () => {
    console.log('🛑 Arrêt de l\'enregistrement...');
    setIsListening(false);
    setIsProcessing(true);

    // Nettoyage de l'analyseur audio
    if (audioAnalyser) {
      audioAnalyser.disconnect();
      setAudioAnalyser(null);
    }
    if (audioCtxRef.current) {
      try { await audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer as any);
      setSilenceTimer(null);
    }

    try {
      const result = await IAstedVoiceService.stopRecordingAndTranscribe();

      if (!result || !result.transcription) {
        console.warn('⚠️ Aucune transcription détectée');
        setIsProcessing(false);
        return;
      }

      console.log('📝 Transcription reçue:', result.transcription);

      // Message de transition immédiat avec parole
      const transitionMessage = "Bien Excellence, laissez-moi réfléchir...";
      addAssistantMessage(transitionMessage, 'voice');
      
      // Parler le message de transition et attendre la fin
      setIsSpeaking(true);
      console.log('💬 iAsted parle (transition)...');
      await IAstedVoiceService.speakText(transitionMessage);
      setIsSpeaking(false);
      
      // Passer au traitement (cerveau)
      console.log('🧠 iAsted réfléchit...');
      setIsProcessing(true);

      // Obtenir la réponse IA
      await getAIResponse(result.transcription, 'voice');

    } catch (error: any) {
      console.error('❌ Erreur traitement vocal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter votre message vocal',
        variant: 'destructive'
      });
      setIsProcessing(false);
      setIsSpeaking(false);
    }
  };

  /**
   * Envoyer message texte
   */
  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      mode: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    setIsProcessing(true);
    await getAIResponse(inputText, 'text');
    setIsProcessing(false);
  };

  /**
   * Obtenir réponse IA
   */
  const getAIResponse = async (
    userQuestion: string,
    interactionMode: 'voice' | 'text'
  ) => {
    console.log('🤖 Demande à l\'IA...', { userQuestion, interactionMode });
    const startTime = Date.now();

    try {
      const result = await IAstedService.sendMessage(
        userQuestion,
        messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        }))
      );

      if (result.error) {
        throw new Error(result.error);
      }

      const responseTime = Date.now() - startTime;
      console.log(`✅ Réponse IA reçue en ${responseTime}ms`);

      let assistantAudioUrl: string | undefined;

      if (interactionMode === 'voice') {
        // Terminer le traitement et passer à la parole
        setIsProcessing(false);
        setIsSpeaking(true);
        console.log('💬 iAsted parle (réponse finale)...');
        
        const ttsResult = await IAstedVoiceService.speakText(result.response || '');
        
        console.log('✅ Réponse vocale terminée');
        setIsSpeaking(false);

        if (ttsResult.audioUrl && ttsResult.audioBlob) {
          const upload = await IAstedStorageService.uploadAudio(
            ttsResult.audioBlob,
            'assistant-response.mp3'
          );
          assistantAudioUrl = upload?.url;
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response || '',
        timestamp: new Date(),
        mode: interactionMode,
        audioUrl: assistantAudioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      const context = {
        timestamp: new Date().toISOString(),
        sessionId
      };

      await IAstedStorageService.saveConversation({
        session_id: sessionId,
        mode: interactionMode,
        user_message: userQuestion,
        user_message_transcription: interactionMode === 'voice' ? userQuestion : undefined,
        assistant_message: result.response || '',
        assistant_audio_url: assistantAudioUrl,
        context_data: context,
        response_time_ms: responseTime
      });

    } catch (error: any) {
      console.error('❌ Erreur réponse IA:', error);
      setIsProcessing(false);
      setIsSpeaking(false);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  /**
   * Ajouter message assistant
   */
  const addAssistantMessage = (content: string, mode: 'voice' | 'text') => {
    const message: Message = {
      role: 'assistant',
      content,
      timestamp: new Date(),
      mode
    };
    setMessages(prev => [...prev, message]);
  };

  /**
   * Basculer vers vocal
   */
  const switchToVoice = async () => {
    console.log('🔄 Basculement vers mode vocal');
    setMode('voice');
    await unlockAudioIfNeeded();
    
    // Vérifier/demander l'accès micro (une seule fois)
    const hasMic = await ensureMicrophoneAccess();
    if (!hasMic) {
      return;
    }
    
    // Message de transition si déjà des messages
    if (messages.length > 0) {
      await speakWelcomeMessage();
    }
    
    await startVoiceInteraction();
  };

  // Vérifier si l'utilisateur a accès à iAsted (super_admin, admin, sub_admin uniquement)
  // Cette vérification doit être APRÈS tous les hooks
  const hasIAstedAccess = role && ['super_admin', 'admin', 'sub_admin'].includes(role);
  
  // Ne pas afficher le bouton si l'utilisateur n'a pas accès
  if (!hasIAstedAccess) {
    return null;
  }

  return (
    <>
      {/* BOUTON SPHÉRIQUE DÉPLAÇABLE */}
      <div 
        ref={buttonRef}
        className="fixed z-[99999] cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          // Empêcher le clic si on vient de drag
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          unlockAudioIfNeeded();
        }}
      >
        <IAstedButton 
          onClick={handleButtonClick}
          size="md"
          voiceListening={isListening}
          voiceSpeaking={isSpeaking}
          voiceProcessing={isProcessing}
          isInterfaceOpen={isOpen}
        />
      </div>

      {/* INTERFACE CHAT */}
      {isOpen && (
        <Card 
          className="fixed w-[400px] h-[600px] shadow-2xl z-[99998] flex flex-col max-w-[calc(100vw-2rem)] md:w-[400px]"
          style={{
            // Positionner le chat à gauche du bouton si possible, sinon à droite
            left: position.x > window.innerWidth / 2 
              ? `${position.x - 420}px` 
              : `${position.x + 80}px`,
            top: `${Math.max(10, Math.min(position.y - 300, window.innerHeight - 610))}px`,
            transition: isDragging ? 'none' : 'all 0.3s ease-out'
          }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">iAsted</h3>
                <p className="text-xs text-white/80">Assistant IA Présidentiel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mode === 'voice' ? 'default' : 'secondary'}>
                {mode === 'voice' ? '🎙️ Vocal' : '📝 Texte'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {/* Masquer l'audio de l'utilisateur pour plus de fluidité */}
                  {msg.audioUrl && msg.role === 'assistant' && (
                    <audio controls className="mt-2 w-full" src={msg.audioUrl} />
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicateurs */}
            {isListening && (
              <div className="flex items-center gap-2 text-purple-600">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-sm">En écoute...</span>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-blue-600">
                <MessageSquare className="h-4 w-4 animate-pulse" />
                <span className="text-sm">iAsted parle...</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Traitement...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone input */}
          <div className="p-4 border-t">
            {mode === 'text' ? (
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Tapez votre message..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendText}
                  disabled={!inputText.trim() || isProcessing}
                  size="icon"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  onClick={switchToVoice}
                  variant="outline"
                  size="icon"
                  title="Basculer en mode vocal"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={isListening ? stopVoiceInteraction : startVoiceInteraction}
                  disabled={isProcessing || isSpeaking}
                  className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Arrêter l'écoute
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Commencer à parler
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setMode('text')}
                  variant="outline"
                  size="sm"
                >
                  Basculer en mode texte
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default IAstedFloatingButton;
