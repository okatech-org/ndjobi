import { v4 as uuidv4 } from 'uuid';

interface AnonymousSession {
  id: string;
  recoveryPhrase: string;
  createdAt: string;
  lastAccessed: string;
  reports: string[];
  projects: string[];
}

const STORAGE_KEY = 'ndjobi-anonymous-session';
const WORDLIST = [
  'soleil', 'lune', 'étoile', 'montagne', 'rivière', 'océan', 'forêt', 'fleur',
  'oiseau', 'papillon', 'lion', 'éléphant', 'aigle', 'dauphin', 'tigre', 'cheval',
  'arbre', 'pierre', 'nuage', 'vent', 'feu', 'eau', 'terre', 'ciel',
  'dragon', 'phénix', 'licorne', 'sirène', 'géant', 'fée', 'ange', 'démon',
  'sagesse', 'force', 'courage', 'paix', 'liberté', 'amour', 'espoir', 'joie',
  'maison', 'pont', 'route', 'ville', 'château', 'temple', 'jardin', 'port',
];

class AnonymousModeService {
  private encryptData(data: string, key: string): string {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  }

  private decryptData(encryptedData: string, key: string): string {
    try {
      const encrypted = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  }

  generateRecoveryPhrase(wordCount: number = 12): string {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * WORDLIST.length);
      words.push(WORDLIST[randomIndex]);
    }
    return words.join(' ');
  }

  generateAnonymousSession(): AnonymousSession {
    const session: AnonymousSession = {
      id: uuidv4(),
      recoveryPhrase: this.generateRecoveryPhrase(),
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      reports: [],
      projects: [],
    };

    this.saveSession(session);
    return session;
  }

  private saveSession(session: AnonymousSession): void {
    const encrypted = this.encryptData(
      JSON.stringify(session),
      session.recoveryPhrase
    );
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(`${STORAGE_KEY}-id`, session.id);
  }

  getSession(): AnonymousSession | null {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    const sessionId = localStorage.getItem(`${STORAGE_KEY}-id`);
    
    if (!encrypted || !sessionId) {
      return null;
    }

    return {
      id: sessionId,
      recoveryPhrase: '',
      createdAt: '',
      lastAccessed: new Date().toISOString(),
      reports: [],
      projects: [],
    };
  }

  recoverSession(recoveryPhrase: string): AnonymousSession | null {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    
    if (!encrypted) {
      return null;
    }

    try {
      const decrypted = this.decryptData(encrypted, recoveryPhrase);
      if (!decrypted) {
        return null;
      }

      const session: AnonymousSession = JSON.parse(decrypted);
      
      if (session.recoveryPhrase !== recoveryPhrase) {
        return null;
      }

      session.lastAccessed = new Date().toISOString();
      this.saveSession(session);
      
      return session;
    } catch (error) {
      console.error('Recovery error:', error);
      return null;
    }
  }

  addReport(reportId: string): void {
    const session = this.getFullSession();
    if (session) {
      session.reports.push(reportId);
      session.lastAccessed = new Date().toISOString();
      this.saveSession(session);
    }
  }

  addProject(projectId: string): void {
    const session = this.getFullSession();
    if (session) {
      session.projects.push(projectId);
      session.lastAccessed = new Date().toISOString();
      this.saveSession(session);
    }
  }

  private getFullSession(): AnonymousSession | null {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    const sessionId = localStorage.getItem(`${STORAGE_KEY}-id`);
    
    if (!encrypted || !sessionId) {
      return null;
    }

    try {
      const decrypted = this.decryptData(encrypted, sessionId);
      if (!decrypted) {
        return null;
      }
      return JSON.parse(decrypted);
    } catch (error) {
      return null;
    }
  }

  hasActiveSession(): boolean {
    return !!localStorage.getItem(`${STORAGE_KEY}-id`);
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}-id`);
  }

  getRecoveryPhraseWords(): string[] {
    return WORDLIST;
  }

  validateRecoveryPhrase(phrase: string): boolean {
    const words = phrase.toLowerCase().trim().split(/\s+/);
    
    if (words.length !== 12) {
      return false;
    }

    return words.every(word => WORDLIST.includes(word));
  }

  exportSession(): string {
    const session = this.getFullSession();
    if (!session) {
      throw new Error('No active session');
    }

    const exportData = {
      id: session.id,
      recoveryPhrase: session.recoveryPhrase,
      createdAt: session.createdAt,
      reportsCount: session.reports.length,
      projectsCount: session.projects.length,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  getSessionStats(): { reports: number; projects: number; daysActive: number } | null {
    const session = this.getFullSession();
    if (!session) {
      return null;
    }

    const createdDate = new Date(session.createdAt);
    const now = new Date();
    const daysActive = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      reports: session.reports.length,
      projects: session.projects.length,
      daysActive,
    };
  }
}

export const anonymousModeService = new AnonymousModeService();

