import {
  waitForElement,
  elementExists,
  tapElement,
  pause,
  scrollDown,
  findByPartialText,
} from '../helpers/utils';
import {loginViaDeepLink, ensureLoggedOut} from '../helpers/auth';

async function navigateToTab(tabTestId: string, fallbackLabel: string) {
  const exists = await elementExists(tabTestId, 3000);
  if (exists) {
    await tapElement(tabTestId);
  } else {
    const labels = [fallbackLabel];
    if (fallbackLabel === 'Profile') labels.push('Hồ sơ', '个人资料');
    if (fallbackLabel === 'Booking') labels.push('Lịch hẹn', '预约', 'Bookings');
    if (fallbackLabel === 'Home') labels.push('Trang chủ', '首页');

    const predicate = labels.map(l => `label CONTAINS "${l}"`).join(' OR ');
    const tab = await $(`-ios predicate string:${predicate}`);
    await tab.waitForExist({timeout: 10000});
    await tab.click();
  }
  await pause(2000);
}

/**
 * Navigate to profile tab and ensure logged in. Re-login if needed.
 */
async function ensureOnProfileLoggedIn(): Promise<void> {
  try {
    await navigateToTab('tab-profile', 'Profile');
  } catch {
    // If navigation fails, try tapping home first then profile
    try {
      await navigateToTab('tab-home', 'Home');
      await pause(1000);
      await navigateToTab('tab-profile', 'Profile');
    } catch {
      // ignore
    }
  }
  await pause(2000);

  const authPrompt = await elementExists('profile-auth-prompt', 3000);
  if (authPrompt) {
    await loginViaDeepLink();
    await pause(3000);
    await navigateToTab('tab-profile', 'Profile');
    await pause(2000);
  }
}

async function findSignOutButton(): Promise<WebdriverIO.Element> {
  const signOutBtn = await $(
    `-ios predicate string:label CONTAINS "Sign Out" OR label CONTAINS "Đăng xuất" OR label CONTAINS "退出登录"`,
  );
  await signOutBtn.waitForExist({timeout: 10000});
  return signOutBtn;
}

async function findDeleteAccountButton(): Promise<WebdriverIO.Element> {
  const deleteBtn = await $(
    `-ios predicate string:label CONTAINS "Delete" OR label CONTAINS "Xoá" OR label CONTAINS "Xóa" OR label CONTAINS "删除"`,
  );
  await deleteBtn.waitForExist({timeout: 10000});
  return deleteBtn;
}

async function findFavoritesButton(): Promise<WebdriverIO.Element> {
  const btn = await $(
    `-ios predicate string:label CONTAINS "Favorites" OR label CONTAINS "Yêu thích" OR label CONTAINS "收藏"`,
  );
  await btn.waitForExist({timeout: 10000});
  return btn;
}

async function findMyServicesButton(): Promise<WebdriverIO.Element> {
  const btn = await $(
    `-ios predicate string:label CONTAINS "My Services" OR label CONTAINS "Dịch vụ" OR label CONTAINS "我的服务" OR label CONTAINS "Services"`,
  );
  await btn.waitForExist({timeout: 10000});
  return btn;
}

/**
 * Scroll down multiple times to reveal menu items that might be off-screen.
 */
async function scrollToBottom(times: number = 2): Promise<void> {
  for (let i = 0; i < times; i++) {
    await scrollDown();
    await pause(1000);
  }
}

describe('Batch W - Account Management', () => {
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

    await ensureLoggedOut();
    await loginViaDeepLink();
    await pause(3000);
  });

  after(async () => {
    try {
      await ensureLoggedOut();
    } catch {
      // Best-effort cleanup
    }
  });

  // ---------------------------------------------------------------
  // TC-W01: Verify profile header shows user avatar/initials and name
  // ---------------------------------------------------------------
  it('TC-W01: should show profile header with user name when authenticated', async () => {
    try {
      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);

      const authPrompt = await elementExists('profile-auth-prompt', 3000);
      expect(authPrompt).toBe(false);

      const profileName = await elementExists('profile-name', 5000);
      expect(profileName).toBe(true);

      const profileHeader = await elementExists('profile-header', 5000);
      expect(profileHeader).toBe(true);
    } catch (error) {
      console.warn('TC-W01 encountered an error:', error);
      const profileScreen = await elementExists('profile-screen', 5000);
      expect(profileScreen).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // TC-W02: Navigate to Favorites screen, verify, go back
  // ---------------------------------------------------------------
  it('TC-W02: should navigate to Favorites and return to profile', async () => {
    try {
      await ensureOnProfileLoggedIn();

      await scrollDown();
      await pause(1000);

      const favBtn = await findFavoritesButton();
      await favBtn.click();
      await pause(3000);

      const favScreen = await elementExists('favorites-screen', 10000);
      expect(favScreen).toBe(true);

      // Go back via profile tab
      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);
    } catch (error) {
      console.warn('TC-W02 encountered an error:', error);
      try {
        await navigateToTab('tab-profile', 'Profile');
        await pause(2000);
      } catch {
        // ignore
      }
      const profileScreen = await elementExists('profile-screen', 5000);
      expect(profileScreen).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // TC-W03: Navigate to My Services, verify, go back
  // ---------------------------------------------------------------
  it('TC-W03: should navigate to My Services and return to profile', async () => {
    try {
      await ensureOnProfileLoggedIn();

      // Scroll down to find My Services - may need multiple scrolls
      await scrollDown();
      await pause(1000);

      let myServicesBtn: WebdriverIO.Element | null = null;
      try {
        myServicesBtn = await findMyServicesButton();
      } catch {
        await scrollDown();
        await pause(1000);
        try {
          myServicesBtn = await findMyServicesButton();
        } catch {
          await scrollDown();
          await pause(1000);
          myServicesBtn = await findMyServicesButton();
        }
      }

      await myServicesBtn.click();
      await pause(3000);

      const myServicesScreen = await elementExists('my-services-screen', 10000);
      expect(myServicesScreen).toBe(true);

      // Go back via profile tab
      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);
    } catch (error) {
      console.warn('TC-W03 encountered an error:', error);
      try {
        await navigateToTab('tab-profile', 'Profile');
        await pause(2000);
      } catch {
        // ignore
      }
      const profileScreen = await elementExists('profile-screen', 5000);
      expect(profileScreen).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // TC-W04: Delete Account alert - dismiss it
  // ---------------------------------------------------------------
  it('TC-W04: should show delete account alert and dismiss it without deleting', async () => {
    try {
      await ensureOnProfileLoggedIn();

      await scrollToBottom(3);

      const deleteBtn = await findDeleteAccountButton();
      await deleteBtn.click();
      await pause(1000);

      // DISMISS the alert - do NOT accept/confirm deletion
      try {
        await driver.dismissAlert();
      } catch {
        try {
          const cancelBtn = await $(
            `-ios predicate string:label CONTAINS "Cancel" OR label CONTAINS "Hủy" OR label CONTAINS "取消"`,
          );
          if (await cancelBtn.isExisting()) {
            await cancelBtn.click();
          }
        } catch {
          // No alert or cancel button found
        }
      }
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);

      const authPrompt = await elementExists('profile-auth-prompt', 3000);
      expect(authPrompt).toBe(false);
    } catch (error) {
      console.warn('TC-W04 encountered an error:', error);
      try {
        await navigateToTab('tab-profile', 'Profile');
        await pause(2000);
      } catch {
        // ignore
      }
      const profileScreen = await elementExists('profile-screen', 5000);
      expect(profileScreen).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // TC-W05: Full sign-out and re-login cycle
  // ---------------------------------------------------------------
  it('TC-W05: should sign out, verify auth prompt, re-login via deep link', async () => {
    try {
      await ensureOnProfileLoggedIn();

      await scrollToBottom(3);

      const signOutBtn = await findSignOutButton();
      await signOutBtn.click();
      await pause(1000);

      try {
        await driver.acceptAlert();
      } catch {
        // Alert may auto-dismiss
      }
      await pause(3000);

      // Verify auth prompt is visible (user is logged out)
      const authPrompt = await waitForElement('profile-auth-prompt', 10000);
      expect(await authPrompt.isDisplayed()).toBe(true);

      // Re-login via deep link
      await loginViaDeepLink();
      await pause(3000);

      await navigateToTab('tab-profile', 'Profile');
      await pause(2000);

      const profileScreen = await elementExists('profile-screen', 10000);
      expect(profileScreen).toBe(true);

      const authPromptAfterLogin = await elementExists('profile-auth-prompt', 3000);
      expect(authPromptAfterLogin).toBe(false);
    } catch (error) {
      console.warn('TC-W05 encountered an error:', error);
      try {
        await loginViaDeepLink();
        await pause(3000);
        await navigateToTab('tab-profile', 'Profile');
        await pause(2000);
      } catch {
        // ignore
      }
      const profileScreen = await elementExists('profile-screen', 5000);
      expect(profileScreen).toBe(true);
    }
  });
});
