import { expect, test, type Page } from "@playwright/test";

/**
 * Authenticated flow. Requires the Rust backend running on RUST_API_URL and a
 * seeded SUPER_ADMIN (`cargo run --bin seed`). Each test creates uniquely-named
 * data and deletes it, so the shared DB stays clean.
 */
const ADMIN = { email: "admin@example.com", password: "Admin12345!" };

async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(ADMIN.email);
  await page.locator('input[name="password"]').fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("signs in and reaches the dashboard", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  await expect(page.getByText("Backend status")).toBeVisible();
});

test("creates a project, opens it, then deletes it", async ({ page }) => {
  await login(page);
  const name = `E2E ${Date.now()}`;

  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);

  await page.getByRole("button", { name: "New project" }).first().click();
  await page.locator('input[name="name"]').fill(name);
  await page.getByRole("button", { name: "Create project" }).click();

  // Row appears, navigate into it.
  const row = page.getByRole("cell", { name, exact: false });
  await expect(row).toBeVisible();
  await row.click();
  await expect(page.getByRole("heading", { name })).toBeVisible();

  // Sub-nav tabs are reachable.
  await page.getByRole("link", { name: "API keys" }).click();
  await expect(page.getByRole("heading", { name: "API keys" })).toBeVisible();

  // Clean up.
  await page.getByRole("link", { name: "Overview" }).click();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("cell", { name, exact: false })).toHaveCount(0);
});
