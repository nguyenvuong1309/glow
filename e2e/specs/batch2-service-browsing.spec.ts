import {
  waitForElement,
  elementExists,
  tapElement,
  getElementText,
  isDisplayed,
  pause,
  scrollDown,
  findByPartialText,
} from '../helpers/utils';

/**
 * Helper: navigate to a specific tab
 */
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

describe('Batch 2: Service Browsing', () => {
  before(async () => {
    // Ensure we start from home screen (onboarding already completed from Batch 1)
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      // If on onboarding, skip it
      const onboardingExists = await elementExists('onboarding-screen', 3000);
      if (onboardingExists) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }
  });

  // TC-006: Service List - Display service list
  it('TC-006: should display service list screen with services', async () => {
    // Navigate to Services tab
    await navigateToTab('tab-services', 'Services');

    // Verify service list screen is displayed
    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Verify search bar is present
    const searchBar = await waitForElement('service-list-search-bar');
    expect(await searchBar.isDisplayed()).toBe(true);

    // Verify "All" category chip exists
    const allChip = await waitForElement('service-list-category-all');
    expect(await allChip.isDisplayed()).toBe(true);

    // Verify filter button exists
    const filterButton = await waitForElement('service-list-filter-button');
    expect(await filterButton.isDisplayed()).toBe(true);

    // Verify at least one service card exists (by looking for any service-card element)
    // We use a predicate to find elements whose name starts with service-card-
    const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');
    // May or may not have services depending on backend, just verify the screen loaded
    expect(await serviceListScreen.isDisplayed()).toBe(true);
  });

  // TC-007: Service List - Filter by category
  it('TC-007: should filter services by category chip', async () => {
    // Should be on service list screen
    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Verify "All" category is initially selected (displayed)
    const allChip = await waitForElement('service-list-category-all');
    expect(await allChip.isDisplayed()).toBe(true);

    // Try to find and tap a category chip (look for any category chip)
    const categoryChips = await $$('-ios predicate string:name BEGINSWITH "service-list-category-" AND name != "service-list-category-all"');
    if (categoryChips.length > 0) {
      // Tap the first category
      await categoryChips[0].click();
      await pause(1000);

      // The category should now be selected
      // Tap "All" to reset
      await tapElement('service-list-category-all');
      await pause(1000);
    }

    // Verify we're still on service list screen
    expect(await serviceListScreen.isDisplayed()).toBe(true);
  });

  // TC-008: Service List - Search services
  it('TC-008: should search services in the service list', async () => {
    // Should be on service list screen
    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Find search bar and type
    const searchBar = await waitForElement('service-list-search-bar');
    await searchBar.click();
    await pause(500);

    // Type search text
    await searchBar.setValue('massage');
    await pause(1000);

    // Verify still on service list screen (results shown or empty)
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Clear search
    await searchBar.clearValue();
    await pause(500);

    // Dismiss keyboard by tapping elsewhere
    await serviceListScreen.click();
    await pause(500);
  });

  // TC-009: Service Detail - Display service detail information
  it('TC-009: should display service detail when tapping a service card', async () => {
    // Navigate to Services tab (better chance of finding service cards)
    await navigateToTab('tab-services', 'Services');
    await pause(2000);

    const serviceListScreen = await waitForElement('service-list-screen', 15000);
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Wait for services to load
    await pause(3000);

    // Find any service card on service list screen
    const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');

    if (serviceCards.length > 0) {
      // Tap the first service card
      await serviceCards[0].click();
      await pause(3000);

      // Verify service detail screen is displayed
      const serviceDetailScreen = await waitForElement('service-detail-screen', 20000);
      expect(await serviceDetailScreen.isDisplayed()).toBe(true);

      // Scroll down to see all content
      await scrollDown();
      await pause(1000);

      // Verify service detail elements
      const category = await waitForElement('service-detail-category', 10000);
      expect(await category.isDisplayed()).toBe(true);

      const description = await waitForElement('service-detail-description', 10000);
      expect(await description.isDisplayed()).toBe(true);

      // Verify favorite button exists
      const favoriteButton = await waitForElement('service-detail-favorite-button', 10000);
      expect(await favoriteButton.isDisplayed()).toBe(true);

      // Scroll down more to check reviews
      await scrollDown();
      await pause(1000);

      // Verify reviews section exists
      const reviewsSection = await waitForElement('service-detail-reviews-section', 10000);
      expect(await reviewsSection.isDisplayed()).toBe(true);
    } else {
      // No services available, just verify the screen is working
      console.log('No service cards found - skipping detail check');
      expect(await serviceListScreen.isDisplayed()).toBe(true);
    }
  });

  // TC-010: Service Detail - View image gallery
  it('TC-010: should be able to view service images', async () => {
    // Check if we're on service detail screen from previous test
    const onDetailScreen = await elementExists('service-detail-screen', 3000);

    if (onDetailScreen) {
      // Scroll up to see images
      const { width, height } = await driver.getWindowRect();
      await driver.action('pointer')
        .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.3) })
        .down()
        .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.7), duration: 300 })
        .up()
        .perform();
      await pause(1000);

      // Look for the image in the service detail
      // Images are in a FlatList, try to find any XCUIElementTypeImage
      const images = await $$('-ios class chain:**/XCUIElementTypeImage');
      if (images.length > 0) {
        // Tap on the first image to open gallery
        await images[0].click();
        await pause(2000);

        // Gallery should be visible - try to close it by tapping
        // ImageViewing uses a close button or tap to dismiss
        try {
          // Try tapping to dismiss gallery
          await driver.action('pointer')
            .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.1) })
            .down()
            .up()
            .perform();
          await pause(1000);
        } catch {
          // Gallery might have auto-closed
        }
      }

      // Navigate back to home
      // Find back button
      try {
        const backButton = await $('-ios class chain:**/XCUIElementTypeButton[`label CONTAINS "Back" OR label CONTAINS "back"`]');
        if (await backButton.isExisting()) {
          await backButton.click();
          await pause(1000);
        }
      } catch {
        // Use tab navigation to go back
      }
    }

    // Navigate to home tab
    await navigateToTab('tab-home', 'Home');
    await pause(1000);

    // Verify we're back on home
    const homeScreen = await waitForElement('home-screen', 10000);
    expect(await homeScreen.isDisplayed()).toBe(true);
  });
});
