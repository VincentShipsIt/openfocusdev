import { expect, test } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Project Creation', () => {
    test('should create a new project from sidebar', async ({ page }) => {
      const projectName = `Test Project ${Date.now()}`;

      // Find and click the add project button in sidebar
      const addProjectButton = page.getByRole('button', { name: /add project/i });
      await addProjectButton.click();

      // Fill in the project name
      const projectInput = page.getByPlaceholder(/project name/i);
      await expect(projectInput).toBeVisible();
      await projectInput.fill(projectName);
      await projectInput.press('Enter');

      // Project should appear in the sidebar
      await expect(page.getByText(projectName)).toBeVisible();
    });

    test('should cancel project creation on Escape', async ({ page }) => {
      const addProjectButton = page.getByRole('button', { name: /add project/i });
      await addProjectButton.click();

      const projectInput = page.getByPlaceholder(/project name/i);
      await projectInput.fill('Cancelled Project');
      await projectInput.press('Escape');

      // Input should be gone and project should not exist
      await expect(projectInput).not.toBeVisible();
      await expect(page.getByText('Cancelled Project')).not.toBeVisible();
    });
  });

  test.describe('Project Navigation', () => {
    test('should navigate to project page on click', async ({ page }) => {
      // First create a project
      const projectName = `Navigate Project ${Date.now()}`;
      const addProjectButton = page.getByRole('button', { name: /add project/i });
      await addProjectButton.click();

      const projectInput = page.getByPlaceholder(/project name/i);
      await projectInput.fill(projectName);
      await projectInput.press('Enter');

      // Click on the project
      const projectLink = page.getByRole('link', { name: projectName });
      await projectLink.click();

      // Should be on project page
      await expect(page).toHaveURL(/\/projects\//);
      await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    });
  });

  test.describe('Project with Tasks', () => {
    test('should show task count in sidebar', async ({ page }) => {
      // Create a project
      const projectName = `Count Project ${Date.now()}`;
      const addProjectButton = page.getByRole('button', { name: /add project/i });
      await addProjectButton.click();

      const projectInput = page.getByPlaceholder(/project name/i);
      await projectInput.fill(projectName);
      await projectInput.press('Enter');

      // Navigate to project
      const projectLink = page.getByRole('link', { name: projectName });
      await projectLink.click();

      // Add a task to the project
      const taskInput = page.getByPlaceholder('Add a task...');
      await taskInput.fill('Task in project');
      await taskInput.press('Enter');

      // Go back to check sidebar count
      await page.goto('/today');

      // Project should show count of 1
      const projectItem = page.locator('[data-testid="sidebar-project"]').filter({ hasText: projectName });
      await expect(projectItem.getByText('1')).toBeVisible();
    });
  });

  test.describe('Sidebar Views', () => {
    test('should navigate to Today view', async ({ page }) => {
      const todayLink = page.getByRole('link', { name: /today/i }).first();
      await todayLink.click();

      await expect(page).toHaveURL('/today');
      await expect(page.getByRole('heading', { name: /today/i })).toBeVisible();
    });

    test('should navigate to Inbox view', async ({ page }) => {
      const inboxLink = page.getByRole('link', { name: /inbox/i }).first();
      await inboxLink.click();

      await expect(page).toHaveURL('/inbox');
      await expect(page.getByRole('heading', { name: /inbox/i })).toBeVisible();
    });

    test('should navigate to Upcoming view', async ({ page }) => {
      const upcomingLink = page.getByRole('link', { name: /upcoming/i }).first();
      await upcomingLink.click();

      await expect(page).toHaveURL('/upcoming');
      await expect(page.getByRole('heading', { name: /upcoming/i })).toBeVisible();
    });

    test('should navigate to History view', async ({ page }) => {
      const historyLink = page.getByRole('link', { name: /history/i }).first();
      await historyLink.click();

      await expect(page).toHaveURL('/history');
      await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
    });
  });

  test.describe('Projects Collapse', () => {
    test('should collapse and expand projects section', async ({ page }) => {
      // Create a project first
      const projectName = `Collapse Test ${Date.now()}`;
      const addProjectButton = page.getByRole('button', { name: /add project/i });
      await addProjectButton.click();

      const projectInput = page.getByPlaceholder(/project name/i);
      await projectInput.fill(projectName);
      await projectInput.press('Enter');

      // Find the Projects header and click to collapse
      const projectsHeader = page.getByText('Projects').first();
      await projectsHeader.click();

      // Project should be hidden
      await expect(page.getByText(projectName)).not.toBeVisible();

      // Click again to expand
      await projectsHeader.click();

      // Project should be visible again
      await expect(page.getByText(projectName)).toBeVisible();
    });
  });
});
