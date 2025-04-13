/**
 * Script to generate a comprehensive audit report for VibeWell
 * 
 * Usage:
 * npx ts-node scripts/generate-audit-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import auditController from '../src/controllers/audit-controller';
import auditService, { AuditCategory, AuditSeverity } from '../src/services/audit-service';
import securityAuditService from '../src/services/audit/security-audit';
import performanceAuditService from '../src/services/audit/performance-audit';
import uxAuditService from '../src/services/audit/ux-audit';
import complianceAuditService from '../src/services/audit/compliance-audit';
import bookingAuditService from '../src/services/audit/booking-audit';

// Mock the analytics function instead of using Jest
const mockAnalytics = {
  logEvent: (...args: any[]) => {
    console.log('Mock analytics event:', ...args);
  }
};

// Override console.log to add a timestamp
const originalConsoleLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalConsoleLog(`[${timestamp}]`, ...args);
};

async function generateTestData() {
  console.log('Generating test audit data...');
  
  // Security audit data
  await securityAuditService.processVulnerabilityResults([
    {
      id: 'CVE-2023-1234',
      title: 'SQL Injection Vulnerability',
      description: 'SQL injection vulnerability in user search endpoint',
      cvssScore: 8.5,
      severity: 'high',
      component: 'API',
      vulnerable_versions: '<2.0.0',
      patched_versions: '>=2.0.0',
      recommendation: 'Update to version 2.0.0 or higher and use parameterized queries',
    },
    {
      id: 'CVE-2023-5678',
      title: 'Cross-Site Scripting (XSS)',
      description: 'Stored XSS vulnerability in user profile page',
      cvssScore: 6.8,
      severity: 'medium',
      component: 'Web UI',
      vulnerable_versions: '<1.5.0',
      patched_versions: '>=1.5.0',
      recommendation: 'Update to version 1.5.0 or higher and implement proper input sanitization',
    }
  ]);
  
  // Add social media security status
  await securityAuditService.updateSocialMediaSecurityStatus({
    contentModeration: {
      name: 'Content Moderation',
      status: 'warning',
      details: 'Moderation queue has 200+ pending items',
      lastChecked: Date.now(),
    },
    fakeAccountDetection: {
      name: 'Fake Account Detection',
      status: 'pass',
      lastChecked: Date.now(),
    },
    privacyControls: {
      name: 'Privacy Controls',
      status: 'pass',
      lastChecked: Date.now(),
    },
    dataLeakagePrevention: {
      name: 'Data Leakage Prevention',
      status: 'fail',
      details: 'PII data exposed in public profiles',
      lastChecked: Date.now(),
    },
    lastChecked: Date.now(),
  });
  
  // Performance audit data
  await performanceAuditService.recordLoadTestResult({
    id: 'load-test-1',
    startTime: Date.now() - 3600000,
    endTime: Date.now(),
    userCount: 10000,
    duration: 3600000,
    metrics: {
      throughput: {
        name: 'Throughput',
        value: 500,
        unit: 'req/s',
        timestamp: Date.now(),
      },
      responseTime: {
        name: 'Response Time',
        value: 250,
        unit: 'ms',
        timestamp: Date.now(),
      },
      errorRate: {
        name: 'Error Rate',
        value: 0.8,
        unit: '%',
        timestamp: Date.now(),
      },
      cpuUtilization: {
        name: 'CPU Utilization',
        value: 75,
        unit: '%',
        timestamp: Date.now(),
      },
      memoryUsage: {
        name: 'Memory Usage',
        value: 85,
        unit: '%',
        timestamp: Date.now(),
      },
    },
    breakdown: [
      {
        endpoint: '/api/bookings',
        responseTime: {
          name: 'Response Time',
          value: 320,
          unit: 'ms',
          timestamp: Date.now(),
        },
        errorRate: {
          name: 'Error Rate',
          value: 1.2,
          unit: '%',
          timestamp: Date.now(),
        },
      },
      {
        endpoint: '/api/users',
        responseTime: {
          name: 'Response Time',
          value: 180,
          unit: 'ms',
          timestamp: Date.now(),
        },
        errorRate: {
          name: 'Error Rate',
          value: 0.3,
          unit: '%',
          timestamp: Date.now(),
        },
      }
    ],
  });
  
  // Add mobile performance metrics
  await performanceAuditService.recordMobileMetrics({
    deviceType: 'iOS',
    appVersion: '2.1.0',
    startupTime: {
      name: 'Startup Time',
      value: 2200,
      unit: 'ms',
      timestamp: Date.now(),
    },
    memoryUsage: {
      name: 'Memory Usage',
      value: 120,
      unit: 'MB',
      timestamp: Date.now(),
    },
    batteryImpact: {
      name: 'Battery Impact',
      value: 4.2,
      unit: '%/hr',
      timestamp: Date.now(),
    },
    networkUsage: {
      name: 'Network Usage',
      value: 2.5,
      unit: 'MB/min',
      timestamp: Date.now(),
    },
    frameRate: {
      name: 'Frame Rate',
      value: 58,
      unit: 'FPS',
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  });
  
  // Add Android mobile metrics
  await performanceAuditService.recordMobileMetrics({
    deviceType: 'Android',
    appVersion: '2.1.0',
    startupTime: {
      name: 'Startup Time',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
    },
    memoryUsage: {
      name: 'Memory Usage',
      value: 145,
      unit: 'MB',
      timestamp: Date.now(),
    },
    batteryImpact: {
      name: 'Battery Impact',
      value: 5.1,
      unit: '%/hr',
      timestamp: Date.now(),
    },
    networkUsage: {
      name: 'Network Usage',
      value: 2.8,
      unit: 'MB/min',
      timestamp: Date.now(),
    },
    frameRate: {
      name: 'Frame Rate',
      value: 52,
      unit: 'FPS',
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  });
  
  // UX audit data
  await uxAuditService.recordUserFlowResult({
    id: 'flow-1',
    flowName: 'Booking Appointment',
    steps: [
      {
        stepName: 'Search for provider',
        success: true,
        timeSpent: 5200,
      },
      {
        stepName: 'Select service',
        success: true,
        timeSpent: 3100,
      },
      {
        stepName: 'Choose time slot',
        success: true,
        timeSpent: 8700,
      },
      {
        stepName: 'Enter payment details',
        success: false,
        timeSpent: 25000,
        errorMessage: 'Payment form validation failed',
      },
      {
        stepName: 'Confirm booking',
        success: false,
        timeSpent: 0,
        errorMessage: 'Step not reached',
      }
    ],
    completionRate: 60,
    averageTime: 10500,
    dropOffPoints: [
      {
        stepName: 'Enter payment details',
        dropOffCount: 215,
        dropOffPercentage: 35,
      },
      {
        stepName: 'Choose time slot',
        dropOffCount: 42,
        dropOffPercentage: 5,
      }
    ],
    timestamp: Date.now(),
  });
  
  // Add accessibility test results
  await uxAuditService.recordAccessibilityResult({
    url: 'https://vibewell.com/booking',
    standard: 'WCAG2AA',
    violations: [
      {
        id: 'color-contrast',
        impact: 'serious',
        description: 'Elements must have sufficient color contrast',
        tags: ['wcag2aa', 'wcag143'],
        elements: ['.booking-button', '.price-text'],
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      },
      {
        id: 'aria-required-attr',
        impact: 'critical',
        description: 'Required ARIA attributes must be provided',
        tags: ['wcag2a', 'wcag412'],
        elements: ['[role="slider"]'],
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-required-attr',
      }
    ],
    passes: 128,
    incomplete: 5,
    timestamp: Date.now(),
  });
  
  // Add booking UX results
  await uxAuditService.recordBookingUXResult({
    bookingFlow: 'Standard Booking',
    conversionRate: 68,
    abandonment: [
      {
        step: 'Payment Information',
        percentage: 22,
      },
      {
        step: 'Service Selection',
        percentage: 10,
      }
    ],
    averageCompletionTime: 185000,
    userSatisfaction: 3.7,
    commonIssues: [
      {
        issue: 'Too many steps in checkout process',
        count: 87,
      },
      {
        issue: 'Payment form is confusing',
        count: 65,
      },
      {
        issue: 'Calendar interface is hard to use on mobile',
        count: 42,
      }
    ],
    recommendations: [
      'Reduce checkout steps from 5 to 3',
      'Redesign payment form with clearer labeling',
      'Implement a simpler date picker for mobile',
    ],
    timestamp: Date.now(),
  });
  
  // Compliance audit data
  await complianceAuditService.updateGDPRStatus({
    overallStatus: 'partially_compliant',
    requirements: [
      {
        id: 'consent',
        description: 'Obtain explicit consent for data processing',
        status: 'compliant',
        evidence: 'Consent UI implemented with opt-in checkboxes',
      },
      {
        id: 'data-access',
        description: 'Provide users with access to their personal data',
        status: 'compliant',
        evidence: 'User profile page includes data export functionality',
      },
      {
        id: 'right-to-be-forgotten',
        description: 'Implement right to erasure (right to be forgotten)',
        status: 'partially_compliant',
        evidence: 'Account deletion exists but some data remains in backups',
      },
      {
        id: 'data-minimization',
        description: 'Collect only necessary data for specified purposes',
        status: 'non_compliant',
        evidence: 'Marketing forms collect excessive personal information',
      }
    ],
    lastChecked: Date.now(),
  });
  
  // Add data retention audit
  await complianceAuditService.auditDataRetention({
    dataType: 'personalData',
    retentionPeriod: 365,
    currentRetention: 730,
    status: 'non_compliant',
    records: [
      {
        recordType: 'userProfiles',
        count: 25760,
        oldestRecord: Date.now() - 730 * 24 * 60 * 60 * 1000,
        newestRecord: Date.now(),
      },
      {
        recordType: 'contactInfo',
        count: 28145,
        oldestRecord: Date.now() - 710 * 24 * 60 * 60 * 1000,
        newestRecord: Date.now(),
      }
    ],
    timestamp: Date.now(),
  });
  
  // Booking audit data
  await bookingAuditService.recordIntegrityResult({
    id: 'integrity-test-1',
    testName: 'Double Booking Prevention',
    success: false,
    timestamp: Date.now(),
    issues: [
      {
        type: 'double_booking',
        description: 'Two bookings for the same time slot with provider #123',
        bookingIds: ['booking-789', 'booking-456'],
        resourceId: 'provider-123',
      },
      {
        type: 'availability_sync',
        description: 'Provider calendar shows different availability than booking system',
        resourceId: 'provider-456',
      }
    ],
  });
  
  // Add notification delivery results
  await bookingAuditService.recordNotificationResult({
    notificationType: 'booking_confirmation',
    totalSent: 5280,
    delivered: 5245,
    failed: 35,
    deliveryRate: 99.34,
    avgDeliveryTime: 1250,
    issues: [
      {
        reason: 'Invalid email address',
        count: 18,
        examples: ['user123@examp.le', 'test@@domain.com'],
      },
      {
        reason: 'Mailbox full',
        count: 7,
        examples: ['user456@example.com'],
      },
      {
        reason: 'Temporary server failure',
        count: 10,
        examples: ['user789@example.net'],
      }
    ],
    timestamp: Date.now(),
  });
  
  // Add booking performance metrics
  await bookingAuditService.updatePerformanceMetrics({
    averageBookingTime: 95000,
    conversionRate: 72,
    checkoutAbandonmentRate: 28,
    concurrentBookings: {
      max: 850,
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
    },
    peakBookingPeriods: [
      {
        period: '10:00-11:00',
        bookingsPerHour: 320,
      },
      {
        period: '18:00-19:00',
        bookingsPerHour: 450,
      }
    ],
    errorRate: 1.8,
    timestamp: Date.now(),
  });
  
  console.log('Test data generation complete.');
}

async function generateAndSaveReport() {
  console.log('Generating comprehensive audit report...');
  
  // Generate test data
  await generateTestData();
  
  // Generate the report
  const report = auditController.generateComprehensiveReport();
  
  // Create the reports directory if it doesn't exist
  const reportDir = path.resolve(__dirname, '../reports/audit');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Format the timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Save the report to a JSON file
  const reportPath = path.join(reportDir, `audit-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Report saved to ${reportPath}`);
  
  // Generate category-specific reports
  const categories = Object.values(AuditCategory);
  for (const category of categories) {
    const categoryReport = auditService.generateReport(category);
    
    // Create category-specific directory
    const categoryDir = path.join(reportDir, category.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // Save the category report
    const categoryReportPath = path.join(categoryDir, `${category.toLowerCase()}-report-${timestamp}.json`);
    fs.writeFileSync(categoryReportPath, JSON.stringify(categoryReport, null, 2));
    
    console.log(`${category} report saved to ${categoryReportPath}`);
  }
  
  // Print summary
  console.log('\nAudit Report Summary:');
  console.log(`Total Issues: ${report.summary.totalIssues}`);
  console.log(`Critical Issues: ${report.security.vulnerabilities.critical}`);
  console.log(`High Issues: ${report.security.vulnerabilities.high}`);
  console.log(`Medium Issues: ${report.security.vulnerabilities.medium}`);
  console.log(`Low Issues: ${report.security.vulnerabilities.low}`);
  
  console.log('\nCategory Breakdown:');
  for (const category in report.summary.issuesByCategory) {
    console.log(`${category}: ${report.summary.issuesByCategory[category as keyof typeof report.summary.issuesByCategory]} issues`);
  }
  
  return report;
}

// Execute if this script is run directly
if (require.main === module) {
  generateAndSaveReport()
    .then(() => {
      console.log('Report generation complete.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error generating report:', error);
      process.exit(1);
    });
}

export default generateAndSaveReport; 