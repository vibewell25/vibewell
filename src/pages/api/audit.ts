import { NextApiRequest, NextApiResponse } from '@/types/api';
import fs from 'fs';
import path from 'path';
import {
  auditController,
  auditService,
  securityAuditService,
  performanceAuditService,
  uxAuditService,
  complianceAuditService,
  bookingAuditService,
  AuditCategory,
} from '../../services/audit';

type AuditAction =
  | 'run_comprehensive_audit'
  | 'run_category_audit'
  | 'report_issue'
  | 'update_issue'
  | 'get_reports';

interface AuditApiRequest extends NextApiRequest {
  body: {
    action: AuditAction;
    category?: AuditCategory | string;
    issueId?: string;
    data?: any;
  };
}

export default async function handler(req: AuditApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    return handlePostRequest(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetRequest(req: AuditApiRequest, res: NextApiResponse) {
  try {
    const { reportId, category, comprehensive } = req.query;

    if (reportId) {
      // Return a specific report by ID
      const reportPath = path.join(process.cwd(), 'reports/audit', `${reportId}.json`);
      if (fs.existsSync(reportPath)) {
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        return res.status(200).json(JSON.parse(reportContent));
      } else {
        return res.status(404).json({ error: 'Report not found' });
      }
    }

    if (comprehensive) {
      // Return the latest comprehensive report
      const reportsDir = path.join(process.cwd(), 'reports/audit');
      const files = fs
        .readdirSync(reportsDir)
        .filter((file) => file.startsWith('comprehensive_'))
        .sort()
        .reverse();

      if (files.length > 0) {
        const latestReport = fs.readFileSync(path.join(reportsDir, files[0]), 'utf8');
        return res.status(200).json(JSON.parse(latestReport));
      } else {
        return res.status(404).json({ error: 'No comprehensive reports found' });
      }
    }

    if (category) {
      // Return reports for a specific category
      const categoryDir = path.join(process.cwd(), 'reports/audit', category.toString());
      if (fs.existsSync(categoryDir)) {
        const files = fs
          .readdirSync(categoryDir)
          .filter((file) => file.endsWith('.json'))
          .sort()
          .reverse();

        const reports = files.slice(0, 10).map((file) => {
          const content = fs.readFileSync(path.join(categoryDir, file), 'utf8');
          return JSON.parse(content);
        });

        return res.status(200).json({ reports });
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    // Return a list of all available reports
    const auditDir = path.join(process.cwd(), 'reports/audit');
    const categories = fs
      .readdirSync(auditDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const reportsByCategory: Record<string, string[]> = {};

    for (const cat of categories) {
      const catDir = path.join(auditDir, cat);
      if (fs.existsSync(catDir)) {
        const files = fs
          .readdirSync(catDir)
          .filter((file) => file.endsWith('.json'))
          .sort()
          .reverse();

        reportsByCategory[cat] = files;
      }
    }

    const rootFiles = fs
      .readdirSync(auditDir)
      .filter((file) => file.endsWith('.json') && file.startsWith('comprehensive_'))
      .sort()
      .reverse();

    reportsByCategory['comprehensive'] = rootFiles;

    return res.status(200).json({ reportsByCategory });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePostRequest(req: AuditApiRequest, res: NextApiResponse) {
  try {
    const { action, category, issueId, data } = req.body;

    switch (action) {
      case 'run_comprehensive_audit':
        await runComprehensiveAudit();
        return res.status(200).json({ success: true, message: 'Comprehensive audit initiated' });

      case 'run_category_audit':
        if (!category) {
          return res.status(400).json({ error: 'Category is required for category audit' });
        }
        await runCategoryAudit(category as AuditCategory);
        return res.status(200).json({ success: true, message: `${category} audit initiated` });

      case 'report_issue':
        if (!data || !data.category || !data.severity || !data.title || !data.description) {
          return res.status(400).json({ error: 'Missing required fields for reporting issue' });
        }
        const newIssueId = await auditService.reportIssue(
          data.category,
          data.severity,
          data.title,
          data.description,
          data.metadata || {},
        );
        return res.status(200).json({ success: true, issueId: newIssueId });

      case 'update_issue':
        if (!issueId || !data || !data.status) {
          return res.status(400).json({ error: 'Missing required fields for updating issue' });
        }
        await auditService.updateIssueStatus(issueId, data.status);
        return res.status(200).json({ success: true, message: 'Issue updated' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error handling POST request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function runComprehensiveAudit() {
  // Simulate some audit processes
  await securityAuditService.processVulnerabilityResults([
    {
      id: 'CVE-2023-1234',
      title: 'XSS Vulnerability',
      description: 'Cross-site scripting vulnerability in comments',
      cvssScore: 7.5,
      severity: 'high',
      component: 'Web UI',
    },
  ]);

  await performanceAuditService.recordLoadTestResult({
    averageResponseTime: 850,
    p95ResponseTime: 1200,
    p99ResponseTime: 1800,
    failedRequests: 3,
    totalRequests: 1000,
    timestamp: Date.now(),
  });

  await uxAuditService.recordUserFlowResult({
    flowName: 'Booking Process',
    completionRate: 0.85,
    averageTimeToComplete: 120,
    dropOffPoints: [
      { step: 'payment', rate: 0.08 },
      { step: 'confirmation', rate: 0.04 },
    ],
    timestamp: Date.now(),
  });

  await complianceAuditService.updateGDPRStatus({
    cookieConsentImplemented: true,
    dataRetentionPolicyImplemented: true,
    dataExportFunctionalityAvailable: true,
    lastAssessment: new Date().toISOString(),
    issues: [
      {
        id: 'GDPR-003',
        title: 'Missing privacy policy link',
        description: 'Privacy policy link is not visible on mobile checkout',
        severity: 'medium',
      },
    ],
  });

  await bookingAuditService.recordIntegrityResult({
    totalBookingsChecked: 500,
    doubleBookings: 1,
    timeSlotConflicts: 2,
    resourceAllocationConflicts: 0,
    timestamp: Date.now(),
  });

  // Generate a comprehensive report
  const report = auditController.generateComprehensiveReport();

  // Save the report to disk
  const timestamp = Date.now();
  const reportPath = path.join(process.cwd(), 'reports/audit', `comprehensive_${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

async function runCategoryAudit(category: AuditCategory | string) {
  switch (category) {
    case AuditCategory.SECURITY:
      await securityAuditService.processVulnerabilityResults([
        {
          id: 'CVE-2023-5678',
          title: 'SQL Injection Vulnerability',
          description: 'SQL injection vulnerability in search endpoint',
          cvssScore: 8.2,
          severity: 'high',
          component: 'API',
        },
      ]);
      break;

    case AuditCategory.PERFORMANCE:
      await performanceAuditService.recordLoadTestResult({
        averageResponseTime: 750,
        p95ResponseTime: 1100,
        p99ResponseTime: 1600,
        failedRequests: 2,
        totalRequests: 1000,
        timestamp: Date.now(),
      });
      break;

    case AuditCategory.UX:
      await uxAuditService.recordAccessibilityResult({
        conformanceLevel: 'AA',
        issues: [
          {
            id: 'WCAG-1.4.3',
            title: 'Contrast Ratio',
            description: 'Text on hero section has insufficient contrast ratio',
            severity: 'medium',
            element: '.hero-text',
          },
        ],
        totalElements: 120,
        elementsWith: {
          ariaAttributes: 78,
          altText: 15,
          properLabels: 22,
        },
        timestamp: Date.now(),
      });
      break;

    case AuditCategory.COMPLIANCE:
      await complianceAuditService.auditDataRetention('monthly');
      break;

    case AuditCategory.BOOKING:
      await bookingAuditService.recordNotificationResult({
        totalNotifications: 100,
        deliveredSuccessfully: 98,
        failedNotifications: 2,
        deliveryTime: {
          average: 120, // ms
          p95: 350,
          max: 800,
        },
        timestamp: Date.now(),
      });
      break;

    default:
      throw new Error(`Unknown category: ${category}`);
  }

  // Generate a category-specific report
  const report = auditService.generateReport(category as AuditCategory);

  // Save the report to disk
  const timestamp = Date.now();
  const categoryDir = path.join(process.cwd(), 'reports/audit', category.toString());
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const reportPath = path.join(categoryDir, `${category}_${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}
