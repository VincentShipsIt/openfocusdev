import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test("should load successfully", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/.+/);
		await expect(page.locator("body")).toBeVisible();
	});
});
