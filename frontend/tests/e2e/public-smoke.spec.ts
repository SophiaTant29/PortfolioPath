import { test, expect } from "@playwright/test";

test("login page loads and exposes authentication controls", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("PortfolioPath")).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("system status page renders", async ({ page }) => {
  await page.goto("/system-status");
  await expect(page.getByRole("heading",{name:"PortfolioPath Services"})).toBeVisible();
});

test("legal pages render", async ({ page }) => {
  for (const path of ["/disclosures","/privacy","/terms"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("protected portfolio route redirects unauthenticated user", async ({ page }) => {
  await page.goto("/portfolios/not-a-real-id");
  await expect(page).toHaveURL(/\/login/);
});
