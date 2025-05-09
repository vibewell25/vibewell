exports functions from both performance monitoring systems to ensure
 * backward compatibility while we transition to the new system.
 */
import performanceMonitor from './performance-monitor';
import {
  startComponentRender,
  endComponentRender,
  startApiCall,
  endApiCall,
  reportPerformanceViolation,
  getMetrics,
  checkBudgets,
  initPerformanceMonitoring,
from './performance-monitoring';

// Export everything from both modules
export {
  startComponentRender,
  endComponentRender,
  startApiCall,
  endApiCall,
  reportPerformanceViolation,
  getMetrics,
  checkBudgets,
  initPerformanceMonitoring,
// Also export the default performanceMonitor object for direct usage
export default performanceMonitor;
