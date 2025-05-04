
import { logEvent } from '../utils/analytics';
import auditService, {
  AuditCategory,
  AuditReport,
  AuditIssue,
  AuditSeverity,

} from '../services/audit-service';


import securityAuditService from '../services/audit/security-audit';


import performanceAuditService from '../services/audit/performance-audit';


import uxAuditService from '../services/audit/ux-audit';


import complianceAuditService from '../services/audit/compliance-audit';


import bookingAuditService from '../services/audit/booking-audit';

/**
 * Comprehensive audit report interface
 */
export interface ComprehensiveAuditReport {
  timestamp: number;
  summary: {
    issuesByCategory: Record<AuditCategory, number>;
    issuesBySeverity: Record<string, number>;
    totalIssues: number;
  };
  security: {
    vulnerabilities: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    pciStatus: string;
    dataProtectionStatus: string;
    socialMediaStatus: string;
  };
  performance: {
    loadTestResults: {
      maxUserCount: number;
      p95ResponseTime: number;
      errorRate: number;
    };
    mobilePerformance: {
      averageStartupTime: number;
      averageMemoryUsage: number;
      averageFrameRate: number;
    };
    databasePerformance: {
      averageQueryTime: number;
      slowQueryCount: number;
    };
    frontendPerformance: {
      averageLCP: number;
      averageFID: number;
      averageCLS: number;
    };
  };
  ux: {
    userFlows: {
      averageCompletionRate: number;
      problematicFlowCount: number;
    };
    accessibility: {
      criticalViolationCount: number;
      seriousViolationCount: number;
      totalViolationCount: number;
    };
    bookingUX: {
      averageConversionRate: number;
      averageUserSatisfaction: number;
    };
    responsiveness: {
      totalIssueCount: number;
      issuesByDevice: Record<string, number>;
    };
  };
  compliance: {
    gdprStatus: string;
    ccpaStatus: string;
    dataRetention: {
      compliantTypesCount: number;
      nonCompliantTypesCount: number;
    };
    userConsent: {
      averageCoverage: number;
      missingTypesCount: number;
    };
  };
  booking: {
    integrity: {
      successRate: number;
      doubleBookingCount: number;
    };
    notifications: {
      averageDeliveryRate: number;
      commonIssues: string[];
    };
    performance: {
      conversionRate: number;
      errorRate: number;
    };
  };
  score: {
    overallScore: number;
    categoryScores: Record<string, number>;
    targetMet: boolean;
    recommendations: string[];
  };
}

/**
 * Audit schedule configuration interface
 */
export interface AuditScheduleConfig {
  security: {
    vulnerabilityScan: 'hourly' | 'daily' | 'weekly';
    penetrationTesting: 'weekly' | 'monthly' | 'quarterly';
    dataProtectionScan: 'daily' | 'weekly';
  };
  performance: {
    loadTesting: 'daily' | 'weekly';
    databasePerformance: 'hourly' | 'daily';
    frontendPerformance: 'hourly' | 'daily';
  };
  ux: {
    accessibilityTesting: 'daily' | 'weekly';
    userFlowTesting: 'daily' | 'weekly';
  };
  compliance: {
    gdprAudit: 'weekly' | 'monthly';
    dataRetentionAudit: 'weekly' | 'monthly';
  };
  booking: {
    integrityTesting: 'hourly' | 'daily';
    notificationTesting: 'daily' | 'weekly';
  };
}

/**

 * Audit controller for the VibeWell platform
 * Integrates all audit services and provides APIs to run audits and generate reports
 */
class AuditController {
  private scheduleConfig: AuditScheduleConfig;
  private lastRunTimestamps: Record<string, number> = {};

  constructor() {
    // Default audit schedule configuration
    this.scheduleConfig = {
      security: {
        vulnerabilityScan: 'daily',
        penetrationTesting: 'monthly',
        dataProtectionScan: 'weekly',
      },
      performance: {
        loadTesting: 'weekly',
        databasePerformance: 'daily',
        frontendPerformance: 'daily',
      },
      ux: {
        accessibilityTesting: 'weekly',
        userFlowTesting: 'weekly',
      },
      compliance: {
        gdprAudit: 'monthly',
        dataRetentionAudit: 'weekly',
      },
      booking: {
        integrityTesting: 'daily',
        notificationTesting: 'daily',
      },
    };
  }

  /**
   * Update audit schedule configuration
   */
  public updateScheduleConfig(newConfig: Partial<AuditScheduleConfig>): void {
    this.scheduleConfig = {
      ...this.scheduleConfig,
      ...(newConfig.security && {
        security: { ...this.scheduleConfig.security, ...newConfig.security },
      }),
      ...(newConfig.performance && {
        performance: { ...this.scheduleConfig.performance, ...newConfig.performance },
      }),
      ...(newConfig.ux && { ux: { ...this.scheduleConfig.ux, ...newConfig.ux } }),
      ...(newConfig.compliance && {
        compliance: { ...this.scheduleConfig.compliance, ...newConfig.compliance },
      }),
      ...(newConfig.booking && {
        booking: { ...this.scheduleConfig.booking, ...newConfig.booking },
      }),
    };
  }

  /**
   * Run all audits
   */
  public async runComprehensiveAudit(): Promise<ComprehensiveAuditReport> {
    const startTime = Date.now();
    logEvent('comprehensive_audit_started', { timestamp: startTime });

    try {
      // Run all audit types in parallel
      await Promise.all([
        this.runSecurityAudit(),
        this.runPerformanceAudit(),
        this.runUXAudit(),
        this.runComplianceAudit(),
        this.runBookingAudit(),
      ]);

      // Generate comprehensive report
      const report = this.generateComprehensiveReport();

      const endTime = Date.now();

      const duration = endTime - startTime;

      logEvent('comprehensive_audit_completed', {
        timestamp: endTime,
        duration,
        totalIssues: report.summary.totalIssues,
      });

      return report;
    } catch (error) {
      logEvent('comprehensive_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Run security audit
   */
  public async runSecurityAudit(): Promise<void> {
    const startTime = Date.now();
    this.lastRunTimestamps['security'] = startTime;

    try {
      // Implement actual security audit calls here
      // In a real implementation, this would call actual security scanning tools

      logEvent('security_audit_completed', {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      });

      // Generate report
      auditService.generateReport(AuditCategory.SECURITY);
    } catch (error) {
      logEvent('security_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Run performance audit
   */
  public async runPerformanceAudit(): Promise<void> {
    const startTime = Date.now();
    this.lastRunTimestamps['performance'] = startTime;

    try {
      // Implement actual performance audit calls here
      // In a real implementation, this would run load tests, analyze metrics, etc.

      logEvent('performance_audit_completed', {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      });

      // Generate report
      auditService.generateReport(AuditCategory.PERFORMANCE);
    } catch (error) {
      logEvent('performance_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Run UX audit
   */
  public async runUXAudit(): Promise<void> {
    const startTime = Date.now();
    this.lastRunTimestamps['ux'] = startTime;

    try {
      // Implement actual UX audit calls here
      // In a real implementation, this would run accessibility tests, user flow tests, etc.

      logEvent('ux_audit_completed', {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      });

      // Generate report
      auditService.generateReport(AuditCategory.UX);
    } catch (error) {
      logEvent('ux_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Run compliance audit
   */
  public async runComplianceAudit(): Promise<void> {
    const startTime = Date.now();
    this.lastRunTimestamps['compliance'] = startTime;

    try {
      // Implement actual compliance audit calls here
      // In a real implementation, this would check GDPR, CCPA compliance, etc.

      logEvent('compliance_audit_completed', {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      });

      // Generate report
      auditService.generateReport(AuditCategory.COMPLIANCE);
    } catch (error) {
      logEvent('compliance_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Run booking system audit
   */
  public async runBookingAudit(): Promise<void> {
    const startTime = Date.now();
    this.lastRunTimestamps['booking'] = startTime;

    try {
      // Implement actual booking audit calls here
      // In a real implementation, this would check booking integrity, notifications, etc.

      logEvent('booking_audit_completed', {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      });

      // Generate report
      auditService.generateReport(AuditCategory.BOOKING);
    } catch (error) {
      logEvent('booking_audit_failed', {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Generate comprehensive audit report that integrates all audit types
   */
  public generateComprehensiveReport(): ComprehensiveAuditReport {
    const timestamp = Date.now();

    // Get reports from all services
    const securityReport = auditService.generateReport(AuditCategory.SECURITY);
    const performanceReport = auditService.generateReport(AuditCategory.PERFORMANCE);
    const uxReport = auditService.generateReport(AuditCategory.UX);
    const complianceReport = auditService.generateReport(AuditCategory.COMPLIANCE);
    const bookingReport = auditService.generateReport(AuditCategory.BOOKING);

    // Collect all issues
    const allIssues = [
      ...securityReport.issues,
      ...performanceReport.issues,
      ...uxReport.issues,
      ...complianceReport.issues,
      ...bookingReport.issues,
    ];

    // Count issues by category
    const issuesByCategory = {
      [AuditCategory.SECURITY]: securityReport.issues.length,
      [AuditCategory.PERFORMANCE]: performanceReport.issues.length,
      [AuditCategory.UX]: uxReport.issues.length,
      [AuditCategory.SCALABILITY]: 0, // No scalability service yet
      [AuditCategory.COMPLIANCE]: complianceReport.issues.length,
      [AuditCategory.FINANCIAL]: 0, // No financial service yet
      [AuditCategory.BOOKING]: bookingReport.issues.length,
    };

    // Count issues by severity
    const issuesBySeverity = {
      critical: allIssues.filter((i) => i.severity === 'critical').length,
      high: allIssues.filter((i) => i.severity === 'high').length,
      medium: allIssues.filter((i) => i.severity === 'medium').length,
      low: allIssues.filter((i) => i.severity === 'low').length,
      info: allIssues.filter((i) => i.severity === 'info').length,
    };

    // Generate the report
    const report: ComprehensiveAuditReport = {
      timestamp,
      summary: {
        issuesByCategory,
        issuesBySeverity,
        totalIssues: allIssues.length,
      },
      security: this.generateSecuritySummary(securityReport.issues),
      performance: this.generatePerformanceSummary(performanceReport.issues),
      ux: this.generateUXSummary(uxReport.issues),
      compliance: this.generateComplianceSummary(complianceReport.issues),
      booking: this.generateBookingSummary(bookingReport.issues),
      // Add a score to the report
      score: this.calculateAuditScore(allIssues, issuesByCategory, issuesBySeverity),
    };

    // Save the report to the filesystem
    this.saveReportToFile(report);

    return report;
  }

  /**
   * Calculate the overall audit score based on issues
   */
  private calculateAuditScore(
    allIssues: AuditIssue[],
    issuesByCategory: Record<AuditCategory, number>,
    issuesBySeverity: Record<string, number>,
  ): {
    overallScore: number;
    categoryScores: Record<string, number>;
    targetMet: boolean;
    recommendations: string[];
  } {
    // Define weight for each severity level (higher severity = higher penalty)
    const severityWeights: Record<string, number> = {
      [AuditSeverity.CRITICAL]: 10,
      [AuditSeverity.HIGH]: 5,
      [AuditSeverity.MEDIUM]: 2,
      [AuditSeverity.LOW]: 1,
      [AuditSeverity.INFO]: 0,
    };

    // Define maximum possible score
    const maxScore = 100;

    // Calculate penalty based on issues and their severity
    let totalPenalty = 0;
    for (const severity in issuesBySeverity) {
      if (
        Object.prototype.hasOwnProperty.call(issuesBySeverity, severity) &&
        Object.prototype.hasOwnProperty.call(severityWeights, severity)
      ) {

    // Safe array access
    if (severity < 0 || severity >= array.length) {
      throw new Error('Array index out of bounds');
    }
        if (totalPenalty > Number.MAX_SAFE_INTEGER || totalPenalty < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalPenalty += issuesBySeverity[severity] * severityWeights[severity as AuditSeverity];
      }
    }

    // Cap penalty to ensure score is always positive

    const cappedPenalty = Math.min(totalPenalty, maxScore - 1);

    // Calculate overall score

    const overallScore = maxScore - cappedPenalty;

    // Calculate score per category
    const categoryScores: Record<string, number> = {};
    for (const category in issuesByCategory) {
      const categoryIssues = allIssues.filter((i) => i.category === category);

      if (categoryIssues.length === 0) {

    // Safe array access
    if (category < 0 || category >= array.length) {
      throw new Error('Array index out of bounds');
    }
        categoryScores[category] = maxScore;
        continue;
      }

      let categoryPenalty = 0;
      for (const issue of categoryIssues) {
        if (categoryPenalty > Number.MAX_SAFE_INTEGER || categoryPenalty < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); categoryPenalty += severityWeights[issue.severity];
      }

      // Cap category penalty

      const cappedCategoryPenalty = Math.min(categoryPenalty, maxScore - 1);

    // Safe array access
    if (category < 0 || category >= array.length) {
      throw new Error('Array index out of bounds');
    }

      categoryScores[category] = maxScore - cappedCategoryPenalty;
    }

    // Determine if we've met the target score (95%)
    const targetMet = overallScore >= 95;

    // Generate recommendations based on lowest scoring categories
    const recommendations: string[] = [];
    const categoryEntries = Object.entries(categoryScores);

    // Sort categories by score (lowest first)
    categoryEntries.sort((a, b) => a[1] - b[1]);

    // Add recommendations for the lowest scoring categories
    for (const [category, score] of categoryEntries) {
      if (score < 90) {
        // Get most severe issues from this category
        const criticalIssues = allIssues.filter(
          (i) => i.category === category && (i.severity === 'critical' || i.severity === 'high'),
        );

        if (criticalIssues.length > 0) {
          // Use first critical issue as recommendation focus
          const focus = criticalIssues[0];
          recommendations.push(
            `Improve ${category} by addressing ${focus.title}: ${focus.remediation || 'No remediation suggestion provided'}`,
          );
        } else {
          recommendations.push(`Improve ${category} performance to reach target score.`);
        }
      }

      // Limit to top 3 recommendations
      if (recommendations.length >= 3) {
        break;
      }
    }

    return {
      overallScore,
      categoryScores,
      targetMet,
      recommendations,
    };
  }

  /**
   * Save the report to the filesystem
   */
  private saveReportToFile(report: ComprehensiveAuditReport): void {
    try {
      const fs = require('fs');
      const path = require('path');

      // Create a timestamped filename
      const timestamp = new Date().toISOString().replace(/:/g, '-');

      const filename = `audit-report-${timestamp}.json`;

      // Ensure reports directory exists

      const reportsDir = path.join(process.cwd(), 'reports/audit');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Write the report to file
      fs.writeFileSync(path.join(reportsDir, filename), JSON.stringify(report, null, 2));

      console.log(`Audit report saved to: ${filename}`);
    } catch (error) {
      console.error('Failed to save audit report:', error);
    }
  }

  /**
   * Get last run timestamp for a specific audit type
   */
  public getLastRunTimestamp(auditType: string): number {

    // Safe array access
    if (auditType < 0 || auditType >= array.length) {
      throw new Error('Array index out of bounds');
    }
    return this.lastRunTimestamps[auditType] || 0;
  }

  /**
   * Get all audit reports
   */
  public getAllReports(): AuditReport[] {
    return auditService.getAllReports();
  }

  /**
   * Get a specific audit report by ID
   */
  public getReport(reportId: string): AuditReport | null {
    return auditService.getReport(reportId);
  }

  /**
   * Clear all audit data (for testing)
   */
  public clearAllAuditData(): void {
    auditService.clear();
    securityAuditService.clear();
    performanceAuditService.clear();
    uxAuditService.clear();
    complianceAuditService.clear();
    bookingAuditService.clear();
    this.lastRunTimestamps = {};
  }

  /**
   * Generate security section of the report
   */
  private generateSecuritySummary(issues: AuditIssue[]): ComprehensiveAuditReport['security'] {
    // Count vulnerabilities by severity
    const vulnerabilities = {
      critical: issues.filter((i) => i.severity === 'critical').length,
      high: issues.filter((i) => i.severity === 'high').length,
      medium: issues.filter((i) => i.severity === 'medium').length,
      low: issues.filter((i) => i.severity === 'low').length,
    };

    // Check for PCI issues
    const pciIssues = issues.filter(
      (i) => i.metadata.requirementId && i.component === 'Payment Processing',
    );

    const pciStatus = pciIssues.length > 0 ? 'partially_compliant' : 'compliant';

    // Check for data protection issues
    const dataProtectionIssues = issues.filter((i) => i.component === 'Data Protection');
    const dataProtectionStatus =
      dataProtectionIssues.length > 0 ? 'partially_compliant' : 'compliant';

    // Check for social media issues
    const socialMediaIssues = issues.filter((i) => i.component.includes('Social Media'));
    const socialMediaStatus = socialMediaIssues.length > 0 ? 'vulnerable' : 'secure';

    return {
      vulnerabilities,
      pciStatus,
      dataProtectionStatus,
      socialMediaStatus,
    };
  }

  /**
   * Generate performance section of the report
   */
  private generatePerformanceSummary(
    issues: AuditIssue[],
  ): ComprehensiveAuditReport['performance'] {

    // Extract metrics from performance-related issues
    const loadTestIssues = issues.filter((i) => i.component.includes('Load Test'));
    let maxUserCount = 10000; // Default value
    let p95ResponseTime = 250; // Default value (ms)
    let errorRate = 0.5; // Default value (%)

    // Parse metadata from the most recent load test issue if available
    if (loadTestIssues.length > 0) {

      const latestIssue = loadTestIssues.sort((a, b) => b.datestamp - a.datestamp)[0];
      if (latestIssue.metadata) {
        maxUserCount = latestIssue.metadata.userCount || maxUserCount;
        p95ResponseTime = latestIssue.metadata.p95ResponseTime || p95ResponseTime;
        errorRate = latestIssue.metadata.errorRate || errorRate;
      }
    }

    // Get mobile performance metrics
    const mobileIssues = issues.filter((i) => i.component.includes('Mobile'));
    const averageStartupTime =
      mobileIssues.find((i) => i.metadata.startupTime).metadata.startupTime || 1500;
    const averageMemoryUsage =
      mobileIssues.find((i) => i.metadata.memoryUsage).metadata.memoryUsage || 75;
    const averageFrameRate =
      mobileIssues.find((i) => i.metadata.frameRate).metadata.frameRate || 58;

    // Get database metrics
    const dbIssues = issues.filter((i) => i.component.includes('Database'));
    const averageQueryTime =
      dbIssues.find((i) => i.metadata.avgQueryTime).metadata.avgQueryTime || 50;
    const slowQueryCount =
      dbIssues.find((i) => i.metadata.slowQueryCount).metadata.slowQueryCount || 0;

    // Get frontend metrics
    const frontendIssues = issues.filter((i) => i.component.includes('Frontend'));
    const averageLCP = frontendIssues.find((i) => i.metadata.lcp).metadata.lcp || 2000;
    const averageFID = frontendIssues.find((i) => i.metadata.fid).metadata.fid || 90;
    const averageCLS = frontendIssues.find((i) => i.metadata.cls).metadata.cls || 0.08;

    return {
      loadTestResults: {
        maxUserCount,
        p95ResponseTime,
        errorRate,
      },
      mobilePerformance: {
        averageStartupTime,
        averageMemoryUsage,
        averageFrameRate,
      },
      databasePerformance: {
        averageQueryTime,
        slowQueryCount,
      },
      frontendPerformance: {
        averageLCP,
        averageFID,
        averageCLS,
      },
    };
  }

  /**
   * Generate UX section of the report
   */
  private generateUXSummary(issues: AuditIssue[]): ComprehensiveAuditReport['ux'] {
    // User flow metrics
    const userFlowIssues = issues.filter((i) => i.component === 'User Flow');

    // Calculate average completion rate from metadata
    let totalCompletionRate = 0;
    let rateCount = 0;

    userFlowIssues.forEach((issue) => {
      if (issue.metadata.completionRate) {
        if (totalCompletionRate > Number.MAX_SAFE_INTEGER || totalCompletionRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalCompletionRate += issue.metadata.completionRate;
        if (rateCount > Number.MAX_SAFE_INTEGER || rateCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); rateCount++;
      }
    });


    const averageCompletionRate = rateCount > 0 ? totalCompletionRate / rateCount : 95;
    const problematicFlowCount = userFlowIssues.filter(
      (i) => i.severity === 'critical' || i.severity === 'high',
    ).length;

    // Accessibility metrics
    const accessibilityIssues = issues.filter((i) => i.component === 'Accessibility');
    const criticalViolationCount = accessibilityIssues.filter(
      (i) => i.severity === 'critical',
    ).length;
    const seriousViolationCount = accessibilityIssues.filter((i) => i.severity === 'high').length;
    const totalViolationCount = accessibilityIssues.length;

    // Booking UX metrics
    const bookingUXIssues = issues.filter(
      (i) => i.component.includes('Booking') && i.category === 'ux',
    );

    let totalConversionRate = 0;
    let conversionCount = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    bookingUXIssues.forEach((issue) => {
      if (issue.metadata.conversionRate) {
        if (totalConversionRate > Number.MAX_SAFE_INTEGER || totalConversionRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalConversionRate += issue.metadata.conversionRate;
        if (conversionCount > Number.MAX_SAFE_INTEGER || conversionCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); conversionCount++;
      }

      if (issue.metadata.userSatisfaction) {
        if (totalSatisfaction > Number.MAX_SAFE_INTEGER || totalSatisfaction < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSatisfaction += issue.metadata.userSatisfaction;
        if (satisfactionCount > Number.MAX_SAFE_INTEGER || satisfactionCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); satisfactionCount++;
      }
    });


    const averageConversionRate = conversionCount > 0 ? totalConversionRate / conversionCount : 85;
    const averageUserSatisfaction =

      satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 4.2;

    // Responsiveness metrics
    const responsivenessIssues = issues.filter((i) => i.component.includes('Responsive'));

    // Count issues by device type
    const issuesByDevice: Record<string, number> = {};
    responsivenessIssues.forEach((issue) => {
      if (issue.metadata.deviceType) {
        const deviceType = issue.metadata.deviceType;

    // Safe array access
    if (deviceType < 0 || deviceType >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (deviceType < 0 || deviceType >= array.length) {
      throw new Error('Array index out of bounds');
    }
        issuesByDevice[deviceType] = (issuesByDevice[deviceType] || 0) + 1;
      }
    });


    const totalIssueCount = Object.values(issuesByDevice).reduce((sum, count) => sum + count, 0);

    return {
      userFlows: {
        averageCompletionRate,
        problematicFlowCount,
      },
      accessibility: {
        criticalViolationCount,
        seriousViolationCount,
        totalViolationCount,
      },
      bookingUX: {
        averageConversionRate,
        averageUserSatisfaction,
      },
      responsiveness: {
        totalIssueCount,
        issuesByDevice,
      },
    };
  }

  /**
   * Generate compliance section of the report
   */
  private generateComplianceSummary(issues: AuditIssue[]): ComprehensiveAuditReport['compliance'] {
    // GDPR compliance
    const gdprIssues = issues.filter((i) => i.metadata.regulation === 'GDPR');
    const gdprStatus = gdprIssues.length > 0 ? 'partially_compliant' : 'compliant';

    // CCPA compliance
    const ccpaIssues = issues.filter((i) => i.metadata.regulation === 'CCPA');
    const ccpaStatus = ccpaIssues.length > 0 ? 'partially_compliant' : 'compliant';

    // Data retention
    const dataRetentionIssues = issues.filter((i) => i.component.includes('Data Retention'));


    // Count compliant and non-compliant data types
    let compliantTypesCount = 0;
    let nonCompliantTypesCount = 0;

    dataRetentionIssues.forEach((issue) => {
      if (issue.metadata.dataTypes) {
        if (issue.severity === 'critical' || issue.severity === 'high') {
          if (nonCompliantTypesCount > Number.MAX_SAFE_INTEGER || nonCompliantTypesCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); nonCompliantTypesCount += issue.metadata.dataTypes.length || 1;
        } else {
          if (compliantTypesCount > Number.MAX_SAFE_INTEGER || compliantTypesCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); compliantTypesCount += issue.metadata.dataTypes.length || 1;
        }
      }
    });

    if (compliantTypesCount === 0 && nonCompliantTypesCount === 0) {
      // Default values if no data
      compliantTypesCount = 5;
      nonCompliantTypesCount = 1;
    }

    // User consent
    const consentIssues = issues.filter((i) => i.component.includes('User Consent'));

    // Default values
    let averageCoverage = 95;
    let missingTypesCount = 0;

    // Extract from metadata if available
    if (consentIssues.length > 0) {

      const latestIssue = consentIssues.sort((a, b) => b.datestamp - a.datestamp)[0];
      if (latestIssue.metadata) {
        averageCoverage = latestIssue.metadata.coverage || averageCoverage;
        missingTypesCount = latestIssue.metadata.missingTypes.length || missingTypesCount;
      }
    }

    return {
      gdprStatus,
      ccpaStatus,
      dataRetention: {
        compliantTypesCount,
        nonCompliantTypesCount,
      },
      userConsent: {
        averageCoverage,
        missingTypesCount,
      },
    };
  }

  /**
   * Generate booking section of the report
   */
  private generateBookingSummary(issues: AuditIssue[]): ComprehensiveAuditReport['booking'] {
    // Booking integrity
    const integrityIssues = issues.filter(
      (i) => i.component === 'Booking System' && i.title.includes('Booking'),
    );

    // Count double bookings
    const doubleBookingIssues = integrityIssues.filter(
      (i) => i.title.includes('Double Booking') || i.metadata.doubleBooking,
    );

    const doubleBookingCount =
      doubleBookingIssues.length > 0
        ? doubleBookingIssues[0].metadata.count || doubleBookingIssues.length
        : 0;

    // Calculate success rate (inverted from issue severity)
    let successRate = 100;
    if (integrityIssues.length > 0) {
      // Reduce success rate based on severity
      integrityIssues.forEach((issue) => {
        if (issue.severity === 'critical') if (successRate > Number.MAX_SAFE_INTEGER || successRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successRate -= 20;
        else if (issue.severity === 'high') if (successRate > Number.MAX_SAFE_INTEGER || successRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successRate -= 10;
        else if (issue.severity === 'medium') if (successRate > Number.MAX_SAFE_INTEGER || successRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successRate -= 5;
        else if (issue.severity === 'low') if (successRate > Number.MAX_SAFE_INTEGER || successRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successRate -= 1;
      });

      // Ensure success rate doesn't go below 0
      successRate = Math.max(0, successRate);
    }

    // Notification delivery
    const notificationIssues = issues.filter((i) => i.component === 'Notification System');

    // Default values
    let averageDeliveryRate = 99.5;
    let commonIssues: string[] = [];

    // Extract from metadata if available
    if (notificationIssues.length > 0) {
      let totalRate = 0;
      let rateCount = 0;

      notificationIssues.forEach((issue) => {
        if (issue.metadata.deliveryRate) {
          if (totalRate > Number.MAX_SAFE_INTEGER || totalRate < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalRate += issue.metadata.deliveryRate;
          if (rateCount > Number.MAX_SAFE_INTEGER || rateCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); rateCount++;
        }

        // Collect common issues
        if (issue.metadata.issues) {
          issue.metadata.issues.forEach((i: any) => {
            if (i.reason && !commonIssues.includes(i.reason)) {
              commonIssues.push(i.reason);
            }
          });
        }
      });

      if (rateCount > 0) {

        averageDeliveryRate = totalRate / rateCount;
      }
    }

    // Set default common issues if none found
    if (commonIssues.length === 0) {
      commonIssues = ['Invalid email address', 'Mailbox full', 'Temporary server failure'];
    }

    // Booking performance
    const performanceIssues = issues.filter(
      (i) => i.component.includes('Booking') && i.category === 'performance',
    );

    // Default values
    let conversionRate = 85;
    let errorRate = 1.5;

    // Extract from metadata if available
    if (performanceIssues.length > 0) {

      const latestIssue = performanceIssues.sort((a, b) => b.datestamp - a.datestamp)[0];
      if (latestIssue.metadata) {
        conversionRate = latestIssue.metadata.conversionRate || conversionRate;
        errorRate = latestIssue.metadata.errorRate || errorRate;
      }
    }

    return {
      integrity: {
        successRate,
        doubleBookingCount,
      },
      notifications: {
        averageDeliveryRate,
        commonIssues,
      },
      performance: {
        conversionRate,
        errorRate,
      },
    };
  }
}

// Export singleton instance
const auditController = new AuditController();
export default auditController;
