import { EventEmitter } from 'events';
import { logEvent } from '../utils/analytics';
import { hashData } from '../utils/encryption';
import { MetricType } from './performance-remediation';
import NotificationService from './notification-service';

/**
 * Audit severity levels
 */
export enum AuditSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

/**
 * Audit categories
 */
export enum AuditCategory {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  UX = 'ux',
  SCALABILITY = 'scalability',
  COMPLIANCE = 'compliance',
  FINANCIAL = 'financial',
  BOOKING = 'booking',
}

/**
 * Audit issue interface
 */
export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  component?: string;
  datestamp: number;
  remediation?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'wontfix';
  metadata?: Record<string, any>;
}

/**
 * Audit report interface
 */
export interface AuditReport {
  id: string;
  timestamp: number;
  category: AuditCategory;
  issues: AuditIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Threshold configuration interface
 */
export interface AuditThresholds {
  security: {
    vulnerabilitySeverity: number; // CVSS threshold for alerting
    maxCriticalIssues: number;
    maxHighIssues: number;
  };
  performance: {
    apiResponseTime: number; // ms
    renderTime: number; // ms
    ttfb: number; // ms
    lcp: number; // ms
    fid: number; // ms
    cls: number;
  };
  ux: {
    taskCompletionRate: number; // percentage
    bookingConversionRate: number; // percentage
  };
  scalability: {
    maxConcurrentUsers: number;
    maxBookingsPerHour: number;
  };
  compliance: {
    gdprComplianceScore: number; // percentage
    pciComplianceScore: number; // percentage
  };
}

/**
 * Primary audit service for VibeWell
 * Handles security, performance, UX, and compliance audits
 */
class AuditService extends EventEmitter {
  private issues: Map<string, AuditIssue> = new Map();
  private reports: Map<string, AuditReport> = new Map();
  private thresholds: AuditThresholds;
  private notificationService: NotificationService;
  private alertCooldowns: Map<string, number> = new Map();
  private readonly alertCooldownPeriod = 60 * 60 * 1000; // 1 hour

  constructor() {
    super();
    this.notificationService = new NotificationService();
    this.thresholds = this.getDefaultThresholds();
  }

  /**
   * Get default thresholds for audit checks
   */
  private getDefaultThresholds(): AuditThresholds {
    return {
      security: {
        vulnerabilitySeverity: 7.0, // CVSS >= 7.0 (High)
        maxCriticalIssues: 0,
        maxHighIssues: 5,
      },
      performance: {
        apiResponseTime: 200, // ms
        renderTime: 100, // ms
        ttfb: 100, // ms
        lcp: 2500, // ms
        fid: 100, // ms
        cls: 0.1,
      },
      ux: {
        taskCompletionRate: 90, // percentage
        bookingConversionRate: 95, // percentage
      },
      scalability: {
        maxConcurrentUsers: 10000,
        maxBookingsPerHour: 5000,
      },
      compliance: {
        gdprComplianceScore: 100, // percentage
        pciComplianceScore: 100, // percentage
      },
    };
  }

  /**
   * Update audit thresholds
   */
  public updateThresholds(newThresholds: Partial<AuditThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds,
    };
  }

  /**
   * Report an audit issue
   */
  public async reportIssue(
    category: AuditCategory,
    severity: AuditSeverity,
    title: string,
    description: string,
    options?: {
      component?: string;
      remediation?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AuditIssue> {
    const timestamp = Date.now();
    const hashInput = `${category}:${title}:${description}:${options?.component || ''}`;
    const id = await hashData(new TextEncoder().encode(hashInput));

    const issue: AuditIssue = {
      id,
      category,
      severity,
      title,
      description,
      component: options?.component,
      datestamp: timestamp,
      remediation: options?.remediation,
      status: 'open',
      metadata: options?.metadata,
    };

    this.issues.set(id, issue);

    // Log the event
    logEvent('audit_issue_reported', {
      id,
      category,
      severity,
      title,
      component: options?.component,
    });

    // Emit event
    this.emit('issue_reported', issue);

    // Send notification for high severity issues
    if (
      (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.HIGH) &&
      this.canSendAlert(id)
    ) {
      this.alertCooldowns.set(id, Date.now());
      this.notificationService.notifyAdmins({
        type: 'alert',
        subject: `[${severity.toUpperCase()}] ${title}`,
        message: description,
        data: {
          category,
          severity,
          id,
        },
      });
    }

    return issue;
  }

  /**
   * Check if we can send an alert (avoid notification spam)
   */
  private canSendAlert(id: string): boolean {
    const lastAlertTime = this.alertCooldowns.get(id);
    if (!lastAlertTime) return true;

    return Date.now() - lastAlertTime > this.alertCooldownPeriod;
  }

  /**
   * Update an issue's status
   */
  public updateIssueStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'wontfix',
    remediation?: string
  ): boolean {
    const issue = this.issues.get(id);
    if (!issue) return false;

    issue.status = status;
    if (remediation) {
      issue.remediation = remediation;
    }

    // Log the event
    logEvent('audit_issue_updated', {
      id,
      category: issue.category,
      severity: issue.severity,
      title: issue.title,
      status,
    });

    // Emit event
    this.emit('issue_updated', issue);

    return true;
  }

  /**
   * Get all issues for a category
   */
  public getIssues(
    category?: AuditCategory,
    status?: 'open' | 'in_progress' | 'resolved' | 'wontfix'
  ): AuditIssue[] {
    const issues = Array.from(this.issues.values());

    return issues.filter(issue => {
      if (category && issue.category !== category) return false;
      if (status && issue.status !== status) return false;
      return true;
    });
  }

  /**
   * Generate an audit report for a specific category
   */
  public generateReport(category: AuditCategory): AuditReport {
    const timestamp = Date.now();
    const id = `${category}_report_${timestamp}`;

    const issues = this.getIssues(category);

    // Calculate summary
    const summary = {
      critical: issues.filter(i => i.severity === AuditSeverity.CRITICAL).length,
      high: issues.filter(i => i.severity === AuditSeverity.HIGH).length,
      medium: issues.filter(i => i.severity === AuditSeverity.MEDIUM).length,
      low: issues.filter(i => i.severity === AuditSeverity.LOW).length,
      info: issues.filter(i => i.severity === AuditSeverity.INFO).length,
      total: issues.length,
    };

    const report: AuditReport = {
      id,
      timestamp,
      category,
      issues,
      summary,
    };

    this.reports.set(id, report);

    // Log the event
    logEvent('audit_report_generated', {
      id,
      category,
      issueCount: issues.length,
      summary,
    });

    // Emit event
    this.emit('report_generated', report);

    return report;
  }

  /**
   * Get a specific report by ID
   */
  public getReport(id: string): AuditReport | null {
    return this.reports.get(id) || null;
  }

  /**
   * Get all reports
   */
  public getAllReports(): AuditReport[] {
    return Array.from(this.reports.values());
  }

  /**
   * Check if the current state meets security thresholds
   */
  public checkSecurityThresholds(): boolean {
    const securityIssues = this.getIssues(AuditCategory.SECURITY, 'open');

    const criticalCount = securityIssues.filter(i => i.severity === AuditSeverity.CRITICAL).length;

    const highCount = securityIssues.filter(i => i.severity === AuditSeverity.HIGH).length;

    return (
      criticalCount <= this.thresholds.security.maxCriticalIssues &&
      highCount <= this.thresholds.security.maxHighIssues
    );
  }

  /**
   * Clear all issues and reports (for testing)
   */
  public clear(): void {
    this.issues.clear();
    this.reports.clear();
    this.alertCooldowns.clear();
  }
}

// Export singleton instance
const auditService = new AuditService();
export default auditService;
