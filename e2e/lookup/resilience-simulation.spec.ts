import { expect, test } from "@playwright/test";

test.describe("Lookup Resilience & Edge-Case Simulation", () => {
  test("isolates partial engine outage and surfaces price drift alerts", async ({
    page,
  }) => {
    await page.goto("/");

    const searchInput = page.getByRole("textbox", {
      name: /product query or shopping prompt/i,
    });
    await searchInput.fill("4k oled monitor");
    await searchInput.press("Enter");

    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible({ timeout: 15_000 });

    // 1. Activar Partial Outage en el footer (role="radio")
    await page.getByRole("radio", { name: /partial outage/i }).click();
    await expect(
      page.getByText(/claude search.*unavailable|outage|simulated/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /download pdf/i })
    ).toBeVisible();

    // 2. Activar Price Drift en el footer y verificar alerta en el resumen
    await page.getByRole("radio", { name: /price drift/i }).click();
    await expect(
      page.getByText(/price discrepanc|drift flagged/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
