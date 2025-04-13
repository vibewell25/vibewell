import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface SecurityCheck {
  name: string;
  command: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SECURITY_CHECKS: SecurityCheck[] = [
  {
    name: 'npm audit',
    command: 'npm audit --json',
    severity: 'high',
  },
  {
    name: 'snyk test',
    command: 'snyk test --json',
    severity: 'high',
  },
  {
    name: 'eslint security',
    command: 'eslint --ext .js,.jsx,.ts,.tsx --config .eslintrc.js src/ --rule "security/detect-object-injection: 2" --format json',
    severity: 'medium',
  },
];

interface SecurityReport {
  timestamp: string;
  checks: {
    name: string;
    status: 'success' | 'failure';
    issues: any[];
    severity: string;
  }[];
}

async function runSecurityCheck(check: SecurityCheck): Promise<{
  status: 'success' | 'failure';
  issues: any[];
}> {
  try {
    const { stdout } = await execAsync(check.command);
    const result = JSON.parse(stdout);
    
    // Different tools have different output formats
    let issues: any[] = [];
    if (check.name === 'npm audit') {
      issues = result.advisories ? Object.values(result.advisories) : [];
    } else if (check.name === 'snyk test') {
      issues = result.vulnerabilities || [];
    } else if (check.name === 'eslint security') {
      issues = result[0]?.messages || [];
    }

    return {
      status: issues.length === 0 ? 'success' : 'failure',
      issues,
    };
  } catch (error) {
    console.error(`Error running ${check.name}:`, error);
    return {
      status: 'failure',
      issues: [{
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'error',
        severity: check.severity,
      }],
    };
  }
}

async function generateReport(results: SecurityReport) {
  const reportDir = path.join(process.cwd(), 'reports', 'security');
  const reportPath = path.join(reportDir, `security-report-${results.timestamp}.json`);

  try {
    await fs.mkdir(reportDir, { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
    console.log(`Security report generated: ${reportPath}`);

    // If there are any high or critical severity issues, exit with error
    const hasHighSeverityIssues = results.checks.some(check => 
      check.severity === 'high' && check.status === 'failure'
    );

    if (hasHighSeverityIssues) {
      console.error('High severity security issues found!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('Starting security checks...');

  const results: SecurityReport = {
    timestamp: new Date().toISOString(),
    checks: [],
  };

  for (const check of SECURITY_CHECKS) {
    console.log(`Running ${check.name}...`);
    const result = await runSecurityCheck(check);
    results.checks.push({
      name: check.name,
      status: result.status,
      issues: result.issues,
      severity: check.severity,
    });
  }

  await generateReport(results);
  console.log('Security checks completed.');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} 