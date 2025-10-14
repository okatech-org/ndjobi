interface QueuedAction {
  id: string;
  type: 'report' | 'project';
  data: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

class OfflineService {
  private readonly STORAGE_KEY = 'ndjobi-offline-queue';
  private readonly MAX_RETRIES = 3;
  private syncInProgress = false;

  isOnline(): boolean {
    return navigator.onLine;
  }

  addToQueue(type: 'report' | 'project', data: Record<string, unknown>): string {
    const queue = this.getQueue();
    const action: QueuedAction = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    queue.push(action);
    this.saveQueue(queue);
    
    console.log(`Added ${type} to offline queue:`, action.id);
    return action.id;
  }

  private getQueue(): QueuedAction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  }

  private saveQueue(queue: QueuedAction[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  getQueuedItems(): QueuedAction[] {
    return this.getQueue();
  }

  getQueueSize(): number {
    return this.getQueue().length;
  }

  async syncQueue(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    if (!this.isOnline()) {
      console.log('Cannot sync while offline');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    const queue = this.getQueue();
    const results = { success: 0, failed: 0 };

    for (const action of queue) {
      try {
        const success = await this.syncAction(action);
        
        if (success) {
          results.success++;
          this.removeFromQueue(action.id);
        } else {
          action.retries++;
          if (action.retries >= this.MAX_RETRIES) {
            results.failed++;
            this.removeFromQueue(action.id);
            console.error(`Action ${action.id} failed after ${this.MAX_RETRIES} retries`);
          } else {
            this.updateActionRetries(action.id, action.retries);
          }
        }
      } catch (error) {
        console.error(`Error syncing action ${action.id}:`, error);
        results.failed++;
      }
    }

    this.syncInProgress = false;
    console.log('Sync completed:', results);
    return results;
  }

  private async syncAction(action: QueuedAction): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Syncing ${action.type}:`, action.id);
    
    return true;
  }

  private removeFromQueue(actionId: string): void {
    const queue = this.getQueue().filter(a => a.id !== actionId);
    this.saveQueue(queue);
  }

  private updateActionRetries(actionId: string, retries: number): void {
    const queue = this.getQueue().map(a => 
      a.id === actionId ? { ...a, retries } : a
    );
    this.saveQueue(queue);
  }

  clearQueue(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Offline queue cleared');
  }

  setupAutoSync(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored. Starting auto-sync...');
      setTimeout(() => this.syncQueue(), 1000);
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost. Entering offline mode.');
    });

    if (this.isOnline() && this.getQueueSize() > 0) {
      setTimeout(() => this.syncQueue(), 2000);
    }
  }

  getOldestQueuedItem(): QueuedAction | null {
    const queue = this.getQueue();
    if (queue.length === 0) return null;
    
    return queue.reduce((oldest, current) => 
      new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
    );
  }

  getQueueStats(): { total: number; reports: number; projects: number; oldestDate: string | null } {
    const queue = this.getQueue();
    const oldest = this.getOldestQueuedItem();

    return {
      total: queue.length,
      reports: queue.filter(a => a.type === 'report').length,
      projects: queue.filter(a => a.type === 'project').length,
      oldestDate: oldest ? oldest.timestamp : null,
    };
  }

  canSubmitOffline(): boolean {
    return true;
  }

  saveFormProgress(formType: 'report' | 'project', step: number, data: Record<string, unknown>): void {
    const key = `ndjobi-${formType}-progress`;
    const progress = {
      step,
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(progress));
  }

  getFormProgress(formType: 'report' | 'project'): { step: number; data: Record<string, unknown> } | null {
    const key = `ndjobi-${formType}-progress`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  clearFormProgress(formType: 'report' | 'project'): void {
    const key = `ndjobi-${formType}-progress`;
    localStorage.removeItem(key);
  }
}

export const offlineService = new OfflineService();

