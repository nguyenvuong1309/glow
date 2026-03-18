import {
  waitForElement,
  elementExists,
  tapElement,
  getElementText,
  isDisplayed,
  pause,
  findByText,
} from '../helpers/utils';

describe('Batch 1: Onboarding & Navigation', () => {
  // TC-001: Onboarding - Display 3 slides and skip
  it('TC-001: should display onboarding screen with slides and skip button', async () => {
    // Wait for onboarding screen
    const onboardingScreen = await waitForElement('onboarding-screen', 30000);
    expect(await onboardingScreen.isDisplayed()).toBe(true);

    // Verify first slide is visible
    const slide1 = await waitForElement('onboarding-slide-1');
    expect(await slide1.isDisplayed()).toBe(true);

    // Verify dots are displayed
    const dots = await waitForElement('onboarding-dots');
    expect(await dots.isDisplayed()).toBe(true);

    // Verify next button exists
    const nextButton = await waitForElement('onboarding-next-button');
    expect(await nextButton.isDisplayed()).toBe(true);

    // Verify skip button exists
    const skipButton = await waitForElement('onboarding-skip-button');
    expect(await skipButton.isDisplayed()).toBe(true);

    // Tap skip to complete onboarding
    await tapElement('onboarding-skip-button');

    // Should navigate to home screen
    const homeScreen = await waitForElement('home-screen', 15000);
    expect(await homeScreen.isDisplayed()).toBe(true);
  });

  // TC-002: Onboarding - Swipe through slides and tap Get Started
  it('TC-002: should swipe through slides and tap Get Started on fresh install', async () => {
    // Reinstall app to reset onboarding state
    await driver.terminateApp('org.reactjs.native.example.Glow');
    await pause(1000);
    await driver.execute('mobile: removeApp', {
      bundleId: 'org.reactjs.native.example.Glow',
    });
    await pause(1000);
    await driver.execute('mobile: installApp', {
      app: '/Users/vuongnguyen/Library/Developer/Xcode/DerivedData/Glow-apdcyqvxcutfwcgorfanpeqxhdnx/Build/Products/Debug-iphonesimulator/Glow.app',
    });
    await driver.execute('mobile: launchApp', {
      bundleId: 'org.reactjs.native.example.Glow',
    });
    await pause(5000);

    // Wait for onboarding
    const onboardingScreen = await waitForElement('onboarding-screen', 30000);
    expect(await onboardingScreen.isDisplayed()).toBe(true);

    // Verify first slide
    expect(await isDisplayed('onboarding-slide-1')).toBe(true);

    // Tap next to go to slide 2
    await tapElement('onboarding-next-button');
    await pause(800);

    // Tap next to go to slide 3
    await tapElement('onboarding-next-button');
    await pause(800);

    // On last slide, skip button should not be visible
    const skipExists = await elementExists('onboarding-skip-button', 2000);
    expect(skipExists).toBe(false);

    // Button text should exist (Get Started)
    const buttonText = await getElementText('onboarding-next-text');
    expect(buttonText.length).toBeGreaterThan(0);

    // Tap Get Started
    await tapElement('onboarding-next-button');

    // Should navigate to home screen
    const homeScreen = await waitForElement('home-screen', 15000);
    expect(await homeScreen.isDisplayed()).toBe(true);
  });

  // TC-003: Tab Navigation - Switch between 4 tabs
  it('TC-003: should switch between all 4 tabs', async () => {
    // Should already be on home screen from previous test
    const homeScreen = await waitForElement('home-screen', 20000);
    expect(await homeScreen.isDisplayed()).toBe(true);

    // Wait a bit for the tabs to fully render
    await pause(2000);

    // Try finding tab using testID first, fallback to label/text
    let servicesTabExists = await elementExists('tab-services', 3000);
    if (servicesTabExists) {
      await tapElement('tab-services');
    } else {
      // Fallback: find by label text (React Navigation uses label text)
      const servicesTab = await $(
        '-ios predicate string:label CONTAINS "Services" OR label CONTAINS "services" OR label CONTAINS "Dịch vụ"',
      );
      await servicesTab.waitForExist({ timeout: 10000 });
      await servicesTab.click();
    }
    await pause(2000);
    const serviceList = await waitForElement('service-list-screen', 15000);
    expect(await serviceList.isDisplayed()).toBe(true);

    // Tap Bookings tab
    let bookingsTabExists = await elementExists('tab-bookings', 3000);
    if (bookingsTabExists) {
      await tapElement('tab-bookings');
    } else {
      const bookingsTab = await $(
        '-ios predicate string:label CONTAINS "Booking" OR label CONTAINS "booking" OR label CONTAINS "Đặt"',
      );
      await bookingsTab.waitForExist({ timeout: 10000 });
      await bookingsTab.click();
    }
    await pause(2000);
    // Since not authenticated, should show auth prompt
    const bookingAuthPrompt = await waitForElement(
      'booking-history-auth-prompt',
      15000,
    );
    expect(await bookingAuthPrompt.isDisplayed()).toBe(true);

    // Tap Profile tab
    let profileTabExists = await elementExists('tab-profile', 3000);
    if (profileTabExists) {
      await tapElement('tab-profile');
    } else {
      const profileTab = await $(
        '-ios predicate string:label CONTAINS "Profile" OR label CONTAINS "profile" OR label CONTAINS "Hồ sơ"',
      );
      await profileTab.waitForExist({ timeout: 10000 });
      await profileTab.click();
    }
    await pause(2000);
    // Since not authenticated, should show auth prompt
    const profileAuthPrompt = await waitForElement(
      'profile-auth-prompt',
      15000,
    );
    expect(await profileAuthPrompt.isDisplayed()).toBe(true);

    // Tap Home tab to go back
    let homeTabExists = await elementExists('tab-home', 3000);
    if (homeTabExists) {
      await tapElement('tab-home');
    } else {
      const homeTab = await $(
        '-ios predicate string:label CONTAINS "Home" OR label CONTAINS "home" OR label CONTAINS "Trang"',
      );
      await homeTab.waitForExist({ timeout: 10000 });
      await homeTab.click();
    }
    await pause(2000);
    const homeAgain = await waitForElement('home-screen', 15000);
    expect(await homeAgain.isDisplayed()).toBe(true);
  });

  // TC-004: Home Screen - Display categories, services, greeting
  it('TC-004: should display greeting, categories, and services on home screen', async () => {
    // Wait for home screen
    const homeScreen = await waitForElement('home-screen', 15000);
    expect(await homeScreen.isDisplayed()).toBe(true);

    // Verify greeting is displayed
    const greeting = await waitForElement('home-greeting', 10000);
    expect(await greeting.isDisplayed()).toBe(true);
    const greetingText = await greeting.getText();
    expect(greetingText.length).toBeGreaterThan(0);

    // Verify subtitle
    const subtitle = await waitForElement('home-subtitle');
    expect(await subtitle.isDisplayed()).toBe(true);

    // Verify search bar exists
    const searchBar = await waitForElement('home-search-bar');
    expect(await searchBar.isDisplayed()).toBe(true);

    // Verify categories section title
    const categoriesTitle = await waitForElement('home-categories-title');
    expect(await categoriesTitle.isDisplayed()).toBe(true);
  });

  // TC-005: Home Screen - Search services
  it('TC-005: should be able to type in search bar and navigate to services', async () => {
    // Wait for home screen
    const homeScreen = await waitForElement('home-screen', 15000);
    expect(await homeScreen.isDisplayed()).toBe(true);

    // Find and tap search bar
    const searchBar = await waitForElement('home-search-bar');
    await searchBar.click();
    await pause(500);

    // Type search text and submit with newline
    await searchBar.setValue('test\n');
    await pause(2000);

    // Should navigate to Services tab with search applied
    const serviceListScreen = await waitForElement(
      'service-list-screen',
      15000,
    );
    expect(await serviceListScreen.isDisplayed()).toBe(true);

    // Go back to home for next tests
    let homeTabExists = await elementExists('tab-home', 3000);
    if (homeTabExists) {
      await tapElement('tab-home');
    } else {
      const homeTab = await $(
        '-ios predicate string:label CONTAINS "Home" OR label CONTAINS "home" OR label CONTAINS "Trang"',
      );
      await homeTab.waitForExist({ timeout: 10000 });
      await homeTab.click();
    }
    await pause(1000);
  });
});
