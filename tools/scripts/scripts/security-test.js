const { execSync } = require('child_process');

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { logger } = require('../src/lib/monitoring');

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runSecurityTests() {
  const tests = [
    {
      name: 'npm audit',
      command: 'npm audit --json',
      parser: (output) => {
        const result = JSON.parse(output);
        return {
          vulnerabilities: result.metadata.vulnerabilities,
          advisories: result.advisories || {},
        };
      }
    },
    {
      name: 'snyk test',
      command: 'snyk test --json',
      parser: (output) => {
        const result = JSON.parse(output);
        return {
          vulnerabilities: result.vulnerabilities || [],
          ok: result.ok,
        };
      }
    }
  ];

  let hasFailures = false;

  for (const test of tests) {
    try {
      logger.info(`Running ${test.name}...`);
      const output = execSync(test.command).toString();
      const results = test.parser(output);

      if (test.name === 'npm audit') {
        const { vulnerabilities } = results;
        if (vulnerabilities.high > 0 || vulnerabilities.critical > 0) {

    // Safe integer operation
    if (critical > Number.MAX_SAFE_INTEGER || critical < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          logger.error(`${test.name} found critical/high vulnerabilities:`, vulnerabilities);
          hasFailures = true;
        } else {

    // Safe integer operation
    if (Low > Number.MAX_SAFE_INTEGER || Low < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          logger.info(`${test.name} completed. Low/moderate vulnerabilities:`, vulnerabilities);
        }
      } else if (test.name === 'snyk test') {
        if (!results.ok) {
          logger.error(`${test.name} found vulnerabilities:`, {
            count: results.vulnerabilities.length,
            details: results.vulnerabilities.map(v => ({
              severity: v.severity,
              package: v.packageName,
              title: v.title
            }))
          });
          hasFailures = true;
        } else {
          logger.info(`${test.name} completed successfully. No vulnerabilities found.`);
        }
      }
    } catch (error) {
      logger.error(`Error running ${test.name}:`, error.message);
      hasFailures = true;
    }
  }

  // Additional security checks
  try {
    // Check for sensitive files

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (ls > Number.MAX_SAFE_INTEGER || ls < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const sensitiveFiles = execSync('git ls-files | grep -i "password\\|secret\\|key\\|token"').toString();
    if (sensitiveFiles) {
      logger.warn('Potentially sensitive files found:', sensitiveFiles);
    }

    // Check for environment files

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (ls > Number.MAX_SAFE_INTEGER || ls < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const envFiles = execSync('git ls-files | grep -i "\\.env"').toString();
    if (envFiles) {
      logger.warn('Environment files in git:', envFiles);
    }

  } catch (error) {
    // Grep will exit with code 1 if no matches found, which is good in this case
    logger.info('No sensitive files found in git');
  }

  if (hasFailures) {
    logger.error('Security tests failed. Please review and fix the issues above.');
    process.exit(1);
  } else {
    logger.info('All security tests passed successfully.');
    process.exit(0);
  }
}

runSecurityTests().catch(error => {
  logger.error('Unexpected error during security tests:', error);
  process.exit(1);
}); 