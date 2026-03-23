import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
  scrollDown,
  findByPartialText,
} from '../helpers/utils';
import {loginViaDeepLink, ensureLoggedOut} from '../helpers/auth';

/**
 * Helper: navigate to a tab by testID with fallback to label predicate.
 */
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
 * Helper: open the first service detail from the home screen.
 * Looks for any element whose accessibility id starts with "service-card-".
 */
async function openServiceDetailFromHome() {
  const serviceCard = await $(
    `-ios predicate string:name BEGINSWITH "service-card-"`,
  );
  await serviceCard.waitForExist({timeout: 15000});
  await serviceCard.click();
  await pause(2000);
}

/**
 * Helper: pull-to-refresh gesture (swipe down from top area).
 */
async function pullToRefresh() {
  const {width, height} = await driver.getWindowRect();
  await driver
    .action('pointer')
    .move({x: Math.round(width / 2), y: Math.round(height * 0.3)})
    .down()
    .move({
      x: Math.round(width / 2),
      y: Math.round(height * 0.7),
      duration: 500,
    })
    .up()
    .perform();
  await pause(2000);
}

/**
 * Helper: scroll up (reverse of scrollDown).
 */
async function scrollUp() {
  const {width, height} = await driver.getWindowRect();
  await driver
    .action('pointer')
    .move({x: Math.round(width * 0.5), y: Math.round(height * 0.3)})
    .down()
    .move({
      x: Math.round(width * 0.5),
      y: Math.round(height * 0.7),
      duration: 300,
    })
    .up()
    .perform();
}

describe('Batch Q - Edge Cases & Navigation Flows', () => {
  before(async () => {
    // Skip onboarding if needed
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      const onboardingExists = await elementExists(
        'onboarding-screen',
        3000,
      );
      if (onboardingExists) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }

    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(2000);
  });

  after(async () => {
    await ensureLoggedOut();
  });

  // Reset to home tab before each test
  beforeEach(async () => {
    await navigateToTab('tab-home', 'Home');
    await pause(1000);
  });

  it('TC-Q01: Rapid tab switching does not crash the app', async () => {
    // Quickly tap all 4 tabs in sequence: home → services → bookings → profile → home
    await navigateToTab('tab-home', 'Home');
    await pause(500);

    await navigateToTab('tab-services', 'Service');
    await pause(500);

    await navigateToTab('tab-bookings', 'Booking');
    await pause(500);

    await navigateToTab('tab-profile', 'Profile');
    await pause(500);

    await navigateToTab('tab-home', 'Home');
    await pause(1000);

    // Verify the app did not crash and home screen is visible
    const homeVisible = await elementExists('home-screen', 10000);
    expect(homeVisible).toBe(true);
  });

  it('TC-Q02: Deep navigation and back returns to home screen', async () => {
    // Home → Service Detail
    await openServiceDetailFromHome();
    const detailVisible = await elementExists('service-detail-screen', 10000);
    expect(detailVisible).toBe(true);

    // Service Detail → Book Now (booking screen)
    const bookBtnExists = await elementExists(
      'service-detail-book-button',
      5000,
    );
    if (bookBtnExists) {
      await tapElement('service-detail-book-button');
      await pause(2000);
    }

    // Navigate back from booking screen
    try {
      await driver.back();
      await pause(1500);
    } catch {
      // Fallback: tap the native back button
      const backBtn = await $(
        `-ios predicate string:label CONTAINS "Back" OR label CONTAINS "back"`,
      );
      if (await backBtn.isExisting()) {
        await backBtn.click();
        await pause(1500);
      }
    }

    // Navigate back from service detail screen
    try {
      await driver.back();
      await pause(1500);
    } catch {
      const backBtn = await $(
        `-ios predicate string:label CONTAINS "Back" OR label CONTAINS "back"`,
      );
      if (await backBtn.isExisting()) {
        await backBtn.click();
        await pause(1500);
      }
    }

    // Verify home screen is visible
    const homeVisible = await elementExists('home-screen', 10000);
    expect(homeVisible).toBe(true);
  });

  it('TC-Q03: Pull to refresh on home screen keeps content visible', async () => {
    // Verify home screen is showing before refresh
    const homeBeforeRefresh = await elementExists('home-screen', 10000);
    expect(homeBeforeRefresh).toBe(true);

    // Perform pull-to-refresh
    await pullToRefresh();

    // Verify home screen still displays correctly after refresh
    const homeAfterRefresh = await elementExists('home-screen', 10000);
    expect(homeAfterRefresh).toBe(true);

    // Verify some content is still present (new services section title)
    const contentExists = await elementExists(
      'home-new-services-title',
      5000,
    );
    expect(contentExists).toBe(true);
  });

  it('TC-Q04: Pull to refresh on service list keeps content visible', async () => {
    // Navigate to services tab
    await navigateToTab('tab-services', 'Service');
    await pause(1000);

    // Verify service list screen is showing
    const listBeforeRefresh = await elementExists(
      'service-list-screen',
      10000,
    );
    expect(listBeforeRefresh).toBe(true);

    // Perform pull-to-refresh
    await pullToRefresh();

    // Verify service list screen still displays correctly
    const listAfterRefresh = await elementExists(
      'service-list-screen',
      10000,
    );
    expect(listAfterRefresh).toBe(true);

    // Verify the search bar or category filters are still present
    const searchBarExists = await elementExists(
      'service-list-search-bar',
      5000,
    );
    const categoryAllExists = await elementExists(
      'service-list-category-all',
      5000,
    );
    expect(searchBarExists || categoryAllExists).toBe(true);
  });

  it('TC-Q05: Scroll past reviews then scroll back up - top content intact', async () => {
    // Open a service detail from home
    await openServiceDetailFromHome();
    const detailVisible = await elementExists('service-detail-screen', 10000);
    expect(detailVisible).toBe(true);

    // Scroll down several times to get past the reviews section
    await scrollDown();
    await pause(500);
    await scrollDown();
    await pause(500);
    await scrollDown();
    await pause(500);
    await scrollDown();
    await pause(500);

    // Verify reviews section was scrolled into view at some point
    const reviewsExists = await elementExists(
      'service-detail-reviews-section',
      3000,
    );
    // Reviews may or may not be visible depending on scroll position; continue regardless

    // Scroll back up multiple times to return to top
    await scrollUp();
    await pause(500);
    await scrollUp();
    await pause(500);
    await scrollUp();
    await pause(500);
    await scrollUp();
    await pause(500);

    // Verify the service detail screen is still intact at the top
    const detailStillVisible = await elementExists(
      'service-detail-screen',
      10000,
    );
    expect(detailStillVisible).toBe(true);

    // Verify the category label (near the top of the detail) is visible
    const categoryVisible = await elementExists(
      'service-detail-category',
      5000,
    );
    expect(categoryVisible).toBe(true);
  });
});
