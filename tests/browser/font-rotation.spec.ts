import { test, expect, Page } from '@playwright/test';
import { NAME_FONTS } from '../../src/app/name-fonts';

async function prepare(page: Page) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function expectFont(page: Page, index: number) {
  await expect(page.locator('h1')).toHaveCSS('font-family', new RegExp(`^"?${NAME_FONTS[index].family}"?(?:,|$)`), { timeout: 4500 });
}

test('cycles through ten loaded fonts, refits long names, and wraps to the original', async ({ page }) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  expect(NAME_FONTS).toHaveLength(10);
  await expectFont(page, 0);
  const loaded = await page.evaluate(fonts => fonts.every(font =>
    document.fonts.check(`${font.weight} 48px "${font.family}"`, 'YOUR NAME'),
  ), NAME_FONTS);
  expect(loaded).toBe(true);
  await page.locator('h1').evaluate(element => { element.textContent = 'Alexandria-Catherine von Hohenlohe'; });

  for (let step = 1; step <= 10; step++) {
    await expectFont(page, step % 10);
    const fits = await page.locator('h1').evaluate(element => {
      const field = element.parentElement!;
      return element.scrollWidth <= field.clientWidth * .9 && element.clientHeight < field.clientHeight;
    });
    expect(fits).toBe(true);
  }
});

test('chooses a fresh delay between two and four seconds after each switch', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window);
    const delays: number[] = [];
    Object.assign(window, { fontDelays: delays });
    window.setTimeout = (handler: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (delay !== undefined && delay >= 2000 && delay <= 4000) delays.push(delay);
      return original(handler, delay, ...args);
    };
  });
  await prepare(page);
  await page.evaluate(() => { Math.random = () => 0.5; });
  await expectFont(page, 1);
  await page.evaluate(() => { Math.random = () => 0.999999; });
  await expectFont(page, 2);
  expect(await page.evaluate(() => (window as unknown as { fontDelays: number[] }).fontDelays)).toEqual([2000, 3000, 4000]);
});

test('pauses in standby and on reduced motion, then resumes', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Turn television off' }).click();
  await page.waitForTimeout(4200);
  await expectFont(page, 0);
  await page.getByRole('button', { name: 'Turn television on' }).click();
  await expectFont(page, 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(4200);
  await expectFont(page, 1);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expectFont(page, 2);
});
