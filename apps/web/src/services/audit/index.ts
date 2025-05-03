/**
 * Audit Services Index
 *

 * This file exports all audit-related services for the VibeWell platform.
 */


import auditService, { AuditCategory, AuditSeverity } from '../audit-service';

import securityAuditService from './security-audit';

import performanceAuditService from './performance-audit';

import uxAuditService from './ux-audit';

import complianceAuditService from './compliance-audit';

import bookingAuditService from './booking-audit';

import auditController from '../../controllers/audit-controller';

// Export types and enums
export { AuditCategory, AuditSeverity };

export type { AuditIssue, AuditReport, AuditThresholds } from '../audit-service';

export type {
  VulnerabilityScanResult,
  SecurityConfig,
  PCIComplianceStatus,
  DataProtectionStatus,
  SocialMediaSecurityStatus,

} from './security-audit';

export type {
  PerformanceMetric,
  LoadTestResult,
  MobilePerformanceMetrics,
  DatabasePerformanceMetrics,
  FrontendPerformanceMetrics,
  PerformanceAuditConfig,

} from './performance-audit';

export type {
  UserFlowResult,
  AccessibilityResult,
  BookingUXResult,
  ResponsivenessResult,
  UXAuditConfig,

} from './ux-audit';

export type {
  ComplianceRequirement,
  GDPRComplianceStatus,
  CCPAComplianceStatus,
  FinancialTransactionAudit,
  DataRetentionAudit,
  UserConsentAudit,
  ComplianceAuditConfig,

} from './compliance-audit';

export type {
  BookingIntegrityResult,
  NotificationDeliveryResult,
  BookingPerformanceMetrics,
  BookingAuditConfig,

} from './booking-audit';

export type {
  ComprehensiveAuditReport,
  AuditScheduleConfig,

} from '../../controllers/audit-controller';

// Export services
export {
  auditService,
  securityAuditService,
  performanceAuditService,
  uxAuditService,
  complianceAuditService,
  bookingAuditService,
  auditController,
};

// Default export the main audit controller
export default auditController;
