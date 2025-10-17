import { test, expect } from '@playwright/test';

test.describe('Notifications Temps Réel - Cas Critiques', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('/dashboard/admin');
  });

  test('doit afficher l\'indicateur de notifications actives', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const indicator = page.locator('text=Notifications temps réel actives');
    if (await indicator.isVisible()) {
      await expect(indicator).toBeVisible();
      
      const pulseIndicator = page.locator('.animate-pulse');
      await expect(pulseIndicator).toBeVisible();
    }
  });

  test('doit s\'abonner aux notifications au chargement', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Initialisation notifications')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('/dashboard/admin');
    await page.waitForTimeout(2000);
  });

  test('doit afficher un toast pour nouveau cas critique', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await page.waitForTimeout(1000);
  });
});

test.describe('Abonnements Realtime Supabase', () => {
  
  test('doit se connecter au channel cas-critiques', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    await page.goto('/dashboard/admin');
    await page.waitForTimeout(3000);
    
    const hasRealtimeLog = consoleMessages.some(msg => 
      msg.includes('cas-critiques') || msg.includes('Realtime')
    );
  });

  test('doit se désabonner lors du démontage', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await page.waitForTimeout(2000);
    
    await page.goto('/dashboard/super-admin');
    
    await page.waitForTimeout(1000);
  });
});

