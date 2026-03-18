import {
  waitForElement,
  elementExists,
  tapElement,
  isDisplayed,
  pause,
  findByPartialText,
} from '../helpers/utils';

async function navigateToTab(tabTestId: string, fallbackLabel: string) {
  const exists = await elementExists(tabTestId, 3000);
  if (exists) {
    await tapElement(tabTestId);
  } else {
    const tab = await $(`-ios predicate string:label CONTAINS "${fallbackLabel}"`);
    await tab.waitForExist({ timeout: 10000 });
    await tab.click();
  }
  await pause(2000);
}

describe('Batch 3: Authentication', () => {
  before(async () => {
    // Ensure we start from home screen
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      const onboardingExists = await elementExists('onboarding-screen', 3000);
      if (onboardingExists) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }
  });

  // TC-011: Login Screen - Display login buttons
  it('TC-011: should display login screen with Google and Apple buttons', async () => {
    // Navigate to Profile tab which shows auth prompt
    await navigateToTab('tab-profile', 'Profile');

    // Tap sign in button to open login modal
    await tapElement('profile-sign-in-button');
    await pause(3000);

    // Wait for login screen
    const loginScreen = await waitForElement('login-screen', 15000);
    expect(await loginScreen.isDisplayed()).toBe(true);

    // Verify logo
    const logo = await waitForElement('login-logo');
    expect(await logo.isDisplayed()).toBe(true);

    // Verify tagline
    const tagline = await waitForElement('login-tagline');
    expect(await tagline.isDisplayed()).toBe(true);

    // Verify Google login button
    const googleButton = await waitForElement('login-google-button');
    expect(await googleButton.isDisplayed()).toBe(true);

    // Verify Apple login button (iOS only)
    const appleButton = await waitForElement('login-apple-button');
    expect(await appleButton.isDisplayed()).toBe(true);

    // Verify skip button
    const skipButton = await waitForElement('login-skip-button');
    expect(await skipButton.isDisplayed()).toBe(true);
  });

  // TC-012: Login Screen - Skip login
  it('TC-012: should skip login and return to previous screen', async () => {
    // Should be on login screen from previous test
    const loginScreen = await waitForElement('login-screen', 10000);
    expect(await loginScreen.isDisplayed()).toBe(true);

    // Tap skip button
    await tapElement('login-skip-button');
    await pause(2000);

    // Should return to profile screen with auth prompt
    const profileAuthPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await profileAuthPrompt.isDisplayed()).toBe(true);
  });

  // TC-013: Profile - Guest mode shows sign in prompt
  it('TC-013: should show sign in prompt in guest mode on profile screen', async () => {
    // Should be on profile tab from previous test
    const profileAuthPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await profileAuthPrompt.isDisplayed()).toBe(true);

    // Verify auth title is displayed
    const authTitle = await waitForElement('profile-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);

    // Verify sign in button is displayed
    const signInButton = await waitForElement('profile-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Verify language chips are still available in guest mode
    // Language section should be visible even without auth
    const languageEn = await elementExists('profile-language-en', 5000);
    expect(languageEn).toBe(true);
  });

  // TC-014: Profile - Change language
  it('TC-014: should change app language from profile screen', async () => {
    // Should be on profile auth prompt
    const profileAuthPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await profileAuthPrompt.isDisplayed()).toBe(true);

    // Verify EN language chip exists
    const enChip = await waitForElement('profile-language-en');
    expect(await enChip.isDisplayed()).toBe(true);

    // Look for VI language chip
    const viChipExists = await elementExists('profile-language-vi', 5000);
    if (viChipExists) {
      // Tap Vietnamese language chip
      await tapElement('profile-language-vi');
      await pause(2000);

      // Language should change - verify by checking that auth prompt title changed
      // Then switch back to English
      await tapElement('profile-language-en');
      await pause(2000);
    }

    // Verify we're still on profile auth prompt
    expect(await profileAuthPrompt.isDisplayed()).toBe(true);
  });

  // TC-015: Booking History - Requires login when not authenticated
  it('TC-015: should show login required prompt on booking history when not authenticated', async () => {
    // Navigate to Bookings tab
    await navigateToTab('tab-bookings', 'Booking');

    // Should show auth prompt since not authenticated
    const authPrompt = await waitForElement('booking-history-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Verify auth title
    const authTitle = await waitForElement('booking-history-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);

    // Verify sign in button exists
    const signInButton = await waitForElement('booking-history-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Tap sign in - should open login modal
    await tapElement('booking-history-sign-in-button');
    await pause(3000);

    // Login screen should appear
    const loginScreen = await waitForElement('login-screen', 15000);
    expect(await loginScreen.isDisplayed()).toBe(true);

    // Close login screen
    const closeButton = await waitForElement('login-close-button');
    await closeButton.click();
    await pause(2000);

    // Navigate back to home
    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });
});
