import { test, expect } from '@playwright/test';

test.describe('iAsted - Assistant IA Présidentiel', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin');
  });

  test('doit afficher l\'onglet iAsted', async ({ page }) => {
    const iastedTab = page.locator('button:has-text("iAsted")');
    await expect(iastedTab).toBeVisible();
  });

  test('doit ouvrir l\'interface chatbot', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    await expect(page.locator('text=Assistant Intelligent - Vision Gabon 2025')).toBeVisible();
    await expect(page.locator('text=Actions rapides')).toBeVisible();
  });

  test('doit afficher le message de bienvenue', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    await expect(page.locator('text=Excellence, je suis iAsted')).toBeVisible();
  });

  test('doit afficher les actions rapides', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    await expect(page.locator('button:has-text("Résumé Quotidien")'))
.toBeVisible();
    await expect(page.locator('button:has-text("Patterns & Tendances")')).toBeVisible();
    await expect(page.locator('button:has-text("Prédiction Risques")')).toBeVisible();
    await expect(page.locator('button:has-text("Performance Sous-Admins")')).toBeVisible();
  });

  test('doit permettre d\'envoyer un message', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    const input = page.locator('input[placeholder*="Posez votre question"]');
    await input.fill('Bonjour iAsted');
    
    await page.click('button[aria-label="Send"], button:has(svg[class*="lucide-send"])');
    
    await expect(page.locator('text=Bonjour iAsted')).toBeVisible();
  });

  test('doit désactiver l\'envoi pendant le chargement', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    const input = page.locator('input[placeholder*="Posez votre question"]');
    await input.fill('Test');
    
    const sendButton = page.locator('button:has(svg[class*="lucide-send"])').first();
    await sendButton.click();
    
    await expect(sendButton).toBeDisabled();
  });

  test('doit afficher un loader pendant le traitement', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    await page.click('button:has-text("Résumé Quotidien")');
    
    await expect(page.locator('text=iAsted analyse les données')).toBeVisible({ timeout: 2000 });
  });

  test('doit permettre de réinitialiser la conversation', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    const resetButton = page.locator('button:has(svg[class*="lucide-refresh"])').first();
    await resetButton.click();
    
    await page.waitForTimeout(500);
  });

  test('doit afficher l\'heure des messages', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    const timeElements = page.locator('div:has-text(":")').filter({ hasText: /\d{2}:\d{2}/ });
    await expect(timeElements.first()).toBeVisible();
  });

  test('doit différencier messages user et assistant', async ({ page }) => {
    await page.click('button:has-text("iAsted")');
    
    const input = page.locator('input[placeholder*="Posez votre question"]');
    await input.fill('Test message');
    await page.click('button:has(svg[class*="lucide-send"])');
    
    const userMessage = page.locator('.bg-primary').filter({ hasText: 'Test message' });
    await expect(userMessage).toBeVisible({ timeout: 1000 });
  });
});

test.describe('iAsted - Actions Rapides', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin?view=iasted');
  });

  test('doit exécuter l\'action Résumé Quotidien', async ({ page }) => {
    await page.click('button:has-text("Résumé Quotidien")');
    
    await expect(page.locator('text=iAsted analyse les données')).toBeVisible({ timeout: 2000 });
  });

  test('doit exécuter l\'action Patterns', async ({ page }) => {
    await page.click('button:has-text("Patterns & Tendances")');
    
    await expect(page.locator('text=iAsted analyse les données')).toBeVisible({ timeout: 2000 });
  });

  test('doit exécuter l\'action Prédiction Risques', async ({ page }) => {
    await page.click('button:has-text("Prédiction Risques")');
    
    await expect(page.locator('text=iAsted analyse les données')).toBeVisible({ timeout: 2000 });
  });

  test('doit exécuter l\'action Performance Sous-Admins', async ({ page }) => {
    await page.click('button:has-text("Performance Sous-Admins")');
    
    await expect(page.locator('text=iAsted analyse les données')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('iAsted - Responsive', () => {
  
  test('doit être responsive sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/admin?view=iasted');
    
    await expect(page.locator('text=iAsted')).toBeVisible();
    await expect(page.locator('button:has-text("Résumé")')).toBeVisible();
  });

  test('doit scroller automatiquement vers le bas', async ({ page }) => {
    await page.goto('/dashboard/admin?view=iasted');
    
    for (let i = 0; i < 5; i++) {
      await page.fill('input[placeholder*="Posez"]', `Message ${i}`);
      await page.click('button:has(svg[class*="lucide-send"])');
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
  });
});

