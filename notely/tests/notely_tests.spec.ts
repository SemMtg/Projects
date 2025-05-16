import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Open the development server
await page.goto('http://localhost:9001/#/'); //Sometimes will bee 9001 or 9002 
});
  
test('has header', async ({ page }) => {
    await expect(page.getByText('Notely', {exact:true})).toBeVisible();
})

test('go to notes and create a new note', async ({ page }) => {
    // Navigate to the Notes page
    await page.locator('[data-testid="view-notes-btn"]').click();
    // navigate to the create/edit note page
    await page.locator('[data-testid="create-new-note-btn"]').click();
    // Verify page loaded (title input visible)
    await expect(page.locator('[data-testid="note-title-input"]')).toBeVisible();

    // Fill in note details
    await page.locator('[data-testid="note-title-input"]').fill('My New Note');
    await page.locator('[data-testid="note-content-input"]').fill('This is the content of my new note.');
    await page.locator('[data-testid="category-options-select"]').click();
    await page.locator('text=Work').click();
    await page.locator('[data-testid="note-title-input"]').click();
    await page.getByRole('radio', { name: 'priority_high 5' }).click();

    // Save the note
    await page.locator('[data-testid="save-note-btn"]').click();

    // Verify redirection and success notification
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText('New note created!')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'My New Note' }).getByLabel('priority_high 5')).toBeVisible();
});

test('edit an existing note', async ({ page }) => {
    // Navigate to the Notes page
    await page.locator('[data-testid="view-notes-btn"]').click();

    // Open an existing note for editing
    await page.getByRole('listitem').filter({ hasText: 'Shopping List' }).click();

    // Verify existing note details are loaded
    await expect(page.locator('[data-testid="note-title-input"]')).toHaveValue('Shopping List');
    await expect(page.locator('[data-testid="note-content-input"]')).toHaveValue('This is a shopping list note.');

    // Modify note details
    await page.locator('[data-testid="note-title-input"]').fill('Updated Note Title');
    await page.locator('[data-testid="note-content-input"]').fill('Updated note content.');
    await page.getByRole('radio', { name: 'priority_high 5' }).click();

    // Save the updated note
    await page.locator('[data-testid="save-note-btn"]').click();

    // Verify redirection and success notification
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText('Note updated successfully!')).toBeVisible();
    await expect(page.getByText('Updated Note Title')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Updated Note Title' }).getByLabel('priority_high 5')).toBeVisible();
});

test('delete a note', async ({ page }) => {
    // Navigate to the Notes page
    await page.locator('[data-testid="view-notes-btn"]').click();

    // Open an existing note for editing
    await page.getByRole('listitem').filter({ hasText: 'Shopping List' }).click();

    // Click delete button
    await page.locator('[data-testid="delete-note-btn"]').click();

    // Confirm success notification
    await expect(page.getByText('Note deleted successfully!')).toBeVisible();

    // Verify redirection back to notes page
    await expect(page).toHaveURL(/\/notes$/);
});
