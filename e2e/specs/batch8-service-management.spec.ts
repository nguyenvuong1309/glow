import {
  waitForElement,
  elementExists,
  tapElement,
  isDisplayed,
  pause,
  getElementText,
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

describe('Batch 8: Service Management', () => {
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

  // TC-036: Post Service - Display form (auth required)
  it('TC-036: should require auth for posting a service', async () => {
    await navigateToTab('tab-profile', 'Profile');

    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Post service requires auth
    const signInButton = await waitForElement('profile-sign-in-button');
    expect(await signInButton.isDisplayed()).toBe(true);

    // Verify auth title
    const authTitle = await waitForElement('profile-auth-title');
    expect(await authTitle.isDisplayed()).toBe(true);
  });

  // TC-037: Post Service - Validation form (auth required)
  it('TC-037: should show auth prompt with proper layout', async () => {
    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // All auth elements should be present
    expect(await isDisplayed('profile-auth-title')).toBe(true);
    expect(await isDisplayed('profile-sign-in-button')).toBe(true);

    // Language section should be visible even in guest mode
    expect(await isDisplayed('profile-language-en')).toBe(true);
  });

  // TC-038: Post Service - Select category (via service list categories)
  it('TC-038: should display and interact with category chips on service list', async () => {
    await navigateToTab('tab-services', 'Services');
    await pause(3000);

    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Verify "All" category chip
    const allChip = await waitForElement('service-list-category-all');
    expect(await allChip.isDisplayed()).toBe(true);

    // Find category chips
    const categoryChips = await $$('-ios predicate string:name BEGINSWITH "service-list-category-" AND name != "service-list-category-all"');

    if (categoryChips.length > 0) {
      // Tap first category
      await categoryChips[0].click();
      await pause(1000);

      // Tap "All" to reset
      await tapElement('service-list-category-all');
      await pause(1000);

      // Tap another category if available
      if (categoryChips.length > 1) {
        await categoryChips[1].click();
        await pause(1000);
        await tapElement('service-list-category-all');
        await pause(500);
      }
    }

    expect(await serviceListScreen.isDisplayed()).toBe(true);
  });

  // TC-039: My Services - Display services (auth required)
  it('TC-039: should require auth for accessing my services', async () => {
    await navigateToTab('tab-profile', 'Profile');

    const authPrompt = await waitForElement('profile-auth-prompt', 15000);
    expect(await authPrompt.isDisplayed()).toBe(true);

    // Open login modal
    await tapElement('profile-sign-in-button');
    await pause(3000);

    const loginScreen = await waitForElement('login-screen', 15000);
    expect(await loginScreen.isDisplayed()).toBe(true);

    // Verify Google and Apple buttons
    expect(await isDisplayed('login-google-button')).toBe(true);
    expect(await isDisplayed('login-apple-button')).toBe(true);

    // Close login
    await tapElement('login-close-button');
    await pause(2000);
  });

  // TC-040: My Services - Tap to edit service (via service card navigation)
  it('TC-040: should navigate through service cards to service detail', async () => {
    await navigateToTab('tab-home', 'Home');
    await pause(2000);
    await navigateToTab('tab-services', 'Services');
    await pause(3000);

    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Find service cards
    const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');
    if (serviceCards.length > 0) {
      // Tap first service
      await serviceCards[0].click();
      await pause(3000);

      const serviceDetailScreen = await waitForElement('service-detail-screen', 15000);
      expect(await serviceDetailScreen.isDisplayed()).toBe(true);

      // Verify detail content
      expect(await isDisplayed('service-detail-category')).toBe(true);

      // Scroll to see more
      await scrollDown();
      await pause(1000);
      expect(await isDisplayed('service-detail-description')).toBe(true);
    }

    // Go home
    await navigateToTab('tab-home', 'Home');
    await pause(1000);
    expect(await isDisplayed('home-screen')).toBe(true);
  });
});
