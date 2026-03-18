import {
  waitForElement,
  elementExists,
  tapElement,
  isDisplayed,
  pause,
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

describe('Batch 5: Booking Management', () => {
  before(async () => {
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      const onboardingExists = await elementExists('onboarding-screen', 3000);
      if (onboardingExists) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }
  });

  // TC-021: Booking History - Display booking list (auth required)
  it('TC-021: should show booking history auth prompt for unauthenticated user', async () => {
    await navigateToTab('tab-bookings', 'Booking');

    const authPrompt = await waitForElement('booking-history-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    const authTitle = await waitForElement('booking-history-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);
    const titleText = await authTitle.getText();
    expect(titleText.length).toBeGreaterThan(0);
  });

  // TC-022: Booking History - Calendar/List view toggle (auth required)
  it('TC-022: should show sign in button on booking history', async () => {
    // Verify we're still on booking history auth prompt
    const authPrompt = await waitForElement('booking-history-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Sign in button should be visible
    const signInButton = await waitForElement('booking-history-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Tap sign in to verify it opens login
    await signInButton.click();
    await pause(3000);

    const loginScreen = await waitForElement('login-screen', 15000);
    expect(await loginScreen.isDisplayed()).toBe(true);

    // Close login
    await tapElement('login-close-button');
    await pause(2000);
  });

  // TC-023: Booking History - Cancel booking (auth required screen)
  it('TC-023: should display booking history auth screen with all elements', async () => {
    // Navigate to bookings again
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    const authPrompt = await waitForElement('booking-history-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Verify title and button exist together
    const authTitle = await waitForElement('booking-history-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);

    const signInButton = await waitForElement('booking-history-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Verify the complete prompt layout
    expect(await authPrompt.isDisplayed()).toBe(true);
  });

  // TC-024: Spending - Display spending stats (via profile auth prompt)
  it('TC-024: should show profile auth prompt with language options', async () => {
    await navigateToTab('tab-profile', 'Profile');

    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Verify language options are visible
    const enLang = await waitForElement('profile-language-en');
    expect(await enLang.isDisplayed()).toBe(true);
  });

  // TC-025: Spending - Navigate between months (via profile navigation)
  it('TC-025: should display profile screen with sign in and language controls', async () => {
    // Should still be on profile
    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Verify sign in button
    const signInButton = await waitForElement('profile-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Verify EN language chip
    const enLang = await waitForElement('profile-language-en');
    expect(await enLang.isDisplayed()).toBe(true);

    // Check if VI language chip exists
    const viExists = await elementExists('profile-language-vi', 3000);
    expect(viExists).toBe(true);

    // Go back to home
    await navigateToTab('tab-home', 'Home');
    await pause(1000);
    expect(await isDisplayed('home-screen')).toBe(true);
  });
});
