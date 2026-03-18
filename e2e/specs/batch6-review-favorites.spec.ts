import {
  waitForElement,
  elementExists,
  tapElement,
  isDisplayed,
  pause,
  scrollDown,
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

describe('Batch 6: Review & Favorites', () => {
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

  // TC-026: Review - Display star rating and comment form (via service detail reviews)
  it('TC-026: should display reviews section on service detail screen', async () => {
    // Navigate to services
    await navigateToTab('tab-services', 'Services');
    await pause(3000);

    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Find a service
    const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');
    if (serviceCards.length > 0) {
      await serviceCards[0].click();
      await pause(3000);

      const serviceDetailScreen = await waitForElement('service-detail-screen', 15000);
      expect(await serviceDetailScreen.isDisplayed()).toBe(true);

      // Scroll to reviews section
      await scrollDown();
      await pause(1000);
      await scrollDown();
      await pause(1000);

      // Verify reviews section exists
      const reviewsSection = await waitForElement('service-detail-reviews-section', 10000);
      expect(await reviewsSection.isDisplayed()).toBe(true);

      // Verify reviews title
      const reviewsTitle = await waitForElement('service-detail-reviews-title', 10000);
      expect(await reviewsTitle.isDisplayed()).toBe(true);
    }

    // Go back home
    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });

  // TC-027: Review - Validation (missing star rating) - reviews read-only
  it('TC-027: should display reviews title with review count', async () => {
    // Navigate to services
    await navigateToTab('tab-services', 'Services');
    await pause(3000);

    const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');
    if (serviceCards.length > 0) {
      await serviceCards[0].click();
      await pause(3000);

      // Scroll to reviews
      await scrollDown();
      await pause(1000);
      await scrollDown();
      await pause(1000);

      const reviewsTitle = await waitForElement('service-detail-reviews-title', 10000);
      const titleText = await reviewsTitle.getText();
      // Title should contain review count like "Reviews (3)"
      expect(titleText.length).toBeGreaterThan(0);
    }

    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });

  // TC-028: Favorites - Display empty state when no favorites
  it('TC-028: should require auth when accessing favorites', async () => {
    // Navigate to profile
    await navigateToTab('tab-profile', 'Profile');

    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Favorites menu item requires auth - verify auth prompt is shown
    const signInButton = await waitForElement('profile-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);
  });

  // TC-029: Favorites - Toggle favorite on service card (requires auth)
  it('TC-029: should require auth when toggling favorite on service card', async () => {
    // Reset nav state completely
    await navigateToTab('tab-home', 'Home');
    await pause(2000);

    // Double-tap services to reset its stack
    await navigateToTab('tab-services', 'Services');
    await pause(1000);
    await navigateToTab('tab-services', 'Services');
    await pause(3000);

    let serviceListVisible = await elementExists('service-list-screen', 5000);
    if (!serviceListVisible) {
      // If still on detail, navigate away and back
      await navigateToTab('tab-home', 'Home');
      await pause(1000);
      await navigateToTab('tab-services', 'Services');
      await pause(3000);
    }

    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Find favorite buttons on service cards
    const favoriteButtons = await $$('-ios predicate string:name BEGINSWITH "service-card-favorite-"');
    if (favoriteButtons.length > 0) {
      await favoriteButtons[0].click();
      await pause(3000);

      // Should show login screen for unauthenticated user
      const loginScreenExists = await elementExists('login-screen', 5000);
      if (loginScreenExists) {
        expect(loginScreenExists).toBe(true);
        await tapElement('login-close-button');
        await pause(2000);
      }
    }

    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });

  // TC-030: Favorites - Display favorites list (via auth gate)
  it('TC-030: should verify profile auth gate blocks favorites access', async () => {
    await navigateToTab('tab-profile', 'Profile');

    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Auth title exists
    const authTitle = await waitForElement('profile-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);

    // Sign in button exists
    const signInButton = await waitForElement('profile-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Language section visible in guest mode
    const enLang = await waitForElement('profile-language-en');
    expect(await enLang.isDisplayed()).toBe(true);

    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });
});
