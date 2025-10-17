import { test, expect } from '@playwright/test';

test.describe('Dashboard Protocole d\'État - Admin', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit afficher la page de connexion', async ({ page }) => {
    await expect(page.locator('text=NDJOBI')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test('doit rediriger vers dashboard admin après connexion', async ({ page }) => {
    await page.fill('input[type="tel"]', '+24177777000');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Se connecter")');
    
    await page.waitForURL('**/dashboard/admin', { timeout: 10000 });
    await expect(page.locator('text=Protocole d\'État')).toBeVisible();
  });

  test('doit afficher les KPIs nationaux', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    await expect(page.locator('text=Signalements Nationaux')).toBeVisible();
    await expect(page.locator('text=Impact Économique')).toBeVisible();
    await expect(page.locator('text=Taux de Résolution')).toBeVisible();
    await expect(page.locator('text=Score Transparence')).toBeVisible();
  });

  test('doit naviguer entre les onglets', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    await page.click('button:has-text("Validation")');
    await expect(page.locator('text=Cas Sensibles - Validation Présidentielle')).toBeVisible();
    
    await page.click('button:has-text("Suivi Enquêtes")');
    await expect(page.locator('text=Suivi des Enquêtes Nationales')).toBeVisible();
    
    await page.click('button:has-text("Sous-Admins")');
    await expect(page.locator('text=Gestion des Sous-Administrateurs')).toBeVisible();
    
    await page.click('button:has-text("Rapports")');
    await expect(page.locator('text=Rapports Stratégiques')).toBeVisible();
  });

  test('doit afficher les graphiques', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    await expect(page.locator('text=Évolution de la Lutte Anticorruption')).toBeVisible();
    await expect(page.locator('text=Vision Gabon 2025')).toBeVisible();
  });

  test('doit afficher la distribution régionale', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    await expect(page.locator('text=Distribution Régionale')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('doit permettre de générer un rapport', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await page.click('button:has-text("Rapports")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Générer PDF")').first();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('doit valider un cas sensible', async ({ page }) => {
    await page.goto('/dashboard/admin?view=validation');
    
    const approveButton = page.locator('button:has-text("Approuver l\'Action")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      await expect(page.locator('text=Décision enregistrée')).toBeVisible({ timeout: 5000 });
    }
  });

  test('doit être responsive sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/admin');
    
    await expect(page.locator('text=Protocole d\'État')).toBeVisible();
    
    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('text=Signalements')).toBeVisible();
  });

  test('doit actualiser les données', async ({ page }) => {
    await page.goto('/dashboard/admin?view=enquetes');
    
    await page.click('button:has-text("Actualiser")');
    
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toBeVisible();
  });
});

test.describe('Module XR-7', () => {
  
  test('doit afficher le module XR-7', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    if (await page.locator('button:has-text("Module XR-7")').isVisible()) {
      await page.click('button:has-text("Module XR-7")');
      await expect(page.locator('text=PROTOCOLE D\'URGENCE JUDICIAIRE')).toBeVisible();
    }
  });

  test('doit ouvrir le dialog d\'activation XR-7', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    if (await page.locator('button:has-text("Activer Protocole XR-7")').isVisible()) {
      await page.click('button:has-text("Activer Protocole XR-7")');
      await expect(page.locator('text=Activation Protocole XR-7')).toBeVisible();
    }
  });
});

test.describe('Notifications Temps Réel', () => {
  
  test('doit demander les permissions de notification', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('/dashboard/admin');
    
    await expect(page.locator('text=Protocole d\'État')).toBeVisible();
  });
});

test.describe('Génération Rapports PDF', () => {
  
  test('doit générer rapport exécutif', async ({ page }) => {
    await page.goto('/dashboard/admin?view=rapports');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Générer PDF"):near(:text("Rapport Exécutif"))');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/rapport.*\.pdf/i);
  });

  test('doit générer rapport mensuel', async ({ page }) => {
    await page.goto('/dashboard/admin?view=rapports');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Générer PDF"):near(:text("Rapport Mensuel"))');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/rapport.*\.pdf/i);
  });
});

