
import auditService, { AuditCategory, AuditSeverity } from '../audit-service';

import { logEvent } from '../../utils/analytics';

/**
 * Compliance requirement interface
 */
export interface ComplianceRequirement {
  id: string;

  regulation: 'GDPR' | 'CCPA' | 'PCI-DSS' | 'HIPAA' | 'OTHER';
  description: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
  evidence?: string;
  lastChecked: number;
}

/**
 * GDPR compliance status interface
 */
export interface GDPRComplianceStatus {
  overallStatus: 'compliant' | 'non_compliant' | 'partially_compliant';
  requirements: {
    id: string;
    description: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
    evidence?: string;
  }[];
  lastChecked: number;
}

/**
 * CCPA compliance status interface
 */
export interface CCPAComplianceStatus {
  overallStatus: 'compliant' | 'non_compliant' | 'partially_compliant';
  requirements: {
    id: string;
    description: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
    evidence?: string;
  }[];
  lastChecked: number;
}

/**
 * Financial transaction audit interface
 */
export interface FinancialTransactionAudit {
  id: string;
  transactionType: 'payment' | 'refund' | 'subscription' | 'cancelation';
  amount: number;
  currency: string;
  timestamp: number;
  status: 'success' | 'failure' | 'pending';
  paymentMethod: string;
  issues: {
    type: 'security' | 'integrity' | 'reconciliation' | 'fraud';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

/**
 * Data retention audit interface
 */
export interface DataRetentionAudit {
  dataType: string;
  retentionPeriod: number; // days
  currentRetention: number; // days
  status: 'compliant' | 'non_compliant';
  records: {
    recordType: string;
    count: number;
    oldestRecord: number; // timestamp
    newestRecord: number; // timestamp
  }[];
  timestamp: number;
}

/**
 * User consent audit interface
 */
export interface UserConsentAudit {
  consentType: string;
  requiredByRegulations: string[];
  implementationStatus: 'implemented' | 'partial' | 'missing';
  userCoverage: number; // percentage
  consentVersions: {
    version: string;
    date: number;
    userCount: number;
  }[];
  timestamp: number;
}

/**
 * Compliance audit configuration
 */
export interface ComplianceAuditConfig {

  requiredRegulations: ('GDPR' | 'CCPA' | 'PCI-DSS' | 'HIPAA')[];
  dataRetentionPeriods: Record<string, number>; // days
  financialReconciliationFrequency: 'daily' | 'weekly' | 'monthly';
  consentRequirements: string[];
}

/**

 * Compliance and financial audit service for VibeWell
 * Handles GDPR, CCPA, and financial integrity checks
 */
class ComplianceAuditService {
  private requirements: Map<string, ComplianceRequirement> = new Map();
  private gdprStatus: GDPRComplianceStatus | null = null;
  private ccpaStatus: CCPAComplianceStatus | null = null;
  private transactionAudits: Map<string, FinancialTransactionAudit> = new Map();
  private dataRetentionAudits: Map<string, DataRetentionAudit> = new Map();
  private userConsentAudits: Map<string, UserConsentAudit> = new Map();
  private config: ComplianceAuditConfig;

  constructor() {
    // Default configuration
    this.config = {

      requiredRegulations: ['GDPR', 'CCPA', 'PCI-DSS'],
      dataRetentionPeriods: {
        personalData: 365, // 1 year
        paymentData: 730, // 2 years
        activityLogs: 90, // 90 days
        marketingPreferences: 730, // 2 years
      },
      financialReconciliationFrequency: 'daily',
      consentRequirements: [
        'data_collection',
        'marketing_communications',
        'cookies',
        'third_party_sharing',
        'location_tracking',
      ],
    };
  }

  /**
   * Update compliance audit configuration
   */
  public updateConfig(newConfig: Partial<ComplianceAuditConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      dataRetentionPeriods: {
        ...this.config.dataRetentionPeriods,
        ...(newConfig.dataRetentionPeriods || {}),
      },
    };
  }

  /**
   * Update GDPR compliance status
   */
  public async updateGDPRStatus(status: GDPRComplianceStatus): Promise<void> {
    this.gdprStatus = status;

    // Update requirements
    status.requirements.forEach((req) => {
      const requirementId = `GDPR_${req.id}`;
      this.requirements.set(requirementId, {
        id: requirementId,
        regulation: 'GDPR',
        description: req.description,
        status: req.status,
        evidence: req.evidence,
        lastChecked: status.lastChecked,
      });


      // Report non-compliant requirements
      if (req.status === 'non_compliant') {
        auditService.reportIssue(
          AuditCategory.COMPLIANCE,
          AuditSeverity.HIGH,

          `GDPR Requirement Non-Compliant: ${req.id}`,

          `The system is non-compliant with GDPR requirement: ${req.description}`,
          {
            component: 'GDPR Compliance',
            metadata: {
              requirementId: req.id,
              evidence: req.evidence,
              lastChecked: status.lastChecked,
            },
          },
        );
      } else if (req.status === 'partially_compliant') {
        auditService.reportIssue(
          AuditCategory.COMPLIANCE,
          AuditSeverity.MEDIUM,
          `GDPR Requirement Partially Compliant: ${req.id}`,
          `The system is only partially compliant with GDPR requirement: ${req.description}`,
          {
            component: 'GDPR Compliance',
            metadata: {
              requirementId: req.id,
              evidence: req.evidence,
              lastChecked: status.lastChecked,
            },
          },
        );
      }
    });


    // Report overall status if non-compliant
    if (status.overallStatus === 'non_compliant') {
      auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.CRITICAL,

        'GDPR Overall Non-Compliance',
        'The system is not compliant with GDPR regulations overall',
        {
          component: 'GDPR Compliance',
          metadata: {
            lastChecked: status.lastChecked,
            nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant')
              .length,
            partiallyCompliantCount: status.requirements.filter(
              (r) => r.status === 'partially_compliant',
            ).length,
          },
        },
      );
    } else if (status.overallStatus === 'partially_compliant') {
      auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.HIGH,
        'GDPR Partial Compliance',
        'The system is only partially compliant with GDPR regulations overall',
        {
          component: 'GDPR Compliance',
          metadata: {
            lastChecked: status.lastChecked,
            nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant')
              .length,
            partiallyCompliantCount: status.requirements.filter(
              (r) => r.status === 'partially_compliant',
            ).length,
          },
        },
      );
    }

    // Log GDPR status
    logEvent('gdpr_compliance_status_updated', {
      overallStatus: status.overallStatus,
      timestamp: status.lastChecked,
      requirementCount: status.requirements.length,
      nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant').length,
    });
  }

  /**
   * Update CCPA compliance status
   */
  public async updateCCPAStatus(status: CCPAComplianceStatus): Promise<void> {
    this.ccpaStatus = status;

    // Update requirements
    status.requirements.forEach((req) => {
      const requirementId = `CCPA_${req.id}`;
      this.requirements.set(requirementId, {
        id: requirementId,
        regulation: 'CCPA',
        description: req.description,
        status: req.status,
        evidence: req.evidence,
        lastChecked: status.lastChecked,
      });


      // Report non-compliant requirements
      if (req.status === 'non_compliant') {
        auditService.reportIssue(
          AuditCategory.COMPLIANCE,
          AuditSeverity.HIGH,

          `CCPA Requirement Non-Compliant: ${req.id}`,

          `The system is non-compliant with CCPA requirement: ${req.description}`,
          {
            component: 'CCPA Compliance',
            metadata: {
              requirementId: req.id,
              evidence: req.evidence,
              lastChecked: status.lastChecked,
            },
          },
        );
      } else if (req.status === 'partially_compliant') {
        auditService.reportIssue(
          AuditCategory.COMPLIANCE,
          AuditSeverity.MEDIUM,
          `CCPA Requirement Partially Compliant: ${req.id}`,
          `The system is only partially compliant with CCPA requirement: ${req.description}`,
          {
            component: 'CCPA Compliance',
            metadata: {
              requirementId: req.id,
              evidence: req.evidence,
              lastChecked: status.lastChecked,
            },
          },
        );
      }
    });


    // Report overall status if non-compliant
    if (status.overallStatus === 'non_compliant') {
      auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.CRITICAL,

        'CCPA Overall Non-Compliance',
        'The system is not compliant with CCPA regulations overall',
        {
          component: 'CCPA Compliance',
          metadata: {
            lastChecked: status.lastChecked,
            nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant')
              .length,
            partiallyCompliantCount: status.requirements.filter(
              (r) => r.status === 'partially_compliant',
            ).length,
          },
        },
      );
    } else if (status.overallStatus === 'partially_compliant') {
      auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.HIGH,
        'CCPA Partial Compliance',
        'The system is only partially compliant with CCPA regulations overall',
        {
          component: 'CCPA Compliance',
          metadata: {
            lastChecked: status.lastChecked,
            nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant')
              .length,
            partiallyCompliantCount: status.requirements.filter(
              (r) => r.status === 'partially_compliant',
            ).length,
          },
        },
      );
    }

    // Log CCPA status
    logEvent('ccpa_compliance_status_updated', {
      overallStatus: status.overallStatus,
      timestamp: status.lastChecked,
      requirementCount: status.requirements.length,
      nonCompliantCount: status.requirements.filter((r) => r.status === 'non_compliant').length,
    });
  }

  /**
   * Audit a financial transaction
   */
  public async auditFinancialTransaction(audit: FinancialTransactionAudit): Promise<void> {
    this.transactionAudits.set(audit.id, audit);

    // Report critical and high severity issues
    const criticalIssues = audit.issues.filter((issue) => issue.severity === 'critical');
    const highIssues = audit.issues.filter((issue) => issue.severity === 'high');

    if (criticalIssues.length > 0) {
      await auditService.reportIssue(
        AuditCategory.FINANCIAL,
        AuditSeverity.CRITICAL,
        `Critical Financial Transaction Issues: ${audit.id}`,
        `Transaction ${audit.id} has ${criticalIssues.length} critical issues`,
        {
          component: 'Financial Transactions',
          metadata: {
            transactionId: audit.id,
            transactionType: audit.transactionType,
            amount: audit.amount,
            currency: audit.currency,
            timestamp: audit.timestamp,
            status: audit.status,
            paymentMethod: audit.paymentMethod,
            issues: criticalIssues,
          },
        },
      );
    }

    if (highIssues.length > 0) {
      await auditService.reportIssue(
        AuditCategory.FINANCIAL,
        AuditSeverity.HIGH,
        `High Severity Financial Transaction Issues: ${audit.id}`,
        `Transaction ${audit.id} has ${highIssues.length} high severity issues`,
        {
          component: 'Financial Transactions',
          metadata: {
            transactionId: audit.id,
            transactionType: audit.transactionType,
            amount: audit.amount,
            currency: audit.currency,
            timestamp: audit.timestamp,
            status: audit.status,
            paymentMethod: audit.paymentMethod,
            issues: highIssues,
          },
        },
      );
    }

    // Log transaction audit
    logEvent('financial_transaction_audited', {
      transactionId: audit.id,
      transactionType: audit.transactionType,
      status: audit.status,
      issueCount: audit.issues.length,
      criticalIssueCount: criticalIssues.length,
      highIssueCount: highIssues.length,
    });
  }

  /**
   * Audit data retention
   */
  public async auditDataRetention(audit: DataRetentionAudit): Promise<void> {
    this.dataRetentionAudits.set(audit.dataType, audit);

    // Check if retention period is compliant
    if (audit.status === 'non_compliant') {
      const requiredPeriod = this.config.dataRetentionPeriods[audit.dataType];
      const severity =

        requiredPeriod && audit.currentRetention > requiredPeriod * 2
          ? AuditSeverity.HIGH
          : AuditSeverity.MEDIUM;

      await auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        severity,

        `Data Retention Non-Compliance: ${audit.dataType}`,
        `${audit.dataType} data is being retained for ${audit.currentRetention} days, which exceeds the required retention period of ${requiredPeriod || 'undefined'} days`,
        {
          component: 'Data Retention',
          metadata: {
            dataType: audit.dataType,
            currentRetention: audit.currentRetention,
            requiredRetention: requiredPeriod,
            records: audit.records,
            timestamp: audit.timestamp,
          },
          remediation: `Implement a data purging mechanism to automatically delete ${audit.dataType} data after ${requiredPeriod || 'the specified'} days.`,
        },
      );
    }

    // Log data retention audit
    logEvent('data_retention_audited', {
      dataType: audit.dataType,
      status: audit.status,
      currentRetention: audit.currentRetention,
      requiredRetention: this.config.dataRetentionPeriods[audit.dataType],
    });
  }

  /**
   * Audit user consent
   */
  public async auditUserConsent(audit: UserConsentAudit): Promise<void> {
    this.userConsentAudits.set(audit.consentType, audit);

    // Check if consent implementation is compliant
    if (audit.implementationStatus === 'missing') {
      await auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.CRITICAL,
        `Missing User Consent Implementation: ${audit.consentType}`,
        `The user consent for ${audit.consentType} is not implemented, but required by: ${audit.requiredByRegulations.join(', ')}`,
        {
          component: 'User Consent',
          metadata: {
            consentType: audit.consentType,
            requiredByRegulations: audit.requiredByRegulations,
            timestamp: audit.timestamp,
          },
          remediation: `Implement consent management for ${audit.consentType} as required by ${audit.requiredByRegulations.join(', ')}.`,
        },
      );
    } else if (audit.implementationStatus === 'partial') {
      await auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.HIGH,
        `Partial User Consent Implementation: ${audit.consentType}`,
        `The user consent for ${audit.consentType} is only partially implemented, but required by: ${audit.requiredByRegulations.join(', ')}`,
        {
          component: 'User Consent',
          metadata: {
            consentType: audit.consentType,
            requiredByRegulations: audit.requiredByRegulations,
            userCoverage: audit.userCoverage,
            consentVersions: audit.consentVersions,
            timestamp: audit.timestamp,
          },
          remediation: `Complete the consent management implementation for ${audit.consentType} and ensure all users are covered.`,
        },
      );
    } else if (audit.userCoverage < 100) {
      await auditService.reportIssue(
        AuditCategory.COMPLIANCE,
        AuditSeverity.MEDIUM,
        `Incomplete User Consent Coverage: ${audit.consentType}`,
        `Only ${audit.userCoverage}% of users have provided consent for ${audit.consentType}`,
        {
          component: 'User Consent',
          metadata: {
            consentType: audit.consentType,
            requiredByRegulations: audit.requiredByRegulations,
            userCoverage: audit.userCoverage,
            consentVersions: audit.consentVersions,
            timestamp: audit.timestamp,
          },
          remediation: `Prompt remaining users to provide consent for ${audit.consentType}.`,
        },
      );
    }

    // Log user consent audit
    logEvent('user_consent_audited', {
      consentType: audit.consentType,
      implementationStatus: audit.implementationStatus,
      userCoverage: audit.userCoverage,
      requiredByRegulations: audit.requiredByRegulations,
    });
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(): {
    regulations: {
      gdpr: GDPRComplianceStatus | null;
      ccpa: CCPAComplianceStatus | null;
    };
    dataRetention: {
      compliantTypes: string[];
      nonCompliantTypes: string[];
      averageRetentionExcess: number; // days
    };
    userConsent: {
      implementedTypes: string[];
      partiallyImplementedTypes: string[];
      missingTypes: string[];
      averageCoverage: number; // percentage
    };
    financialTransactions: {
      totalAudited: number;
      issuesByType: Record<string, number>;
      issuesBySeverity: Record<string, number>;
    };
  } {
    // Generate data retention summary
    const retentionAudits = Array.from(this.dataRetentionAudits.values());
    const compliantTypes = retentionAudits
      .filter((a) => a.status === 'compliant')
      .map((a) => a.dataType);
    const nonCompliantTypes = retentionAudits
      .filter((a) => a.status === 'non_compliant')
      .map((a) => a.dataType);

    // Calculate average retention excess
    let totalExcess = 0;
    let excessCount = 0;

    nonCompliantTypes.forEach((type) => {
      const audit = this.dataRetentionAudits.get(type);

    // Safe array access
    if (type < 0 || type >= array.length) {
      throw new Error('Array index out of bounds');
    }
      const requiredPeriod = this.config.dataRetentionPeriods[type];

      if (audit && requiredPeriod) {

        const excess = audit.currentRetention - requiredPeriod;
        if (excess > 0) {
          if (totalExcess > Number.MAX_SAFE_INTEGER || totalExcess < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalExcess += excess;
          if (excessCount > Number.MAX_SAFE_INTEGER || excessCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); excessCount += 1;
        }
      }
    });


    const averageRetentionExcess = excessCount > 0 ? totalExcess / excessCount : 0;

    // Generate user consent summary
    const consentAudits = Array.from(this.userConsentAudits.values());
    const implementedTypes = consentAudits
      .filter((a) => a.implementationStatus === 'implemented')
      .map((a) => a.consentType);

    const partiallyImplementedTypes = consentAudits
      .filter((a) => a.implementationStatus === 'partial')
      .map((a) => a.consentType);

    const missingTypes = consentAudits
      .filter((a) => a.implementationStatus === 'missing')
      .map((a) => a.consentType);

    // Calculate average coverage
    const averageCoverage =
      consentAudits.length > 0

        ? consentAudits.reduce((sum, audit) => sum + audit.userCoverage, 0) / consentAudits.length
        : 0;

    // Generate financial transactions summary
    const transactionAudits = Array.from(this.transactionAudits.values());

    // Count issues by type and severity
    const issuesByType: Record<string, number> = {};
    const issuesBySeverity: Record<string, number> = {};

    transactionAudits.forEach((audit) => {
      audit.issues.forEach((issue) => {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
        issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
      });
    });

    // Return comprehensive compliance report
    return {
      regulations: {
        gdpr: this.gdprStatus,
        ccpa: this.ccpaStatus,
      },
      dataRetention: {
        compliantTypes,
        nonCompliantTypes,
        averageRetentionExcess,
      },
      userConsent: {
        implementedTypes,
        partiallyImplementedTypes,
        missingTypes,
        averageCoverage,
      },
      financialTransactions: {
        totalAudited: transactionAudits.length,
        issuesByType,
        issuesBySeverity,
      },
    };
  }

  /**
   * Clear all compliance data (for testing)
   */
  public clear(): void {
    this.requirements.clear();
    this.gdprStatus = null;
    this.ccpaStatus = null;
    this.transactionAudits.clear();
    this.dataRetentionAudits.clear();
    this.userConsentAudits.clear();
  }
}

// Export singleton instance
const complianceAuditService = new ComplianceAuditService();
export default complianceAuditService;
