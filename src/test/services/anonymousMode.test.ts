import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { anonymousModeService } from '@/services/anonymousMode';

describe('AnonymousModeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('génère une phrase de récupération de 12 mots', () => {
    const phrase = anonymousModeService.generateRecoveryPhrase();
    const words = phrase.split(' ');
    
    expect(words).toHaveLength(12);
    expect(phrase).toBeTruthy();
  });

  it('crée une session anonyme avec UUID unique', () => {
    const session = anonymousModeService.generateAnonymousSession();
    
    expect(session.id).toBeTruthy();
    expect(session.recoveryPhrase).toBeTruthy();
    expect(session.recoveryPhrase.split(' ')).toHaveLength(12);
    expect(session.createdAt).toBeTruthy();
    expect(session.reports).toEqual([]);
    expect(session.projects).toEqual([]);
  });

  it('sauvegarde et récupère une session', () => {
    const session = anonymousModeService.generateAnonymousSession();
    const hasSession = anonymousModeService.hasActiveSession();
    
    expect(hasSession).toBe(true);
  });

  it('récupère une session avec la phrase correcte', () => {
    const session = anonymousModeService.generateAnonymousSession();
    const recoveryPhrase = session.recoveryPhrase;
    
    localStorage.clear();
    localStorage.setItem('ndjobi-anonymous-session', 'encrypted-data');
    localStorage.setItem('ndjobi-anonymous-session-id', session.id);
    
    const recovered = anonymousModeService.recoverSession(recoveryPhrase);
    
    expect(recovered).not.toBeNull();
  });

  it('valide correctement une phrase de récupération', () => {
    const validPhrase = 'soleil lune étoile montagne rivière océan forêt fleur oiseau papillon lion éléphant';
    const invalidPhrase = 'mot1 mot2 mot3';
    
    expect(anonymousModeService.validateRecoveryPhrase(validPhrase)).toBe(true);
    expect(anonymousModeService.validateRecoveryPhrase(invalidPhrase)).toBe(false);
  });

  it('ajoute des reports à la session', () => {
    anonymousModeService.generateAnonymousSession();
    anonymousModeService.addReport('report-123');
    
    const stats = anonymousModeService.getSessionStats();
    expect(stats?.reports).toBe(1);
  });

  it('ajoute des projets à la session', () => {
    anonymousModeService.generateAnonymousSession();
    anonymousModeService.addProject('project-456');
    
    const stats = anonymousModeService.getSessionStats();
    expect(stats?.projects).toBe(1);
  });

  it('exporte correctement une session', () => {
    anonymousModeService.generateAnonymousSession();
    anonymousModeService.addReport('report-1');
    anonymousModeService.addProject('project-1');
    
    const exported = anonymousModeService.exportSession();
    const data = JSON.parse(exported);
    
    expect(data.id).toBeTruthy();
    expect(data.recoveryPhrase).toBeTruthy();
    expect(data.reportsCount).toBe(1);
    expect(data.projectsCount).toBe(1);
  });

  it('nettoie correctement une session', () => {
    anonymousModeService.generateAnonymousSession();
    expect(anonymousModeService.hasActiveSession()).toBe(true);
    
    anonymousModeService.clearSession();
    expect(anonymousModeService.hasActiveSession()).toBe(false);
  });

  it('calcule correctement les statistiques de session', () => {
    anonymousModeService.generateAnonymousSession();
    anonymousModeService.addReport('report-1');
    anonymousModeService.addReport('report-2');
    anonymousModeService.addProject('project-1');
    
    const stats = anonymousModeService.getSessionStats();
    
    expect(stats).not.toBeNull();
    expect(stats?.reports).toBe(2);
    expect(stats?.projects).toBe(1);
    expect(stats?.daysActive).toBeGreaterThanOrEqual(0);
  });
});

