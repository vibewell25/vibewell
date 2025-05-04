
import { NextApiRequest, NextApiResponse } from '@/types/api';

import auditController from '../../../controllers/audit-controller';

import auditService, { AuditCategory, AuditSeverity } from '../../../services/audit-service';

/**

 * API request handler for audit-related operations
 */
export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    // Get the authenticated user - would typically be obtained from request
    // This is just a placeholder
    const user = { id: 'admin', role: 'admin' };

    // Check if user has proper permissions
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res);
      case 'POST':
        return handlePostRequest(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Audit API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle GET requests for retrieving audit reports
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { reportId, category, comprehensive } = req.query;

  // Get a specific report by ID
  if (reportId && typeof reportId === 'string') {
    const report = auditController.getReport(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json(report);
  }

  // Get all reports for a specific category
  if (category && typeof category === 'string') {
    // Validate the category
    const validCategories = Object.values(AuditCategory);
    if (!validCategories.includes(category as AuditCategory)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories,
      });
    }

    const report = auditService.generateReport(category as AuditCategory);
    return res.status(200).json(report);
  }

  // Get comprehensive report
  if (comprehensive === 'true') {
    const report = auditController.generateComprehensiveReport();
    return res.status(200).json(report);
  }

  // Default: get all reports
  const reports = auditController.getAllReports();
  return res.status(200).json(reports);
}

/**
 * Handle POST requests for running audits and reporting issues
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { action, category, data } = req.body;

  // Validate the action
  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid action' });
  }

  // Handle different actions
  switch (action) {
    case 'run_comprehensive_audit':
      return runComprehensiveAudit(res);

    case 'run_category_audit':
      return runCategoryAudit(category, res);

    case 'report_issue':
      return reportIssue(data, res);

    case 'update_issue':
      return updateIssue(data, res);

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

/**
 * Run a comprehensive audit across all categories
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runComprehensiveAudit(res: NextApiResponse) {
  try {
    // This will run all audits and generate a comprehensive report
    const startTime = Date.now();
    const report = await auditController.runComprehensiveAudit();
    const duration = Date.now() - startTime;

    return res.status(200).json({
      status: 'success',
      message: 'Comprehensive audit completed',
      executionTime: duration,
      report,
    });
  } catch (error) {
    console.error('Error running comprehensive audit:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to run comprehensive audit',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Run an audit for a specific category
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runCategoryAudit(category: string, res: NextApiResponse) {
  // Validate the category
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid category' });
  }

  // Validate that the category is valid
  const validCategories = Object.values(AuditCategory);
  if (!validCategories.includes(category as AuditCategory)) {
    return res.status(400).json({
      error: 'Invalid category',
      validCategories,
    });
  }

  try {
    // Run the appropriate audit based on category
    const startTime = Date.now();

    switch (category as AuditCategory) {
      case AuditCategory.SECURITY:
        await auditController.runSecurityAudit();
        break;
      case AuditCategory.PERFORMANCE:
        await auditController.runPerformanceAudit();
        break;
      case AuditCategory.UX:
        await auditController.runUXAudit();
        break;
      case AuditCategory.COMPLIANCE:
        await auditController.runComplianceAudit();
        break;
      case AuditCategory.BOOKING:
        await auditController.runBookingAudit();
        break;
      default:
        // For other categories, we might not have a specialized audit
        return res.status(400).json({
          error: 'Category audit not implemented',
          category,
        });
    }

    const duration = Date.now() - startTime;
    const report = auditService.generateReport(category as AuditCategory);

    return res.status(200).json({
      status: 'success',
      message: `${category} audit completed`,
      executionTime: duration,
      report,
    });
  } catch (error) {
    console.error(`Error running ${category} audit:`, error);
    return res.status(500).json({
      status: 'error',
      message: `Failed to run ${category} audit`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Report a new audit issue
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); reportIssue(data: any, res: NextApiResponse) {
  // Validate required fields
  if (!data || !data.category || !data.severity || !data.title || !data.description) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['category', 'severity', 'title', 'description'],
    });
  }

  // Validate category and severity
  if (!Object.values(AuditCategory).includes(data.category)) {
    return res.status(400).json({
      error: 'Invalid category',
      validCategories: Object.values(AuditCategory),
    });
  }

  if (!Object.values(AuditSeverity).includes(data.severity)) {
    return res.status(400).json({
      error: 'Invalid severity',
      validSeverities: Object.values(AuditSeverity),
    });
  }

  try {
    // Report the issue
    const issue = await auditService.reportIssue(
      data.category as AuditCategory,
      data.severity as AuditSeverity,
      data.title,
      data.description,
      {
        component: data.component,
        remediation: data.remediation,
        metadata: data.metadata,
      },
    );

    return res.status(201).json({
      status: 'success',
      message: 'Issue reported successfully',
      issue,
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to report issue',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update an existing audit issue
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateIssue(data: any, res: NextApiResponse) {
  // Validate required fields
  if (!data || !data.id || !data.status) {
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['id', 'status'],
    });
  }

  // Validate status
  const validStatuses = ['open', 'in_progress', 'resolved', 'wontfix'];
  if (!validStatuses.includes(data.status)) {
    return res.status(400).json({
      error: 'Invalid status',
      validStatuses,
    });
  }

  try {
    // Update the issue
    const success = auditService.updateIssueStatus(
      data.id,
      data.status as 'open' | 'in_progress' | 'resolved' | 'wontfix',
      data.remediation,
    );

    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Issue updated successfully',
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update issue',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
