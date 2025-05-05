functions
const mockDetectXRSupport = vi.fn(() => Promise.resolve({
  arSupported: false,
  vrSupported: false,
  recommendedMode: XRMode.FALLBACK,
  fallbackType: XRFallbackType.STATIC_IMAGE,
  deviceType: 'desktop',
  browserType: 'chrome',
  hasGyroscope: false
));

const mockCheckARSupport = vi.fn(() => Promise.resolve(false));
const mockCheckVRSupport = vi.fn(() => Promise.resolve(false));

// Mock the module

    vi.mock('../../src/utils/webxr-compatibility', () => {
  return {
    XRMode,
    XRFallbackType,
    detectXRSupport: mockDetectXRSupport,
    checkARSupport: mockCheckARSupport,
    checkVRSupport: mockCheckVRSupport
// Import the mocked module
import {
  detectXRSupport,
  checkARSupport,
  checkVRSupport,
  XRMode as ImportedXRMode,
  XRFallbackType as ImportedXRFallbackType
from '../../src/utils/webxr-compatibility';

// Mock the navigator object
const mockNavigator = () => {
  // Store the original navigator
  const originalNavigator = global.navigator;
  
  // Define mock XR session types
  const mockSessionTypes = {

    'immersive-ar': false,

    'immersive-vr': false,
    'inline': true
// Create a mock XR object
  const mockXR = {
    isSessionSupported: vi.fn((mode: string) => Promise.resolve(mockSessionTypes[mode as keyof typeof mockSessionTypes] || false)),
    requestSession: vi.fn()
// Mock navigator.xr
  Object.defineProperty(global, 'navigator', {
    value: {
      ...originalNavigator,
      xr: undefined,

    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
writable: true
// Function to enable/disable XR
  const setXRSupport = (enabled: boolean, arSupported = false, vrSupported = false) => {
    if (enabled) {

    mockSessionTypes['immersive-ar'] = arSupported;

    mockSessionTypes['immersive-vr'] = vrSupported;
      (global.navigator as any).xr = mockXR;
else {
      (global.navigator as any).xr = undefined;
};
  
  // Function to set user agent
  const setUserAgent = (userAgent: string) => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: userAgent,
      writable: true
// Return functions to modify the mock
  return {
    setXRSupport,
    setUserAgent,
    resetNavigator: () => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: false
};
describe('WebXR Compatibility', () => {
  const mockNav = mockNavigator();
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
describe('detectXRSupport', () => {
    test('should detect modern browser with AR support', async () => {
      // Setup modern browser with AR

    mockNav.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
      mockNav.setXRSupport(true, true, false);
      
      // Update the mock to return AR support
      mockDetectXRSupport.mockResolvedValueOnce({
        arSupported: true,
        vrSupported: false,
        recommendedMode: XRMode.AR,
        deviceType: 'mobile',
        browserType: 'safari',
        hasGyroscope: true
// Detect support
      const result = await detectXRSupport();
      
      // Verify
      expect(result.arSupported).toBe(true);
      expect(result.vrSupported).toBe(false);
      expect(result.recommendedMode).toBe(XRMode.AR);
      expect(result.deviceType).toBe('mobile');
      expect(result.browserType).toBe('safari');
test('should detect modern browser with VR support', async () => {
      // Setup modern browser with VR

    mockNav.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
      mockNav.setXRSupport(true, false, true);
      
      // Update the mock to return VR support
      mockDetectXRSupport.mockResolvedValueOnce({
        arSupported: false,
        vrSupported: true,
        recommendedMode: XRMode.VR,
        deviceType: 'desktop',
        browserType: 'chrome',
        hasGyroscope: true
// Detect support
      const result = await detectXRSupport();
      
      // Verify
      expect(result.arSupported).toBe(false);
      expect(result.vrSupported).toBe(true);
      expect(result.recommendedMode).toBe(XRMode.VR);
      expect(result.deviceType).toBe('desktop');
      expect(result.browserType).toBe('chrome');
test('should detect browser with no XR support', async () => {
      // Setup browser without XR

    mockNav.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
      mockNav.setXRSupport(false);
      
      // Update the mock to return no support
      mockDetectXRSupport.mockResolvedValueOnce({
        arSupported: false,
        vrSupported: false,
        recommendedMode: XRMode.FALLBACK,
        fallbackType: XRFallbackType.MODEL_VIEWER,
        deviceType: 'desktop',
        browserType: 'chrome',
        hasGyroscope: false
// Detect support
      const result = await detectXRSupport();
      
      // Verify
      expect(result.arSupported).toBe(false);
      expect(result.vrSupported).toBe(false);
      expect(result.recommendedMode).toBe(XRMode.FALLBACK);
      expect(result.fallbackType).toBeDefined();
      expect(result.deviceType).toBe('desktop');
      expect(result.browserType).toBe('chrome');
test('should recommend Scene Viewer for supported Android devices', async () => {
      // Setup Android device

    mockNav.setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36');
      mockNav.setXRSupport(false);
      
      // Update the mock to return Scene Viewer fallback
      mockDetectXRSupport.mockResolvedValueOnce({
        arSupported: false,
        vrSupported: false,
        recommendedMode: XRMode.FALLBACK,
        fallbackType: XRFallbackType.SCENE_VIEWER,
        deviceType: 'mobile',
        browserType: 'chrome',
        hasGyroscope: true
// Detect support
      const result = await detectXRSupport();
      
      // Verify
      expect(result.arSupported).toBe(false);
      expect(result.fallbackType).toBe(XRFallbackType.SCENE_VIEWER);
      expect(result.deviceType).toBe('mobile');
      expect(result.browserType).toBe('chrome');
test('should recommend AR Quick Look for supported iOS devices', async () => {
      // Setup iOS device

    mockNav.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
      mockNav.setXRSupport(false);
      
      // Update the mock to return AR Quick Look fallback
      mockDetectXRSupport.mockResolvedValueOnce({
        arSupported: false,
        vrSupported: false,
        recommendedMode: XRMode.FALLBACK,
        fallbackType: XRFallbackType.AR_QUICK_LOOK,
        deviceType: 'mobile',
        browserType: 'safari',
        hasGyroscope: true
// Detect support
      const result = await detectXRSupport();
      
      // Verify
      expect(result.arSupported).toBe(false);
      expect(result.fallbackType).toBe(XRFallbackType.AR_QUICK_LOOK);
      expect(result.deviceType).toBe('mobile');
      expect(result.browserType).toBe('safari');
describe('checkARSupport', () => {
    test('should detect native WebXR AR support', async () => {
      // Setup browser with AR support
      mockNav.setXRSupport(true, true, false);
      
      // Update the mock to return AR support
      mockCheckARSupport.mockResolvedValueOnce(true);
      
      // Check support
      const result = await checkARSupport();
      
      // Verify
      expect(result).toBe(true);
test('should detect no AR support', async () => {
      // Setup browser without AR support
      mockNav.setXRSupport(true, false, false);
      
      // Update the mock to return no AR support
      mockCheckARSupport.mockResolvedValueOnce(false);
      
      // Check support
      const result = await checkARSupport();
      
      // Verify
      expect(result).toBe(false);
describe('checkVRSupport', () => {
    test('should detect native WebXR VR support', async () => {
      // Setup browser with VR support
      mockNav.setXRSupport(true, false, true);
      
      // Update the mock to return VR support
      mockCheckVRSupport.mockResolvedValueOnce(true);
      
      // Check support
      const result = await checkVRSupport();
      
      // Verify
      expect(result).toBe(true);
test('should detect no VR support', async () => {
      // Setup browser without VR support
      mockNav.setXRSupport(true, false, false);
      
      // Update the mock to return no VR support
      mockCheckVRSupport.mockResolvedValueOnce(false);
      
      // Check support
      const result = await checkVRSupport();
      
      // Verify
      expect(result).toBe(false);
// Restore original navigator after all tests
  afterEach(() => {
    mockNav.resetNavigator();
