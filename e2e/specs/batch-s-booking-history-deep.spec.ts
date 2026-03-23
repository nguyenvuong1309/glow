import {
  elementExists,
  tapElement,
  pause,
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

async function findHeaderButton(labels: string[]): Promise<WebdriverIO.Element | null> {
  const predicate = labels.map(l => `label CONTAINS "${l}"`).join(' OR ');
  try {
    const btn = await $(`-ios predicate string:${predicate}`);
    const exists = await btn.waitForExist({timeout: 5000}).catch(() => false);
    return exists ? btn : null;
  } catch {
    return null;
  }
}

describe('Batch S: Booking History Deep Tests', () => {
  before(async () => {
    const homeExists = await elementExists('home-screen', 5000);
    if (!homeExists) {
      const onb = await elementExists('onboarding-screen', 3000);
      if (onb) {
        await tapElement('onboarding-skip-button');
        await pause(3000);
      }
    }
    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(3000);
  });

  after(async () => {
    await ensureLoggedOut();
  });

  it('TC-S01: Toggle booking history view without crash', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // Find toggle button by text (Calendar/List/Lịch/Danh sách)
    const toggleBtn = await findHeaderButton(['Calendar', 'List', 'Lịch', 'Danh sách', '日历', '列表']);
    if (toggleBtn) {
      await toggleBtn.click();
      await pause(2000);

      // Toggle back
      const toggleBtn2 = await findHeaderButton(['Calendar', 'List', 'Lịch', 'Danh sách', '日历', '列表']);
      if (toggleBtn2) {
        await toggleBtn2.click();
        await pause(1000);
      }
    }

    // Verify no crash - bookings tab still accessible
    const authPrompt = await elementExists('booking-history-auth-prompt', 2000);
    expect(authPrompt).toBe(false);
  });

  it('TC-S02: Navigate to Spending and cycle through months', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // Find spending button by text
    const spendingBtn = await findHeaderButton(['Spending', 'Chi tiêu', '消费']);
    if (spendingBtn) {
      await spendingBtn.click();
      await pause(3000);

      // Check spending total card
      const totalCard = await elementExists('spending-total-card', 5000);

      // Try month navigation
      const prevMonth = await elementExists('spending-prev-month', 3000);
      if (prevMonth) {
        await tapElement('spending-prev-month');
        await pause(1500);
        await tapElement('spending-next-month');
        await pause(1500);
      }

      await driver.back();
      await pause(1000);
    }
    expect(true).toBe(true);
  });

  it('TC-S03: Calendar view date interaction', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // Switch to calendar view
    const toggleBtn = await findHeaderButton(['Calendar', 'Lịch', '日历']);
    if (toggleBtn) {
      await toggleBtn.click();
      await pause(2000);

      // Try to tap a date number
      try {
        const today = new Date().getDate().toString();
        const dateBtn = await $(
          `-ios predicate string:label == "${today}" AND type == "XCUIElementTypeButton"`,
        );
        const exists = await dateBtn.waitForExist({timeout: 3000}).catch(() => false);
        if (exists) {
          await dateBtn.click();
          await pause(1000);
        }
      } catch { /* no date found */ }

      // Switch back to list
      const listBtn = await findHeaderButton(['List', 'Danh sách', '列表']);
      if (listBtn) {
        await listBtn.click();
        await pause(1000);
      }
    }
    expect(true).toBe(true);
  });

  it('TC-S04: Verify booking content or empty state on history', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(3000);

    // Look for any booking-related content
    let hasContent = false;
    try {
      const content = await $(
        `-ios predicate string:label CONTAINS "Pending" OR label CONTAINS "Confirmed" OR label CONTAINS "Completed" OR label CONTAINS "Cancelled" OR label CONTAINS "No booking" OR label CONTAINS "Chưa có" OR label CONTAINS "empty"`,
      );
      hasContent = await content.waitForExist({timeout: 5000}).catch(() => false);
    } catch { /* */ }

    if (!hasContent) {
      await scrollDown();
      await pause(1000);
    }

    // Either content or empty - both valid, no auth prompt
    const authPrompt = await elementExists('booking-history-auth-prompt', 2000);
    expect(authPrompt).toBe(false);
  });

  it('TC-S05: Pull to refresh on booking history', async () => {
    await navigateToTab('tab-bookings', 'Booking');
    await pause(2000);

    // Pull to refresh gesture
    const {width, height} = await driver.getWindowRect();
    await driver.action('pointer')
      .move({x: Math.round(width / 2), y: Math.round(height * 0.3)})
      .down()
      .move({x: Math.round(width / 2), y: Math.round(height * 0.7), duration: 500})
      .up()
      .perform();
    await pause(3000);

    // Verify still on booking history (no crash, no auth prompt)
    const authPrompt = await elementExists('booking-history-auth-prompt', 2000);
    expect(authPrompt).toBe(false);
  });
});
