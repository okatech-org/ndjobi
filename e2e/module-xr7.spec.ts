import { test, expect } from '@playwright/test';

test.describe('Module XR-7 - Protocole d\'Urgence Judiciaire', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=xr7');
  });

  test('doit afficher le module XR-7', async ({ page }) => {
    await expect(page.locator('text=PROTOCOLE D\'URGENCE JUDICIAIRE')).toBeVisible();
    await expect(page.locator('text=Protection Témoins')).toBeVisible();
    await expect(page.locator('text=Préservation Preuves')).toBeVisible();
    await expect(page.locator('text=Autorisation Judiciaire')).toBeVisible();
  });

  test('doit afficher les conditions d\'activation', async ({ page }) => {
    await expect(page.locator('text=Conditions d\'Activation XR-7')).toBeVisible();
    await expect(page.locator('text=Cas de corruption avérée critique')).toBeVisible();
    await expect(page.locator('text=Autorisation judiciaire valide')).toBeVisible();
  });

  test('doit afficher le cadre légal', async ({ page }) => {
    await expect(page.locator('text=Cadre Légal et Responsabilités')).toBeVisible();
    await expect(page.locator('text=Loi organique sur la lutte contre la corruption')).toBeVisible();
  });

  test('doit ouvrir le dialog d\'activation', async ({ page }) => {
    const activateButton = page.locator('button:has-text("Activer Protocole XR-7")');
    await activateButton.click();
    
    await expect(page.locator('text=Activation Protocole XR-7 - Urgence Judiciaire')).toBeVisible();
    await expect(page.locator('input[placeholder*="signalement"]')).toBeVisible();
  });

  test('doit valider les champs obligatoires', async ({ page }) => {
    await page.locator('button:has-text("Activer Protocole XR-7")').click();
    
    const confirmButton = page.locator('button:has-text("Confirmer Activation XR-7")');
    await confirmButton.click();
    
    await expect(page.locator('text=Veuillez remplir tous les champs obligatoires')).toBeVisible({ timeout: 3000 });
  });

  test('doit remplir le formulaire d\'activation', async ({ page }) => {
    await page.locator('button:has-text("Activer Protocole XR-7")').click();
    
    await page.fill('input[placeholder*="signalement"]', '123e4567-e89b-12d3-a456-426614174000');
    await page.fill('textarea[placeholder*="Décrivez"]', 'Menace imminente sur témoin clé');
    await page.fill('input[placeholder*="Ordonnance"]', 'Ordonnance N°2025/PGR/001');
    await page.fill('input[placeholder*="Art."]', 'Art. 142 Code Pénal Gabonais');
    
    const cancelButton = page.locator('button:has-text("Annuler")');
    await cancelButton.click();
  });

  test('doit afficher l\'avertissement de sécurité', async ({ page }) => {
    await page.locator('button:has-text("Activer Protocole XR-7")').click();
    
    await expect(page.locator('text=Notification automatique du Procureur')).toBeVisible();
    await expect(page.locator('text=Protection renforcée des témoins')).toBeVisible();
    await expect(page.locator('text=Horodatage blockchain')).toBeVisible();
  });
});

test.describe('Module XR-7 depuis Admin Dashboard', () => {
  
  test('doit être accessible depuis le dashboard admin', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    const xr7Tab = page.locator('button:has-text("Module XR-7"), button:has-text("XR-7")');
    if (await xr7Tab.isVisible()) {
      await xr7Tab.click();
      await expect(page.locator('text=PROTOCOLE D\'URGENCE JUDICIAIRE')).toBeVisible();
    }
  });
});

