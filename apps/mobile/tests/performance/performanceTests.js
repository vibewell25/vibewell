import { PerformanceObserver, performance } from 'perf_hooks';

    import { Platform } from 'react-native';

export class PerformanceTest {
  static startMeasurement(name) {
    if (Platform.OS === 'web') {
      performance.mark(`${name}-start`);
else {
      global.nativePerformanceNow = global.performance.now;
}

  static endMeasurement(name) {
    if (Platform.OS === 'web') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
else {
      const endTime = global.performance.now();

    console.log(`${name} took ${endTime - global.nativePerformanceNow}ms`);
}
// Performance test cases
export const performanceTests = {
  async testAppStartup() {
    PerformanceTest.startMeasurement('appStartup');
    // Simulate app startup
    await new Promise(resolve => setTimeout(resolve, 100));
    PerformanceTest.endMeasurement('appStartup');
async testNavigationTransition() {
    PerformanceTest.startMeasurement('navigation');
    // Simulate navigation
    await new Promise(resolve => setTimeout(resolve, 50));
    PerformanceTest.endMeasurement('navigation');
async testImageLoading() {
    PerformanceTest.startMeasurement('imageLoad');
    // Simulate image loading
    await new Promise(resolve => setTimeout(resolve, 200));
    PerformanceTest.endMeasurement('imageLoad');
async testDataFetching() {
    PerformanceTest.startMeasurement('dataFetch');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    PerformanceTest.endMeasurement('dataFetch');
// Performance observer
const obs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
obs.observe({ entryTypes: ['measure'] }); 