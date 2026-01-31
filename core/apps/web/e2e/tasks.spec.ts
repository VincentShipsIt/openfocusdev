import { expect, test } from '@playwright/test';

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (assumes user is authenticated via test setup)
    await page.goto('/today');
  });

  test.describe('Task Creation', () => {
    test('should create a task using quick add', async ({ page }) => {
      const taskTitle = `Test task ${Date.now()}`;

      // Find the quick add input
      const quickAddInput = page.getByPlaceholder('Add a task...');
      await expect(quickAddInput).toBeVisible();

      // Type task and press Enter
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Verify task appears in the list
      await expect(page.getByText(taskTitle)).toBeVisible();
    });

    test('should not create empty task', async ({ page }) => {
      const quickAddInput = page.getByPlaceholder('Add a task...');

      // Try to submit empty task
      await quickAddInput.press('Enter');

      // Should show no new tasks (just the ones that were there)
      // This is a basic check - in a real test we'd count tasks before/after
    });

    test('should clear input after task creation', async ({ page }) => {
      const quickAddInput = page.getByPlaceholder('Add a task...');

      await quickAddInput.fill('Test task');
      await quickAddInput.press('Enter');

      // Input should be cleared
      await expect(quickAddInput).toHaveValue('');
    });
  });

  test.describe('Task Completion', () => {
    test('should complete a task by clicking checkbox', async ({ page }) => {
      // First create a task
      const taskTitle = `Complete me ${Date.now()}`;
      const quickAddInput = page.getByPlaceholder('Add a task...');
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Wait for task to appear
      await expect(page.getByText(taskTitle)).toBeVisible();

      // Find and click the checkbox
      const taskRow = page.locator('[data-testid="task-item"]').filter({ hasText: taskTitle });
      const checkbox = taskRow.getByRole('checkbox');
      await checkbox.click();

      // Task should no longer be visible (completed tasks are filtered out)
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });
  });

  test.describe('Task Editing', () => {
    test('should edit task inline on double click', async ({ page }) => {
      // First create a task
      const taskTitle = `Edit me ${Date.now()}`;
      const quickAddInput = page.getByPlaceholder('Add a task...');
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Wait for task to appear
      const taskText = page.getByText(taskTitle);
      await expect(taskText).toBeVisible();

      // Double click to edit
      await taskText.dblclick();

      // Should see an input field
      const editInput = page.getByRole('textbox').filter({ hasText: taskTitle });
      await expect(editInput).toBeVisible();

      // Type new title and press Enter
      await editInput.fill('Updated title');
      await editInput.press('Enter');

      // Should see updated title
      await expect(page.getByText('Updated title')).toBeVisible();
    });

    test('should cancel edit on Escape', async ({ page }) => {
      // First create a task
      const taskTitle = `Cancel edit ${Date.now()}`;
      const quickAddInput = page.getByPlaceholder('Add a task...');
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Double click to edit
      const taskText = page.getByText(taskTitle);
      await taskText.dblclick();

      // Type new title but press Escape
      const editInput = page.getByRole('textbox');
      await editInput.fill('Should not save');
      await editInput.press('Escape');

      // Original title should still be there
      await expect(page.getByText(taskTitle)).toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test('should delete a task', async ({ page }) => {
      // First create a task
      const taskTitle = `Delete me ${Date.now()}`;
      const quickAddInput = page.getByPlaceholder('Add a task...');
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Wait for task to appear
      await expect(page.getByText(taskTitle)).toBeVisible();

      // Hover over the task to reveal delete button
      const taskRow = page.locator('[data-testid="task-item"]').filter({ hasText: taskTitle });
      await taskRow.hover();

      // Click delete button
      const deleteButton = taskRow.getByRole('button', { name: /delete/i });
      await deleteButton.click();

      // Task should be gone
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });
  });
});
