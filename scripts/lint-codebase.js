#!/usr/bin/env node

/**
 * Code Style Linter
 * 
 * This script performs a lint check on the entire codebase and generates a report
 * of code style violations. It can also be used to automatically fix some issues.
 * 
 * Usage:
 *   - Run lint check: node scripts/lint-codebase.js
 *   - Fix automatically fixable issues: node scripts/lint-codebase.js --fix
 *   - Generate a detailed report: node scripts/lint-codebase.js --report
 */

const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');

// Configure CLI options
program
  .option('-f, --fix', 'Automatically fix issues where possible')
  .option('-r, --report', 'Generate detailed HTML report')
  .option('-d, --dir <directory>', 'Directory to lint', 'src')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    const startTime = Date.now();
    console.log(chalk.blue('Starting code style analysis...'));
    
    // Initialize ESLint with project configuration
    const eslint = new ESLint({
      fix: options.fix,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    });
    
    // Get target directory
    const targetDir = path.resolve(process.cwd(), options.dir);
    console.log(chalk.blue(`Analyzing files in: ${targetDir}`));
    
    // Run ESLint on all files
    const results = await eslint.lintFiles([`${targetDir}/**/*.{js,jsx,ts,tsx}`]);
    
    // Fix files if requested
    if (options.fix) {
      await ESLint.outputFixes(results);
    }
    
    // Get ESLint formatter
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    
    // Calculate statistics
    const errorCount = results.reduce((acc, result) => acc + result.errorCount, 0);
    const warningCount = results.reduce((acc, result) => acc + result.warningCount, 0);
    const fixableErrorCount = results.reduce((acc, result) => acc + result.fixableErrorCount, 0);
    const fixableWarningCount = results.reduce((acc, result) => acc + result.fixableWarningCount, 0);
    
    // Output results
    if (resultText) {
      console.log(resultText);
    }
    
    // Summary
    console.log(chalk.blue('Code Style Analysis Summary:'));
    console.log(`Total files checked: ${chalk.bold(results.length)}`);
    console.log(`${chalk.red(`Errors: ${errorCount}`)} (${fixableErrorCount} fixable)`);
    console.log(`${chalk.yellow(`Warnings: ${warningCount}`)} (${fixableWarningCount} fixable)`);
    
    const cleanFiles = results.filter(r => r.errorCount === 0 && r.warningCount === 0).length;
    const cleanPercentage = (cleanFiles / results.length * 100).toFixed(2);
    console.log(`Clean files: ${chalk.green(`${cleanFiles} (${cleanPercentage}%)`)}`);
    
    // Generate report if requested
    if (options.report) {
      await generateReport(results);
    }
    
    // Performance report
    const endTime = Date.now();
    console.log(chalk.blue(`Analysis completed in ${((endTime - startTime) / 1000).toFixed(2)}s`));
    
    // Exit with error if there are non-fixable errors
    if (errorCount > fixableErrorCount) {
      console.log(chalk.red('Code style checks failed with non-fixable errors. Please fix them manually.'));
      process.exit(1);
    } else if (errorCount > 0) {
      console.log(chalk.yellow('Code style checks found fixable errors. Run with --fix to automatically fix them.'));
    } else {
      console.log(chalk.green('Code style checks passed!'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error running ESLint:'), error);
    process.exit(1);
  }
}

async function generateReport(results) {
  try {
    const htmlFormatter = await new ESLint().loadFormatter('html');
    const htmlReport = htmlFormatter.format(results);
    
    const reportDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, 'eslint-report.html');
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(chalk.green(`HTML report generated at: ${reportPath}`));
  } catch (error) {
    console.error(chalk.red('Error generating HTML report:'), error);
  }
}

main(); 