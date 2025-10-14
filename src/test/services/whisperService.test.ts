import { describe, it, expect, beforeEach } from 'vitest';
import { whisperService } from '@/services/ai/whisperService';

describe('WhisperService', () => {
  beforeEach(() => {
    global.fetch = undefined as unknown as typeof fetch;
  });

  it('est configuré correctement', () => {
    expect(whisperService.isConfigured()).toBeDefined();
  });

  it('transcrit un audio blob (mode mock)', async () => {
    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    const result = await whisperService.transcribeAudio(mockBlob);
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('language');
    expect(result.text).toBeTruthy();
    expect(result.language).toBe('fr');
  });

  it('formate correctement une transcription', () => {
    const rawText = 'ceci est un test sans ponctuation';
    const formatted = whisperService.formatTranscription(rawText);
    
    expect(formatted).toBe('Ceci est un test sans ponctuation.');
  });

  it('conserve la ponctuation existante', () => {
    const rawText = 'Ceci est déjà formaté !';
    const formatted = whisperService.formatTranscription(rawText);
    
    expect(formatted).toBe('Ceci est déjà formaté !');
  });

  it('combine plusieurs transcriptions correctement', async () => {
    const mockBlobs = [
      new Blob(['audio 1'], { type: 'audio/webm' }),
      new Blob(['audio 2'], { type: 'audio/webm' }),
    ];

    const results = await whisperService.batchTranscribe(mockBlobs);
    const combined = whisperService.combineTranscriptions(results);

    expect(results).toHaveLength(2);
    expect(combined).toBeTruthy();
    expect(combined.split(' ').length).toBeGreaterThan(5);
  });

  it('estime correctement le coût de transcription', () => {
    const cost60s = whisperService.estimateCost(60);
    const cost300s = whisperService.estimateCost(300);
    
    expect(cost60s).toBe(0.006);
    expect(cost300s).toBe(0.03);
  });
});

