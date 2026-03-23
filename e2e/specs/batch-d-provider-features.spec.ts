import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
  findByPartialText,
  scrollDown,
} from '../helpers/utils';
import {loginViaDeepLink, ensureLoggedOut} from '../helpers/auth';

/**
 * Navigate to a bottom tab by testID with a fallback label search.
 */
async function navigateToTab(
  tabTestId: string,
  fallbackLabel: string,
): Promise<void> {
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
 * Navigate to profile tab and tap a menu item by its text label.
 * Returns after the destination screen has had time to load.
 */
async function tapProfileMenuItem(label: string): Promise<void> {
  await navigateToTab('tab-profile', 'Profile');
  await pause(1000);

  // Some menu items may be below the fold – scroll down to make sure they are visible
  try {
    const item = await findByPartialText(label, 5000);
    await item.click();
  } catch {
    await scrollDown();
    await pause(1000);
    const item = await findByPartialText(label, 5000);
    await item.click();
  }
  await pause(2000);
}

/**
 * Verify that a new screen loaded by checking for common navigation indicators:
 * a back button, a navigation bar title, or simply that the profile-screen is no longer dominant.
 */
async function verifyScreenLoaded(): Promise<boolean> {
  // Check for a back button (standard iOS navigation back button)
  try {
    const backButton = await $(
      `-ios predicate string:label CONTAINS "Back" OR label CONTAINS "Profile" OR type == "XCUIElementTypeNavigationBar"`,
    );
    const backExists = await backButton.waitForExist({timeout: 5000});
    if (backExists) {
      return true;
    }
  } catch {
    // fall through
  }

  // If no back button found, at least verify the profile menu is gone
  // (meaning we navigated away)
  const profileStillVisible = await elementExists('profile-screen', 2000);
  return !profileStillVisible;
}

/**
 * Go back to the previous screen.
 */
async function goBack(): Promise<void> {
  try {
    // Try the standard iOS back button first
    const backButton = await $(
      `-ios predicate string:type == "XCUIElementTypeButton" AND (label CONTAINS "Back" OR label CONTAINS "Profile")`,
    );
    const exists = await backButton.waitForExist({timeout: 3000});
    if (exists) {
      await backButton.click();
      await pause(1500);
      return;
    }
  } catch {
    // fall through
  }
  // Fallback to driver.back()
  await driver.back();
  await pause(1500);
}

describe('Batch D: Provider Features Navigation', () => {
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

    // Ensure clean state then authenticate
    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(3000);
  });

  afterEach(async () => {
    // Return to profile tab after each test to keep state consistent
    await navigateToTab('tab-profile', 'Profile');
    await pause(1000);
  });

  after(async () => {
    await ensureLoggedOut();
  });

  it('TC-D01: should navigate to Dashboard from profile menu', async () => {
    await tapProfileMenuItem('Dashboard');

    const screenLoaded = await verifyScreenLoaded();
    expect(screenLoaded).toBe(true);

    await goBack();
  });

  it('TC-D02: should navigate to My Services from profile menu', async () => {
    await tapProfileMenuItem('My Services');

    const screenLoaded = await verifyScreenLoaded();
    expect(screenLoaded).toBe(true);

    await goBack();
  });

  it('TC-D03: should navigate to Booking Requests from profile menu', async () => {
    await tapProfileMenuItem('Booking Requests');

    const screenLoaded = await verifyScreenLoaded();
    expect(screenLoaded).toBe(true);

    await goBack();
  });

  it('TC-D04: should navigate to Favorites from profile menu', async () => {
    await tapProfileMenuItem('Favorites');

    const screenLoaded = await verifyScreenLoaded();
    expect(screenLoaded).toBe(true);

    await goBack();
  });

  it('TC-D05: should navigate to Post Service and verify form elements', async () => {
    await tapProfileMenuItem('Post');

    const screenLoaded = await verifyScreenLoaded();
    expect(screenLoaded).toBe(true);

    // Verify form elements are present on the Post Service screen
    // Look for common form indicators: input fields, text areas, or submit buttons
    let hasFormElements = false;
    try {
      const formElement = await $(
        `-ios predicate string:type == "XCUIElementTypeTextField" OR type == "XCUIElementTypeTextView" OR type == "XCUIElementTypeSwitch" OR (type == "XCUIElementTypeButton" AND (label CONTAINS "Post" OR label CONTAINS "Submit" OR label CONTAINS "Save" OR label CONTAINS "Create"))`,
      );
      hasFormElements = await formElement.waitForExist({timeout: 5000});
    } catch {
      // Form elements may have different structure; screen load is still verified above
      hasFormElements = false;
    }
    expect(hasFormElements).toBe(true);

    await goBack();
  });
});
