import { expect, test } from "@playwright/test";

test.describe("auth surface", () => {
  test("unauthenticated visit to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("login form validates before submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/enter your email address/i)).toBeVisible();
    await expect(page.getByText(/enter your password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("rejects a badly formatted email", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("nope");
    await page.locator('input[name="password"]').fill("whatever123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });

  test("can navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create one" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });
});
