import { test, expect } from "@playwright/test";

const email=process.env.E2E_USER_EMAIL;
const password=process.env.E2E_USER_PASSWORD;

test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run authenticated profile acceptance.");

test("authenticated user can enter the profile workflow", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email!);
  await page.locator('input[type="password"]').fill(password!);

  const signIn=page.getByRole("button",{name:/sign in/i});
  await signIn.click();

  await expect(page).toHaveURL(/\/dashboard|\/profile/);

  await page.goto("/profile");
  await expect(page.getByRole("heading",{name:"Your PortfolioPath profile"})).toBeVisible();

  await page.getByRole("link",{name:/create portfolio/i}).click();
  await expect(page).toHaveURL(/\/portfolios\/new/);
});
