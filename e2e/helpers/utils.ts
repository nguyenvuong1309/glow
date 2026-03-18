/**
 * Wait for element by accessibility id (testID in React Native)
 */
export async function waitForElement(
  testID: string,
  timeout = 15000,
): Promise<WebdriverIO.Element> {
  const element = await $(`~${testID}`);
  await element.waitForExist({ timeout });
  return element;
}

/**
 * Check if element exists (without throwing)
 */
export async function elementExists(
  testID: string,
  timeout = 5000,
): Promise<boolean> {
  try {
    const element = await $(`~${testID}`);
    return await element.waitForExist({ timeout });
  } catch {
    return false;
  }
}

/**
 * Tap element by testID
 */
export async function tapElement(testID: string, timeout = 15000): Promise<void> {
  const element = await waitForElement(testID, timeout);
  await element.click();
}

/**
 * Get text from element by testID
 */
export async function getElementText(
  testID: string,
  timeout = 15000,
): Promise<string> {
  const element = await waitForElement(testID, timeout);
  return await element.getText();
}

/**
 * Type text into element by testID
 */
export async function typeText(
  testID: string,
  text: string,
  timeout = 15000,
): Promise<void> {
  const element = await waitForElement(testID, timeout);
  await element.clearValue();
  await element.setValue(text);
}

/**
 * Swipe left on the screen
 */
export async function swipeLeft(): Promise<void> {
  const { width, height } = await driver.getWindowRect();
  await driver.action('pointer')
    .move({ x: Math.round(width * 0.8), y: Math.round(height * 0.5) })
    .down()
    .move({ x: Math.round(width * 0.2), y: Math.round(height * 0.5), duration: 300 })
    .up()
    .perform();
}

/**
 * Swipe right on the screen
 */
export async function swipeRight(): Promise<void> {
  const { width, height } = await driver.getWindowRect();
  await driver.action('pointer')
    .move({ x: Math.round(width * 0.2), y: Math.round(height * 0.5) })
    .down()
    .move({ x: Math.round(width * 0.8), y: Math.round(height * 0.5), duration: 300 })
    .up()
    .perform();
}

/**
 * Wait for a short time
 */
export async function pause(ms = 1000): Promise<void> {
  await driver.pause(ms);
}

/**
 * Find element by text (label)
 */
export async function findByText(
  text: string,
  timeout = 10000,
): Promise<WebdriverIO.Element> {
  const element = await $(`-ios predicate string:label == "${text}"`);
  await element.waitForExist({ timeout });
  return element;
}

/**
 * Find element by partial text
 */
export async function findByPartialText(
  text: string,
  timeout = 10000,
): Promise<WebdriverIO.Element> {
  const element = await $(`-ios predicate string:label CONTAINS "${text}"`);
  await element.waitForExist({ timeout });
  return element;
}

/**
 * Check element is displayed
 */
export async function isDisplayed(testID: string, timeout = 5000): Promise<boolean> {
  try {
    const element = await $(`~${testID}`);
    await element.waitForExist({ timeout });
    return await element.isDisplayed();
  } catch {
    return false;
  }
}

/**
 * Scroll down
 */
export async function scrollDown(): Promise<void> {
  const { width, height } = await driver.getWindowRect();
  await driver.action('pointer')
    .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.7) })
    .down()
    .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.3), duration: 300 })
    .up()
    .perform();
}

/**
 * Accept native alert
 */
export async function acceptAlert(): Promise<void> {
  try {
    await driver.acceptAlert();
  } catch {
    // No alert present
  }
}

/**
 * Dismiss native alert
 */
export async function dismissAlert(): Promise<void> {
  try {
    await driver.dismissAlert();
  } catch {
    // No alert present
  }
}
