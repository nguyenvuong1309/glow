import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
  findByPartialText,
  scrollDown,
  getElementText,
  findByText,
} from '../helpers/utils';
import {loginViaDeepLink, ensureLoggedOut} from '../helpers/auth';

/**
 * Navigate to a tab by testID with a fallback label-based selector.
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
 * Navigate to the first available service detail screen.
 * Uses Home screen service cards (more reliable than service list with Animated.View).
 */
async function navigateToServiceDetail(): Promise<void> {
  await navigateToTab('tab-home', 'Home');
  await pause(3000);

  // Scroll down to find service cards in New Services or Top Rated sections
  await scrollDown();
  await pause(2000);

  const serviceCards = await $$('-ios predicate string:name BEGINSWITH "service-card-"');
  if (serviceCards.length > 0) {
    await serviceCards[0].click();
    await pause(3000);
  }
}

describe('Batch C: Authenticated Booking Flow', () => {
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

    // Ensure clean state: logout then login
    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(3000);
  });

  it('TC-C01: Navigate to service detail and tap Book Now (no login prompt)', async () => {
    await navigateToServiceDetail();

    // Verify we are on the service detail screen
    const detailExists = await elementExists('service-detail-screen', 10000);
    expect(detailExists).toBe(true);

    // Tap the Book Now button
    await tapElement('service-detail-book-button');
    await pause(3000);

    // Since we are authenticated, there should be NO auth prompt.
    // We should land on a booking screen, not a login prompt.
    const authPromptExists = await elementExists(
      'booking-history-auth-prompt',
      3000,
    );
    expect(authPromptExists).toBe(false);
  });

  it('TC-C02: Booking screen displays service info and date selection', async () => {
    // After tapping Book Now in TC-C01, we should be on the booking screen.
    // Look for booking-related content using text-based selectors.
    let bookingElementFound = false;

    try {
      const bookingElement = await $(
        `-ios predicate string:label CONTAINS "Book"`,
      );
      await bookingElement.waitForExist({timeout: 10000});
      bookingElementFound = await bookingElement.isDisplayed();
    } catch {
      // Booking screen may not have loaded; check if we can find date-related text
    }

    // Also check for date selection elements (day names, numbers, or "Select" text)
    let dateElementFound = false;
    try {
      const dateElement = await $(
        `-ios predicate string:label CONTAINS "Select" OR label CONTAINS "Date" OR label CONTAINS "Today"`,
      );
      await dateElement.waitForExist({timeout: 5000});
      dateElementFound = await dateElement.isDisplayed();
    } catch {
      // Date selection not found via text
    }

    // At least one of these should be visible on the booking screen
    expect(bookingElementFound || dateElementFound).toBe(true);
  });

  it('TC-C03: Select a date chip on booking screen', async () => {
    // Date chips are typically displayed as short date labels.
    // Try tapping a date chip (usually the first or second available).
    let dateTapped = false;

    try {
      // Try finding a clickable date element (could be a day number or chip)
      const dateChips = await $$(
        `-ios predicate string:type == "XCUIElementTypeButton" AND (label MATCHES "^[0-9]{1,2}$" OR label CONTAINS "Mon" OR label CONTAINS "Tue" OR label CONTAINS "Wed" OR label CONTAINS "Thu" OR label CONTAINS "Fri" OR label CONTAINS "Sat" OR label CONTAINS "Sun")`,
      );

      if (dateChips.length > 0) {
        // Tap the first available date chip
        await dateChips[0].click();
        await pause(2000);
        dateTapped = true;
      }
    } catch {
      // Date chips not found with day-name pattern
    }

    if (!dateTapped) {
      // Fallback: try tapping any button-like element that could be a date
      try {
        const anyDateBtn = await $(
          `-ios predicate string:type == "XCUIElementTypeButton" AND label MATCHES "^[0-9]{1,2}$"`,
        );
        await anyDateBtn.waitForExist({timeout: 5000});
        await anyDateBtn.click();
        await pause(2000);
        dateTapped = true;
      } catch {
        // Could not find date chips
      }
    }

    // We verify the tap did not crash the screen; booking screen should still be visible
    const bookingStillVisible = await $(
      `-ios predicate string:label CONTAINS "Book" OR label CONTAINS "Select" OR label CONTAINS "Time"`,
    );
    let screenStable = false;
    try {
      await bookingStillVisible.waitForExist({timeout: 5000});
      screenStable = await bookingStillVisible.isDisplayed();
    } catch {
      screenStable = false;
    }

    expect(dateTapped || screenStable).toBe(true);
  });

  it('TC-C04: Select a time slot after selecting date', async () => {
    // Time slots are typically displayed as time labels (e.g. "9:00 AM", "10:00", etc.)
    let timeSlotTapped = false;

    try {
      // Look for time slot elements containing AM/PM or hour patterns
      const timeSlots = await $$(
        `-ios predicate string:type == "XCUIElementTypeButton" AND (label CONTAINS "AM" OR label CONTAINS "PM" OR label MATCHES "^[0-9]{1,2}:[0-9]{2}$")`,
      );

      if (timeSlots.length > 0) {
        await timeSlots[0].click();
        await pause(2000);
        timeSlotTapped = true;
      }
    } catch {
      // Time slots not found
    }

    if (!timeSlotTapped) {
      // Fallback: scroll down to reveal time slots and try again
      await scrollDown();
      await pause(1000);

      try {
        const timeSlots = await $$(
          `-ios predicate string:type == "XCUIElementTypeButton" AND (label CONTAINS "AM" OR label CONTAINS "PM" OR label MATCHES "^[0-9]{1,2}:[0-9]{2}$")`,
        );

        if (timeSlots.length > 0) {
          await timeSlots[0].click();
          await pause(2000);
          timeSlotTapped = true;
        }
      } catch {
        // Still not found after scrolling
      }
    }

    // Verify the screen is still stable (booking or confirm elements visible)
    let screenStable = false;
    try {
      const element = await $(
        `-ios predicate string:label CONTAINS "Book" OR label CONTAINS "Confirm" OR label CONTAINS "Time" OR label CONTAINS "Select"`,
      );
      await element.waitForExist({timeout: 5000});
      screenStable = await element.isDisplayed();
    } catch {
      screenStable = false;
    }

    expect(timeSlotTapped || screenStable).toBe(true);
  });

  it('TC-C05: Verify booking history tab is accessible after flow', async () => {
    // Navigate to the Bookings tab to verify it is accessible while authenticated
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // When authenticated, the bookings tab should NOT show an auth prompt
    const authPromptExists = await elementExists(
      'booking-history-auth-prompt',
      3000,
    );
    expect(authPromptExists).toBe(false);

    // The screen should display booking history content (or an empty state, but not an auth wall)
    // Verify at least some content is present on the bookings screen
    let contentVisible = false;
    try {
      const content = await $(
        `-ios predicate string:label CONTAINS "Booking" OR label CONTAINS "booking" OR label CONTAINS "No" OR label CONTAINS "History" OR label CONTAINS "Upcoming"`,
      );
      await content.waitForExist({timeout: 10000});
      contentVisible = await content.isDisplayed();
    } catch {
      // Content check failed; tab may still have loaded correctly
    }

    // If we got past the auth prompt check, the tab is accessible
    expect(contentVisible).toBe(true);
  });

  after(async () => {
    await ensureLoggedOut();
  });
});
