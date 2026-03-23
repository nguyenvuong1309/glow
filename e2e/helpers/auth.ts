import {pause, elementExists, waitForElement} from './utils';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test@glow.test';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

/**
 * Authenticate via deep link (DEV builds only).
 * Triggers supabase.auth.signInWithPassword() inside the app.
 */
export async function loginViaDeepLink(
  email: string = TEST_EMAIL,
  password: string = TEST_PASSWORD,
): Promise<void> {
  const deepLinkUrl = `glow://test-auth?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  await driver.execute('mobile: deepLink', {
    url: deepLinkUrl,
    bundleId: 'org.reactjs.native.example.Glow',
  });

  // Wait for Supabase auth + Redux state propagation
  await pause(5000);
}

/**
 * Verify login succeeded by checking profile screen shows user info
 */
export async function isLoggedIn(): Promise<boolean> {
  // Navigate to profile tab
  const profileTab = await $('~tab-profile');
  if (await profileTab.isExisting()) {
    await profileTab.click();
    await pause(2000);
  }

  // If auth prompt is visible, user is NOT logged in
  const authPrompt = await elementExists('profile-auth-prompt', 3000);
  return !authPrompt;
}

/**
 * Ensure logged out state before testing
 */
export async function ensureLoggedOut(): Promise<void> {
  const profileTabExists = await elementExists('tab-profile', 3000);
  if (!profileTabExists) {
    return;
  }

  const el = await $('~tab-profile');
  await el.click();
  await pause(2000);

  // Check if we're logged in by looking for profile-name (only visible when authenticated)
  const nameExists = await elementExists('profile-name', 3000);
  if (nameExists) {
    // Find "Sign Out" button by label text across all languages
    try {
      const signOutBtn = await $(
        `-ios predicate string:label CONTAINS "Sign Out" OR label CONTAINS "Đăng xuất" OR label CONTAINS "退出登录"`,
      );
      if (await signOutBtn.isExisting()) {
        await signOutBtn.click();
        await pause(1000);
        // Accept the confirmation alert
        await driver.acceptAlert();
        await pause(3000);
      }
    } catch {
      // Not logged in or button not found
    }
  }
}

/**
 * Full auth flow: logout first, then deep link login
 */
export async function authenticateForTests(
  email?: string,
  password?: string,
): Promise<void> {
  await ensureLoggedOut();
  await loginViaDeepLink(email, password);
}
