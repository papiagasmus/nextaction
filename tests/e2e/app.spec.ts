import { expect, test } from "@playwright/test";

test("shows the application shell and a healthy Worker API", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle(/NextAction/i);
  await expect(
    page.getByRole("heading", { level: 1, name: "One application. A clean foundation." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Worker API" })).toBeVisible();
  await expect(page.getByText("The application runtime is responding.")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("returns the expected JSON from the Worker health endpoint", async ({ page }) => {
  await page.goto("/");
  const response = await page.request.get(new URL("/api/health", page.url()).toString());

  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/json");
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "nextaction-worker",
  });
});

test("fits the viewport without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "One application. A clean foundation." }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
