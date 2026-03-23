import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
} from '../helpers/utils';
import {
  loginViaDeepLink,
  isLoggedIn,
  ensureLoggedOut,
} from '../helpers/auth';

async function navigateToTab(tabTestId: string, fallbackLabel: string) {
  const exists = await elementExists(tabTestId, 3000);
  if (exists) {
    await tapElement(tabTestId);
  } else {
    const tab = await $(
      `-ios predicate string:label CONTAINS "${fallbackLabel}"`,
    );
    await tab.waitForExist({timeout: 10000});
    await tab.click();
  }
  await pause(2000);
}

/**
 * Find Sign Out button across all supported languages
 */
async function findSignOutButton(): Promise<WebdriverIO.Element> {
  const signOutBtn = await $(
    `-ios predicate string:label CONTAINS "Sign Out" OR label CONTAINS "Đăng xuất" OR label CONTAINS "退出登录"`,
  );
  await signOutBtn.waitForExist({timeout: 10000});
  return signOutBtn;
}

describe('Deep Link Authentication', () => {
  before(async () => {
    // Skip onboarding if needed
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      const onboardingExists = await elementExists('onboarding-screen', 3000);
      if (onboardingExists) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }
  });

  describe('Login via deep link', () => {
    before(async () => {
      await ensureLoggedOut();
    });

    it('should authenticate using deep link with Supabase credentials', async () => {
      await loginViaDeepLink();

      const loggedIn = await isLoggedIn();
      expect(loggedIn).toBe(true);
    });

    it('should show authenticated profile screen', async () => {
      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);

      const authPrompt = await elementExists('profile-auth-prompt', 3000);
      expect(authPrompt).toBe(false);
    });

    it('should access booking history without auth prompt', async () => {
      await navigateToTab('tab-bookings', 'Booking');

      const authPromptExists = await elementExists(
        'booking-history-auth-prompt',
        3000,
      );
      expect(authPromptExists).toBe(false);
    });
  });

  describe('Logout after deep link login', () => {
    it('should logout and return to guest mode', async () => {
      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const signOutBtn = await findSignOutButton();
      await signOutBtn.click();
      await pause(1000);

      try {
        await driver.acceptAlert();
      } catch {
        // Alert may auto-dismiss
      }
      await pause(3000);

      const authPrompt = await waitForElement('profile-auth-prompt', 10000);
      expect(await authPrompt.isDisplayed()).toBe(true);
    });
  });

  describe('Re-login after logout', () => {
    it('should be able to login again via deep link', async () => {
      await loginViaDeepLink();

      const loggedIn = await isLoggedIn();
      expect(loggedIn).toBe(true);
    });
  });
});
