import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { offlineService } from '@/services/offlineService';

describe('OfflineService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('détecte correctement le statut en ligne', () => {
    const isOnline = offlineService.isOnline();
    expect(typeof isOnline).toBe('boolean');
  });

  it('ajoute un élément à la queue', () => {
    const reportData = {
      type: 'extorsion',
      description: 'Test report',
      location: 'Libreville',
    };

    const actionId = offlineService.addToQueue('report', reportData);
    
    expect(actionId).toBeTruthy();
    expect(offlineService.getQueueSize()).toBe(1);
  });

  it('récupère les éléments de la queue', () => {
    offlineService.addToQueue('report', { test: 'data1' });
    offlineService.addToQueue('project', { test: 'data2' });
    
    const items = offlineService.getQueuedItems();
    
    expect(items).toHaveLength(2);
    expect(items[0].type).toBe('report');
    expect(items[1].type).toBe('project');
  });

  it('nettoie correctement la queue', () => {
    offlineService.addToQueue('report', { test: 'data' });
    expect(offlineService.getQueueSize()).toBe(1);
    
    offlineService.clearQueue();
    expect(offlineService.getQueueSize()).toBe(0);
  });

  it('sauvegarde le progrès d\'un formulaire', () => {
    const formData = {
      type: 'extorsion',
      description: 'Test description',
    };

    offlineService.saveFormProgress('report', 2, formData);
    const progress = offlineService.getFormProgress('report');
    
    expect(progress).not.toBeNull();
    expect(progress?.step).toBe(2);
    expect(progress?.data.type).toBe('extorsion');
  });

  it('efface le progrès d\'un formulaire', () => {
    offlineService.saveFormProgress('report', 1, { test: 'data' });
    expect(offlineService.getFormProgress('report')).not.toBeNull();
    
    offlineService.clearFormProgress('report');
    expect(offlineService.getFormProgress('report')).toBeNull();
  });

  it('retourne null pour un formulaire sans progrès sauvegardé', () => {
    const progress = offlineService.getFormProgress('project');
    expect(progress).toBeNull();
  });

  it('calcule correctement les statistiques de la queue', () => {
    offlineService.addToQueue('report', { test: 'data1' });
    offlineService.addToQueue('report', { test: 'data2' });
    offlineService.addToQueue('project', { test: 'data3' });
    
    const stats = offlineService.getQueueStats();
    
    expect(stats.total).toBe(3);
    expect(stats.reports).toBe(2);
    expect(stats.projects).toBe(1);
    expect(stats.oldestDate).toBeTruthy();
  });

  it('retourne le plus ancien élément de la queue', () => {
    offlineService.addToQueue('report', { test: 'old' });
    
    setTimeout(() => {
      offlineService.addToQueue('project', { test: 'new' });
    }, 10);

    const oldest = offlineService.getOldestQueuedItem();
    expect(oldest).not.toBeNull();
    expect(oldest?.type).toBe('report');
  });

  it('permet la soumission hors ligne', () => {
    const canSubmit = offlineService.canSubmitOffline();
    expect(canSubmit).toBe(true);
  });
});

