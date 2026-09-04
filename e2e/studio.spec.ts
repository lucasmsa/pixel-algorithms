import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const SQUARE_PNG = fileURLToPath(new URL('./fixtures/square.png', import.meta.url));

test.describe('pixel-algorithms studio', () => {
  test('loads the robot floor plan and runs A* to the fixture result', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('plan-name')).toContainText('mapa_robotica.png · 450×360 px');
    await expect(page.getByTestId('grid-size')).toHaveText('72×56');
    await expect(page.getByTestId('wall-count')).toHaveText('1,912');
    await expect(page.getByTestId('closed-count')).toHaveText('1,284');
    await expect(page.getByTestId('path-length')).toHaveText('94');
    await expect(page.getByTestId('cost')).toHaveText('103.36');
    await expect(page.getByTestId('verdict')).toContainText('Path found: 94 cells, cost 103.36, after expanding 1,284 cells.');
    await expect(page.getByTestId('frame-counter')).toHaveText('frame 1284 / 1284');
  });

  test('scrubs to a frame and steps', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('wall-count')).toHaveText('1,912');
    await page.getByTestId('scrubber').fill('100');
    await expect(page.getByTestId('frame-counter')).toHaveText('frame 100 / 1284');
    await expect(page.getByTestId('closed-count')).toHaveText('100');
    await expect(page.getByTestId('path-length')).toHaveText('–');
    await page.getByRole('button', { name: 'Step forward' }).click();
    await expect(page.getByTestId('frame-counter')).toHaveText('frame 101 / 1284');
    await page.getByTestId('play').click();
    await expect(page.getByTestId('frame-counter')).toHaveText('frame 1284 / 1284', { timeout: 20_000 });
  });

  test('robot radius rebuilds the grid from the plan', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('plan-name')).toContainText('mapa_robotica.png');
    await page.getByTestId('robot-radius').fill('0');
    await expect(page.getByTestId('wall-count')).toHaveText('916');
  });

  test('imports a floor plan image and switches algorithms', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('plan-name')).toContainText('mapa_robotica.png');
    await page.getByTestId('robot-radius').fill('0');
    await page.getByTestId('file-input').setInputFiles(SQUARE_PNG);
    await expect(page.getByTestId('plan-name')).toContainText('square.png · 100×100 px');
    await expect(page.getByTestId('grid-size')).toHaveText('16×16');
    await expect(page.getByTestId('wall-count')).toHaveText('56');
    await page.getByTestId('algo-marchingSquares').click();
    await expect(page.getByTestId('segment-count')).toHaveText('30');
    await page.getByTestId('algo-floodFill').click();
    await expect(page.getByTestId('painted-count')).toHaveText('200');
    await page.getByTestId('algo-floydSteinberg').click();
    await expect(page.getByTestId('rows-done')).toHaveText('16');
    await page.getByTestId('use-as-map').click();
    await expect(page.getByTestId('algo-astar')).toHaveAttribute('aria-pressed', 'true');
  });
});
