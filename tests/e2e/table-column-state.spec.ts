import { expect, test } from '@playwright/test';

test.describe('table column state smoke page', () => {
  test('opens the smoke page and shows the column setting popover', async ({ page }) => {
    await page.goto('/__test/table-column-state');

    await expect(page.getByTestId('table-column-state-page')).toBeVisible();
    await expect(page.getByText('Table Column State Test')).toBeVisible();

    const trigger = page.getByRole('button', { name: /Column Setting|列设置/ });
    await expect(trigger).toBeVisible();

    await trigger.click();

    await expect(page.getByText(/Select All|全选/)).toBeVisible();
  });
});
