import { test, expect } from '@playwright/test';

test.describe('Create Invitations Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('http://localhost:5173/login');

    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'admin-token',
            user: { id: 1, email: 'admin@example.com', role: 'ADMIN' },
            requires_password_change: false
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'admin@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page).toHaveURL(/.*admin/);

    // Navigate to create event/auditorium page
    await page.goto('http://localhost:5173/admin/create-event');
  });

  test('should display create event and auditorium form', async ({ page }) => {
    await expect(page.locator('text=Crear Evento y Auditorio')).toBeVisible();
    await expect(page.locator('input[placeholder="Nombre del Evento"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Nombre del Auditorio"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Capacidad"]')).toBeVisible();
    await expect(page.locator('button:has-text("Crear Evento y Auditorio")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    // Check for validation errors (assuming form validation is implemented)
    await expect(page.locator('text=El nombre del evento es obligatorio')).toBeVisible();
    await expect(page.locator('text=El nombre del auditorio es obligatorio')).toBeVisible();
    await expect(page.locator('text=La capacidad es obligatoria')).toBeVisible();
  });

  test('should create event and auditorium successfully', async ({ page }) => {
    await page.route('**/api/admin/create-event-auditorium', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            event: { id: 1, name: 'Test Event' },
            auditorium: { id: 1, name: 'Test Auditorium', capacity: 100 }
          }
        })
      });
    });

    await page.fill('input[placeholder="Nombre del Evento"]', 'Test Event');
    await page.fill('input[placeholder="Nombre del Auditorio"]', 'Test Auditorium');
    await page.fill('input[placeholder="Capacidad"]', '100');

    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    await expect(page.locator('text=Evento y auditorio creados exitosamente')).toBeVisible();
  });

  test('should handle creation errors', async ({ page }) => {
    await page.route('**/api/admin/create-event-auditorium', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Validation failed',
          errors: {
            event_name: ['El nombre del evento ya existe'],
            auditorium_name: ['El nombre del auditorio ya existe']
          }
        })
      });
    });

    await page.fill('input[placeholder="Nombre del Evento"]', 'Existing Event');
    await page.fill('input[placeholder="Nombre del Auditorio"]', 'Existing Auditorium');
    await page.fill('input[placeholder="Capacidad"]', '100');

    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    await expect(page.locator('text=El nombre del evento ya existe')).toBeVisible();
    await expect(page.locator('text=El nombre del auditorio ya existe')).toBeVisible();
  });

  test('should validate capacity as positive number', async ({ page }) => {
    await page.fill('input[placeholder="Nombre del Evento"]', 'Test Event');
    await page.fill('input[placeholder="Nombre del Auditorio"]', 'Test Auditorium');
    await page.fill('input[placeholder="Capacidad"]', '-10');

    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    await expect(page.locator('text=La capacidad debe ser un número positivo')).toBeVisible();
  });

  test('should navigate to import graduates after creating event', async ({ page }) => {
    await page.route('**/api/admin/create-event-auditorium', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            event: { id: 1, name: 'Test Event' },
            auditorium: { id: 1, name: 'Test Auditorium', capacity: 100 }
          }
        })
      });
    });

    await page.fill('input[placeholder="Nombre del Evento"]', 'Test Event');
    await page.fill('input[placeholder="Nombre del Auditorio"]', 'Test Auditorium');
    await page.fill('input[placeholder="Capacidad"]', '100');

    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    // Should navigate to import graduates page
    await expect(page).toHaveURL(/.*import-graduates/);
  });

  test('should display import graduates interface', async ({ page }) => {
    // Navigate directly to import graduates
    await page.goto('http://localhost:5173/admin/import-graduates');

    await expect(page.locator('text=Importar Graduandos')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('button:has-text("Importar")')).toBeVisible();
  });

  test('should handle file upload for graduate import', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/import-graduates');

    await page.route('**/api/admin/import-graduates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            imported: 50,
            failed: 2,
            message: 'Importación completada'
          }
        })
      });
    });

    // Upload a test file
    await page.setInputFiles('input[type="file"]', {
      name: 'graduates.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('test file content')
    });

    await page.locator('button:has-text("Importar")').click();

    await expect(page.locator('text=Importación completada')).toBeVisible();
    await expect(page.locator('text=50 graduandos importados')).toBeVisible();
    await expect(page.locator('text=2 errores')).toBeVisible();
  });

  test('should handle import errors', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/import-graduates');

    await page.route('**/api/admin/import-graduates', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid file format',
          errors: {
            file: ['El archivo debe ser un Excel válido']
          }
        })
      });
    });

    await page.setInputFiles('input[type="file"]', {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('invalid content')
    });

    await page.locator('button:has-text("Importar")').click();

    await expect(page.locator('text=El archivo debe ser un Excel válido')).toBeVisible();
  });

  test('should create invitations after successful import', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/import-graduates');

    await page.route('**/api/admin/create-invitations', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            invitations_created: 50,
            message: 'Invitaciones creadas exitosamente'
          }
        })
      });
    });

    // After successful import, should show create invitations button
    await expect(page.locator('button:has-text("Crear Invitaciones")')).toBeVisible();

    await page.locator('button:has-text("Crear Invitaciones")').click();

    await expect(page.locator('text=Invitaciones creadas exitosamente')).toBeVisible();
    await expect(page.locator('text=50 invitaciones creadas')).toBeVisible();
  });

  test('should prevent access for non-admin users', async ({ page }) => {
    // Login as staff
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'staff-token');
      localStorage.setItem('user', JSON.stringify({ role: 'STAFF' }));
    });

    await page.goto('http://localhost:5173/admin/create-event');
    await expect(page).toHaveURL(/.*unauthorized/); // Should redirect to unauthorized page
  });

  test('should show loading states during operations', async ({ page }) => {
    await page.route('**/api/admin/create-event-auditorium', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            event: { id: 1, name: 'Test Event' },
            auditorium: { id: 1, name: 'Test Auditorium', capacity: 100 }
          }
        })
      });
    });

    await page.fill('input[placeholder="Nombre del Evento"]', 'Test Event');
    await page.fill('input[placeholder="Nombre del Auditorio"]', 'Test Auditorium');
    await page.fill('input[placeholder="Capacidad"]', '100');

    await page.locator('button:has-text("Crear Evento y Auditorio")').click();

    await expect(page.locator('button:has-text("Creando...")')).toBeVisible();
    await expect(page.locator('button:has-text("Creando...")')).toBeDisabled();
  });
});