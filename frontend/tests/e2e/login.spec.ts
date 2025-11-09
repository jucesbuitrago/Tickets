import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the app is running on localhost:5173
    await page.goto('http://localhost:5173/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Enter your credentials to access your account')).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('button:has-text("Login")').click();

    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[placeholder="Email"]', 'invalid@example.com');
    await page.fill('input[placeholder="Password"]', 'wrongpassword');
    await page.locator('button:has-text("Login")').click();

    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should redirect to change password on first login', async ({ page }) => {
    // This test would require setting up a test user in the database
    // For now, we'll mock the API response
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com', role: 'GRADUANDO' },
            requires_password_change: true
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page).toHaveURL(/.*change-password/);
  });

  test('should redirect admin to admin dashboard', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'test-token',
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
  });

  test('should redirect staff to staff dashboard', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'test-token',
            user: { id: 1, email: 'staff@example.com', role: 'STAFF' },
            requires_password_change: false
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'staff@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page).toHaveURL(/.*staff/);
  });

  test('should redirect graduate to graduate dashboard', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'test-token',
            user: { id: 1, email: 'graduate@example.com', role: 'GRADUANDO' },
            requires_password_change: false
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'graduate@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page).toHaveURL(/.*graduate/);
  });

  test('should show loading state during login', async ({ page }) => {
    await page.route('**/api/login', async route => {
      // Delay the response to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com', role: 'GRADUANDO' },
            requires_password_change: false
          }
        })
      });
    });

    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('button:has-text("Login")').click();

    await expect(page.locator('button:has-text("Logging in...")')).toBeVisible();
    await expect(page.locator('button:has-text("Logging in...")')).toBeDisabled();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.locator('text=Don\'t have an account? Register').click();
    await expect(page).toHaveURL(/.*register/);
  });
});