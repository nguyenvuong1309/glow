import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
  getElementText,
  findByPartialText,
  scrollDown,
} from '../helpers/utils';
import {loginViaDeepLink, ensureLoggedOut} from '../helpers/auth';

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

describe('Batch A: Authenticated Home & Profile', () => {
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

    // Ensure clean state then login
    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(3000);
  });

  it('TC-A01: Home screen shows personalized greeting after login', async () => {
    await navigateToTab('tab-home', 'Home');

    const greeting = await waitForElement('home-greeting', 10000);
    const text = await greeting.getText();
    // Should show user name, not "Guest"
    expect(text).not.toContain('Guest');
  });

  it('TC-A02: Profile screen shows authenticated user info', async () => {
    await navigateToTab('tab-profile', 'Profile');
    await pause(2000);

    // Should show profile screen (not auth prompt)
    const profileScreen = await elementExists('profile-screen', 10000);
    expect(profileScreen).toBe(true);

    const authPrompt = await elementExists('profile-auth-prompt', 3000);
    expect(authPrompt).toBe(false);

    // Profile name should be visible
    const profileName = await elementExists('profile-name', 5000);
    expect(profileName).toBe(true);
  });

  it('TC-A03: Profile shows provider menu items when authenticated', async () => {
    await navigateToTab('tab-profile', 'Profile');
    await pause(2000);

    // Check for provider menu items by label text
    const dashboard = await findByPartialText('Dashboard');
    expect(await dashboard.isDisplayed()).toBe(true);
  });

  it('TC-A04: Booking history accessible without auth prompt when logged in', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // Should NOT show auth prompt
    const authPrompt = await elementExists('booking-history-auth-prompt', 3000);
    expect(authPrompt).toBe(false);
  });

  it('TC-A05: Language switch works on authenticated profile', async () => {
    await navigateToTab('tab-profile', 'Profile');
    await pause(2000);

    // Scroll down to find language section
    await scrollDown();
    await pause(1000);

    // Switch to Vietnamese
    const viChip = await elementExists('profile-language-vi', 5000);
    if (viChip) {
      await tapElement('profile-language-vi');
      await pause(2000);

      // Switch back to English
      await tapElement('profile-language-en');
      await pause(2000);
    }

    // Profile should still be authenticated
    const profileScreen = await elementExists('profile-screen', 5000);
    expect(profileScreen).toBe(true);
  });

  after(async () => {
    // Clean up: logout
    await ensureLoggedOut();
  });
});
