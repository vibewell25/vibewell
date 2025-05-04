import { exec } from 'child_process';
import { promisify } from 'util';

import { logger } from '@/lib/logger';
import { SecurityMonitoringService } from './securityMonitoring';

const execAsync = promisify(exec);

interface SecurityScanResult {
  tool: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: Array<{
    type: string;
    description: string;
    location?: string;
    severity: string;
    cwe?: string;
    fix?: string;
  }>;
  timestamp: Date;
}

interface DependencyAudit {
  package: string;
  version: string;
  vulnerabilities: Array<{
    id: string;
    severity: string;
    description: string;
    fixedIn?: string;
  }>;
}

export class DevSecOpsService {
  private securityMonitoring: SecurityMonitoringService;

  constructor() {
    this.securityMonitoring = new SecurityMonitoringService();
  }

  /**
   * Run security scan using multiple tools
   */
  async runSecurityScan(): Promise<SecurityScanResult[]> {
    const results: SecurityScanResult[] = [];

    try {
      // Run npm audit
      const npmAudit = await this.runNpmAudit();
      if (npmAudit) results.push(npmAudit);

      // Run SonarQube scan
      const sonarScan = await this.runSonarQubeScan();
      if (sonarScan) results.push(sonarScan);

      // Run OWASP ZAP scan
      const zapScan = await this.runZAPScan();
      if (zapScan) results.push(zapScan);

      // Log scan results
      await this.logScanResults(results);

      return results;
    } catch (error) {
      logger.error('Security scan failed', 'devsecops', { error });
      throw error;
    }
  }

  /**
   * Run npm audit for dependency vulnerabilities
   */
  private async runNpmAudit(): Promise<SecurityScanResult | null> {
    try {
      const { stdout } = await execAsync('npm audit --json');
      const auditData = JSON.parse(stdout);

      const findings = Object.values(auditData.advisories).map((adv: any) => ({
        type: 'dependency_vulnerability',
        description: adv.overview,
        severity: adv.severity,
        cwe: adv.cwe,
        fix: adv.recommendation,
      }));

      return {
        tool: 'npm_audit',
        severity: this.calculateOverallSeverity(findings),
        findings,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('npm audit failed', 'devsecops', { error });
      return null;
    }
  }

  /**
   * Run SonarQube scan
   */
  private async runSonarQubeScan(): Promise<SecurityScanResult | null> {
    try {
      // Execute SonarQube scanner

      await execAsync('sonar-scanner');

      // Get results from SonarQube API
      const sonarUrl = process.env.SONAR_URL;
      const projectKey = process.env.SONAR_PROJECT_KEY;

      if (!sonarUrl || !projectKey) {
        throw new Error('SonarQube configuration missing');
      }

      const response = await fetch(

        `${sonarUrl}/api/issues/search?projectKeys=${projectKey}&types=VULNERABILITY`,
      );
      const data = await response.json();

      const findings = data.issues.map((issue: any) => ({
        type: 'code_vulnerability',
        description: issue.message,
        location: `${issue.component}:${issue.line}`,
        severity: issue.severity.toLowerCase(),
        fix: issue.debt,
      }));

      return {
        tool: 'sonarqube',
        severity: this.calculateOverallSeverity(findings),
        findings,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('SonarQube scan failed', 'devsecops', { error });
      return null;
    }
  }

  /**
   * Run OWASP ZAP scan
   */
  private async runZAPScan(): Promise<SecurityScanResult | null> {
    try {
      const zapUrl = process.env.ZAP_API_URL;
      const targetUrl = process.env.APP_URL;

      if (!zapUrl || !targetUrl) {
        throw new Error('ZAP configuration missing');
      }

      // Start spider scan


      await fetch(`${zapUrl}/JSON/spider/action/scan/?url=${targetUrl}`);

      // Wait for spider to complete
      await this.waitForZAPSpider(zapUrl);

      // Start active scan


      await fetch(`${zapUrl}/JSON/ascan/action/scan/?url=${targetUrl}`);

      // Wait for scan to complete
      await this.waitForZAPScan(zapUrl);

      // Get results


      const response = await fetch(`${zapUrl}/JSON/core/view/alerts/`);
      const data = await response.json();

      const findings = data.alerts.map((alert: any) => ({
        type: 'web_vulnerability',
        description: alert.description,
        location: alert.url,
        severity: alert.risk.toLowerCase(),
        cwe: alert.cweid,
        fix: alert.solution,
      }));

      return {
        tool: 'owasp_zap',
        severity: this.calculateOverallSeverity(findings),
        findings,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('ZAP scan failed', 'devsecops', { error });
      return null;
    }
  }

  /**
   * Wait for ZAP spider to complete
   */
  private async waitForZAPSpider(zapUrl: string): Promise<void> {
    while (true) {


      const response = await fetch(`${zapUrl}/JSON/spider/view/status/`);
      const data = await response.json();
      if (data.status === '100') break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  /**
   * Wait for ZAP scan to complete
   */
  private async waitForZAPScan(zapUrl: string): Promise<void> {
    while (true) {


      const response = await fetch(`${zapUrl}/JSON/ascan/view/status/`);
      const data = await response.json();
      if (data.status === '100') break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  /**
   * Calculate overall severity from findings
   */
  private calculateOverallSeverity(
    findings: Array<{ severity: string }>,
  ): SecurityScanResult['severity'] {
    if (findings.some((f) => f.severity === 'critical')) return 'critical';
    if (findings.some((f) => f.severity === 'high')) return 'high';
    if (findings.some((f) => f.severity === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Log scan results to security monitoring
   */
  private async logScanResults(results: SecurityScanResult[]): Promise<void> {
    for (const result of results) {
      const criticalFindings = result.findings.filter(
        (f) => f.severity === 'critical' || f.severity === 'high',
      );

      if (criticalFindings.length > 0) {
        await this.securityMonitoring.logEvent({
          type: 'security_scan',
          severity: result.severity,
          details: {
            tool: result.tool,
            findings: criticalFindings,
            totalFindings: result.findings.length,
          },
        });
      }
    }
  }

  /**
   * Check if deployment should be blocked
   */
  async shouldBlockDeployment(results: SecurityScanResult[]): Promise<{
    blocked: boolean;
    reason?: string;
  }> {
    const criticalIssues = results.some(
      (r) => r.severity === 'critical' || (r.severity === 'high' && r.findings.length > 5),
    );

    if (criticalIssues) {
      return {
        blocked: true,
        reason: 'Critical security issues detected',
      };
    }

    return { blocked: false };
  }
}
