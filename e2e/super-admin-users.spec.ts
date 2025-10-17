import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard - Gestion Utilisateurs', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit afficher la vue utilisateurs', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    await expect(page.locator('text=Gestion des Utilisateurs')).toBeVisible();
    await expect(page.locator('text=Total Utilisateurs')).toBeVisible();
  });

  test('doit permettre de rechercher un utilisateur', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('demo');
    
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('doit filtrer les utilisateurs par rôle', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const roleSelect = page.locator('select, [role="combobox"]').first();
    await roleSelect.click();
    await page.locator('text=Agent').click();
    
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('doit actualiser la liste des utilisateurs', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const refreshButton = page.locator('button:has-text("Actualiser")');
    await refreshButton.click();
    
    await expect(page.locator('.animate-spin')).toBeVisible({ timeout: 2000 });
  });

  test('doit voir les détails d\'un utilisateur', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const viewButton = page.locator('button[aria-label*="Voir"]').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('text=Détails de l\'Utilisateur')).toBeVisible();
    }
  });

  test('doit changer le rôle d\'un utilisateur', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const editButton = page.locator('button[aria-label*="Changer le rôle"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('text=Changer le Rôle')).toBeVisible();
      
      const cancelButton = page.locator('button:has-text("Annuler")');
      await cancelButton.click();
    }
  });

  test('doit suspendre un utilisateur', async ({ page }) => {
    await page.goto('/dashboard/super-admin?view=users');
    
    const suspendButton = page.locator('button[aria-label*="Suspendre"]').first();
    if (await suspendButton.isVisible()) {
      await suspendButton.click();
      await expect(page.locator('text=Suspendre l\'Utilisateur')).toBeVisible();
      
      const cancelButton = page.locator('button:has-text("Annuler")');
      await cancelButton.click();
    }
  });
});

