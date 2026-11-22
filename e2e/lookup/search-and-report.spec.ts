import { expect, test } from "@playwright/test";

test.describe("Products Lookup E2E Flow", () => {
  test("executes search, switches campaign theme, and downloads PDF", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Escribir consulta en el input principal y enviar con Enter
    const searchInput = page.getByRole("textbox", {
      name: /product query or shopping prompt/i,
    });
    await searchInput.fill("noise cancelling headphones");
    await searchInput.press("Enter");

    // 2. Esperar que carguen los resultados y aparezca el botón Download PDF + gráfico SVG
    const downloadButton = page.getByRole("button", { name: /download pdf/i });
    await expect(downloadButton).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("img", {
        name: /product ranking trajectory across ai search engines/i,
      })
    ).toBeVisible({ timeout: 15_000 });

    // 3. Cambiar campaña en el header y verificar el atributo data-campaign en <html>
    await page.getByRole("tab", { name: /christmas/i }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-campaign",
      "christmas"
    );

    // 4. Descargar el reporte PDF físico y verificar el nombre del archivo
    const downloadPromise = page.waitForEvent("download");
    await downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});
