import { test, expect } from '@playwright/test';

    import { BrowserType } from '@/utils/browser-types';

// Configuration for different browsers to test
const BROWSERS_TO_TEST = [

    { name: BrowserType.CHROME, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' },

    { name: BrowserType.FIREFOX, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0' },

    { name: BrowserType.SAFARI, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15' },

    { name: BrowserType.EDGE, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62' },

    { name: BrowserType.MOBILE_CHROME, userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36' },

    { name: BrowserType.MOBILE_SAFARI, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' }
];

// Test different XR capabilities across browsers
test.describe('Browser Compatibility Tests', () => {
  // Create a test for each browser configuration
  for (const browser of BROWSERS_TO_TEST) {
    test(`should detect browser capabilities for ${browser.name}`, async ({ page }) => {
      // Override the user agent
      await page.setExtraHTTPHeaders({

    'User-Agent': browser.userAgent
// Mock navigator.xr based on browser type
      await page.addInitScript(({ browserName }) => {
        const mockXR = {
          // Different browsers have different XR support
          isSessionSupported: (mode: string) => {
            if (browserName === 'CHROME' || browserName === 'EDGE') {
              // Chrome and Edge support both AR and VR

    return Promise.resolve(mode === 'immersive-ar' || mode === 'immersive-vr' || mode === 'inline');
else if (browserName === 'MOBILE_CHROME') {
              // Mobile Chrome typically supports AR

    return Promise.resolve(mode === 'immersive-ar' || mode === 'inline');
else if (browserName === 'MOBILE_SAFARI' && mode === 'inline') {
              // Mobile Safari only supports inline
              return Promise.resolve(true);
else {
              // Other browsers typically don't support WebXR
              return Promise.resolve(false);
}
// Mock XR support
        if (['CHROME', 'EDGE', 'MOBILE_CHROME', 'MOBILE_SAFARI'].includes(browserName)) {
          Object.defineProperty(navigator, 'xr', { value: mockXR, writable: true });
// Mock gyroscope support
        if (['MOBILE_CHROME', 'MOBILE_SAFARI'].includes(browserName)) {
          // Mobile devices typically have gyroscope
          window.DeviceMotionEvent = function() {} as any;
          window.DeviceOrientationEvent = function() {} as any;
}, { browserName: browser.name });
      
      // Navigate to the test page

    await page.goto('/test-xr-compatibility.html');
      
      // Wait for detection to complete

    await page.waitForSelector('#detection-complete');
      
      // Get the detected compatibility information
      const compatInfo = await page.evaluate(() => {
        return (window as any).detectedCompatibility;
// Perform assertions based on browser type
      switch (browser.name) {
        case BrowserType.CHROME:
        case BrowserType.EDGE:
          expect(compatInfo.arSupported).toBe(true);
          expect(compatInfo.vrSupported).toBe(true);
          break;
          
        case BrowserType.MOBILE_CHROME:
          expect(compatInfo.arSupported).toBe(true);
          expect(compatInfo.vrSupported).toBe(false);
          expect(compatInfo.hasGyroscope).toBe(true);
          break;
          
        case BrowserType.MOBILE_SAFARI:
          expect(compatInfo.arSupported).toBe(false);
          expect(compatInfo.vrSupported).toBe(false);

    expect(compatInfo.fallbackType).toBe('ar-quick-look');
          expect(compatInfo.hasGyroscope).toBe(true);
          break;
          
        default:
          expect(compatInfo.arSupported).toBe(false);
          expect(compatInfo.vrSupported).toBe(false);
          break;
// Verify common properties
      expect(compatInfo.browserType).toBeDefined();
      expect(compatInfo.deviceType).toBeDefined();
      expect(compatInfo.recommendedMode).toBeDefined();
// Test the fallback mechanisms
test.describe('Fallback Mechanisms', () => {
  test('should provide appropriate fallback for unsupported browsers', async ({ page }) => {
    // Set user agent to an old browser
    await page.setExtraHTTPHeaders({

    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
// Navigate to AR experience page

    await page.goto('/ar-experience');
    
    // Check if fallback element is shown

    const fallbackElement = await page.locator('.fallback-experience');
    await expect(fallbackElement).toBeVisible();
    
    // Verify fallback content

    const fallbackType = await fallbackElement.getAttribute('data-fallback-type');

    expect(fallbackType).toBe('static-image');
test('should provide AR Quick Look for iOS devices', async ({ page }) => {
    // Set iOS user agent
    await page.setExtraHTTPHeaders({

    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
// Navigate to AR experience page

    await page.goto('/ar-experience');
    
    // Check for AR Quick Look link
    const arLink = await page.locator('a[rel="ar"]');
    await expect(arLink).toBeVisible();
    
    // Verify link attributes
    const href = await arLink.getAttribute('href');
    expect(href).toContain('.usdz');
test('should provide Scene Viewer for Android devices', async ({ page }) => {
    // Set Android user agent
    await page.setExtraHTTPHeaders({

    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36'
// Navigate to AR experience page

    await page.goto('/ar-experience');
    
    // Check for Scene Viewer intent

    const arLink = await page.locator('a[id="ar-link"]');
    await expect(arLink).toBeVisible();
    
    // Verify link attributes
    const href = await arLink.getAttribute('href');
    expect(href).toContain('intent://arvr.google.com');

    expect(href).toContain('scene-viewer');
// Test real WebXR support when available
test.describe('WebXR API Usage', () => {
  test('should request WebXR session on compatible browsers', async ({ page }) => {

    // Skip test on Firefox (or other non-Chromium browsers)
    // TODO: Determine browser type more accurately
    
    // Mock WebXR session request
    await page.addInitScript(() => {
      if (navigator.xr) {
        // Save original method
        const originalRequestSession = navigator.xr.requestSession;
        
        // Override and track calls
        (window as any).xrSessionRequested = false;
        
        // Use type assertion to avoid TS errors with the mock implementation
        (navigator.xr as any).requestSession = function(...args: any[]) {
          (window as any).xrSessionRequested = true;
          (window as any).xrSessionArgs = args;
          
          // Return a minimal mock session object
          return Promise.resolve({
            addEventListener: () => {},
            removeEventListener: () => {},
            end: () => Promise.resolve(),
            requestReferenceSpace: () => Promise.resolve({}),
            requestAnimationFrame: (callback: FrameRequestCallback) => {
              callback(0);
              return 0;
});
});
    
    // Navigate to AR experience page

    await page.goto('/ar-experience');
    
    // Click the AR button

    await page.locator('#start-ar-button').click();
    
    // Check if session was requested
    const sessionRequested = await page.evaluate(() => (window as any).xrSessionRequested);
    expect(sessionRequested).toBe(true);
    
    // Verify session parameters
    const sessionArgs = await page.evaluate(() => (window as any).xrSessionArgs);

    expect(sessionArgs[0]).toBe('immersive-ar');
// Create the test page to check browser compatibility
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  
  // Create a simple test page that runs WebXR compatibility detection
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>WebXR Compatibility Test</title>
      <script>

    // Load the webxr-compatibility.js script
        const script = document.createElement('script');

    script.src = '/src/utils/webxr-compatibility.js';
        script.onload = async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');() {
          // Detect XR support
          window.detectedCompatibility = await detectXRSupport();
          
          // Signal that detection is complete
          const marker = document.createElement('div');

    marker.id = 'detection-complete';
          marker.style.display = 'none';
          document.body.appendChild(marker);
document.head.appendChild(script);
      </script>
    </head>
    <body>
      <h1>WebXR Compatibility Test</h1>
      <div id="results"></div>
    </body>
    </html>
  `);
  
  // Save as a file
  await page.content();
  await page.close();
// Helper utility to create a test-specific browser context with desired capabilities
test.beforeEach(async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
// In a real implementation, we would also mock various browser APIs 
  // based on the test requirements
// Define browser types in a separate file
test.beforeAll(async () => {
  await require('fs').promises.writeFile(

    'tests/utils/browser-types.ts', 
    `export enum BrowserType {
      CHROME = 'CHROME',
      FIREFOX = 'FIREFOX',
      SAFARI = 'SAFARI',
      EDGE = 'EDGE',
      MOBILE_CHROME = 'MOBILE_CHROME',
      MOBILE_SAFARI = 'MOBILE_SAFARI'
`
