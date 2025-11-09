import { test, expect } from '@playwright/test';

test.describe('QR Scanning Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff first
    await page.goto('http://localhost:5173/login');

    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'staff-token',
            user: { id: 2, email: 'staff@example.com', role: 'STAFF' },
            requires_password_change: false
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'staff@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page).toHaveURL(/.*staff/);

    // Navigate to QR scanner
    await page.goto('http://localhost:5173/qr-scanner');
  });

  test('should display QR scanner interface', async ({ page }) => {
    await expect(page.locator('text=Escáner QR')).toBeVisible();
    await expect(page.locator('button:has-text("Iniciar Escaneo")')).toBeVisible();
    await expect(page.locator('text=En línea')).toBeVisible();
  });

  test('should show camera permission prompt when starting scan', async ({ page }) => {
    // Mock camera access - this will depend on browser permissions
    // In a real test environment, you might need to handle permissions differently

    await page.locator('button:has-text("Iniciar Escaneo")').click();

    // The button should change to "Detener" if camera access is granted
    // If camera access is denied, an alert would show (but we can't test alerts easily)
    await expect(page.locator('button:has-text("Detener")')).toBeVisible();
  });

  test('should handle successful QR scan', async ({ page }) => {
    // Mock successful scan API response
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'OK',
            reason: 'Ticket válido'
          }
        })
      });
    });

    // Simulate successful scan by triggering the scan logic
    // This is tricky to test directly since it requires camera access
    // In a real scenario, you might need to mock the QR detection

    await expect(page.locator('text=Resultado del Escaneo')).toBeVisible();
    await expect(page.locator('text=✓ VÁLIDO')).toBeVisible();
  });

  test('should handle invalid QR code', async ({ page }) => {
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'INVALID',
            reason: 'Código QR malformado'
          }
        })
      });
    });

    // Trigger scan validation manually (in real app this would happen automatically)
    await page.evaluate(() => {
      // This would normally be triggered by QR detection
      const event = new CustomEvent('qrDetected', { detail: 'invalid-qr' });
      window.dispatchEvent(event);
    });

    await expect(page.locator('text=✗ INVÁLIDO')).toBeVisible();
    await expect(page.locator('text=Código QR malformado')).toBeVisible();
  });

  test('should handle duplicate ticket scan', async ({ page }) => {
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'DUPLICATE',
            reason: 'Ticket ya usado'
          }
        })
      });
    });

    await expect(page.locator('text=✗ YA USADO')).toBeVisible();
    await expect(page.locator('text=Ticket ya usado')).toBeVisible();
  });

  test('should handle expired ticket', async ({ page }) => {
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'EXPIRED',
            reason: 'Ticket expirado'
          }
        })
      });
    });

    await expect(page.locator('text=✗ EXPIRADO')).toBeVisible();
    await expect(page.locator('text=Ticket expirado')).toBeVisible();
  });

  test('should handle revoked ticket', async ({ page }) => {
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'REVOKED',
            reason: 'Ticket revocado'
          }
        })
      });
    });

    await expect(page.locator('text=✗ REVOCADO')).toBeVisible();
    await expect(page.locator('text=Ticket revocado')).toBeVisible();
  });

  test('should handle offline mode', async ({ page }) => {
    // Simulate going offline
    await page.context().setOffline(true);

    await expect(page.locator('text=Sin conexión')).toBeVisible();

    // Try to scan - should queue the scan
    await page.route('**/api/scan/validate', async route => {
      // This shouldn't be called when offline
      expect(true).toBe(false); // Should not reach here
    });

    // The scan should be queued locally
    await expect(page.locator('text=escaneo')).toBeVisible();
  });

  test('should process queued scans when coming back online', async ({ page }) => {
    // Start offline and queue a scan
    await page.context().setOffline(true);

    // Queue should show pending scans
    await expect(page.locator('text=escaneos pendientes')).toBeVisible();

    // Come back online
    await page.context().setOffline(false);

    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'OK',
            reason: 'Procesados escaneos pendientes'
          }
        })
      });
    });

    // Should process the queue
    await expect(page.locator('text=Procesados escaneos pendientes')).toBeVisible();
  });

  test('should handle scan errors', async ({ page }) => {
    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'ERROR',
            reason: 'Error interno del servidor'
          }
        })
      });
    });

    await expect(page.locator('text=✗ ERROR')).toBeVisible();
    await expect(page.locator('text=Error interno del servidor')).toBeVisible();
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Try to access scanner as graduate (should be blocked)
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'graduate-token');
      localStorage.setItem('user', JSON.stringify({ role: 'GRADUANDO' }));
    });

    await page.reload();

    await page.route('**/api/scan/validate', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'UNAUTHORIZED',
            reason: 'No autorizado para escanear'
          }
        })
      });
    });

    await expect(page.locator('text=No autorizado para escanear')).toBeVisible();
  });

  test('should stop camera when stop button is clicked', async ({ page }) => {
    await page.locator('button:has-text("Iniciar Escaneo")').click();
    await expect(page.locator('button:has-text("Detener")')).toBeVisible();

    await page.locator('button:has-text("Detener")').click();
    await expect(page.locator('button:has-text("Iniciar Escaneo")')).toBeVisible();
  });
});