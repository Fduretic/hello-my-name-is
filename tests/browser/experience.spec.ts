import { test, expect } from '@playwright/test';

test('renders configured name with no browser errors or overlay interception', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(process.env['PUBLIC_DISPLAY_NAME']?.trim() || 'YOUR NAME');
  await expect(page.locator('app-crt-overlay')).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.name-tag')).toBeVisible();
  await page.getByRole('button', { name: 'Turn television off' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Turn television on' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('UNTIL NEXT TIME.')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Turn television off' })).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
  test(`fits viewport and name at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    const dimensions = await page.evaluate(() => {
      const name = document.querySelector('h1')!.getBoundingClientRect();
      const field = document.querySelector('.name-field')!.getBoundingClientRect();
      const tv = document.querySelector('.television')!.getBoundingClientRect();
      const screen = document.querySelector('.crt-screen')! as HTMLElement;
      return { scroll: document.documentElement.scrollHeight, height: innerHeight, width: document.documentElement.scrollWidth, viewport: innerWidth, name: name.width, field: field.width, tvTop: tv.top, tvBottom: tv.bottom, ratio: screen.clientWidth / screen.clientHeight };
    });
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.height);
    expect(dimensions.width).toBe(dimensions.viewport);
    expect(dimensions.name).toBeLessThan(dimensions.field);
    expect(dimensions.tvTop).toBeGreaterThanOrEqual(0);
    expect(dimensions.tvBottom).toBeLessThanOrEqual(viewport.height);
    expect(dimensions.ratio).toBeCloseTo(1.6, 1);
    await page.screenshot({ path: `artifacts/hello-${viewport.width}.png`, animations: 'disabled' });
  });
}

test('reduced motion disables animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.signal')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.signal')).toHaveCSS('transition-duration', '0s');
});

test('long names fit without clipping', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('h1').evaluate(element => { element.textContent = 'Alexandria-Catherine von Hohenlohe'; });
  await page.setViewportSize({ width: 380, height: 800 });
  await expect.poll(() => page.locator('h1').evaluate(element => element.scrollWidth < element.parentElement!.clientWidth * .92)).toBe(true);
});
