/**
 * Analytics Report Generator
 *
 * This script generates comprehensive analytics reports in HTML and PDF formats.
 * It can be run manually or scheduled to automatically generate reports.
 */

import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { fetchAnalyticsData } from '../lib/analytics';
import { generatePDF } from '../lib/pdf-generator';
import type { AnalyticsReportData, ReportOptions } from '../types/reports';

// Default report path
const REPORTS_DIR = path.join(process.cwd(), 'reports', 'analytics');

/**
 * Generate an analytics report
 *
 * @param options Report generation options
 * @returns Path to the generated report file(s)
 */
export async function generateAnalyticsReport(
  options: ReportOptions = {}
): Promise<{ htmlPath: string; pdfPath: string }> {
  try {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    // Default options
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      reportType = 'standard',
      includeRecommendations = true,
      includeDemographics = true,
      includeGeo = true,
    } = options;

    // Format dates for display and filenames
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    const generatedDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

    // Create filename
    const filename = `analytics_report_${formattedStartDate}_to_${formattedEndDate}_${generatedDate}`;
    const htmlPath = path.join(REPORTS_DIR, `${filename}.html`);
    const pdfPath = path.join(REPORTS_DIR, `${filename}.pdf`);

    // Fetch analytics data
    console.log(`Fetching analytics data from ${formattedStartDate} to ${formattedEndDate}...`);
    const analyticsData = await fetchAnalyticsData(startDate, endDate);

    // Process data for report
    const reportData = prepareReportData(analyticsData, options);

    // Read HTML template
    const templatePath = path.join(process.cwd(), 'reports', 'analytics', 'report-template.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Populate template with data
    const populatedTemplate = populateTemplate(template, reportData);

    // Write HTML report
    fs.writeFileSync(htmlPath, populatedTemplate);
    console.log(`HTML report generated: ${htmlPath}`);

    // Generate PDF report
    await generatePDF(htmlPath, pdfPath);
    console.log(`PDF report generated: ${pdfPath}`);

    return { htmlPath, pdfPath };
  } catch (error) {
    console.error('Failed to generate analytics report:', error);
    throw error;
  }
}

/**
 * Prepare analytics data for report
 */
function prepareReportData(data: any, options: ReportOptions): AnalyticsReportData {
  // Calculate trends
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Generate product rows for table
  const productRows = data.topProducts
    .map(
      (product: any) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.views.toLocaleString()}</td>
      <td>${product.tryOns.toLocaleString()}</td>
      <td>${product.conversionRate.toFixed(2)}%</td>
    </tr>
  `
    )
    .join('');

  // Generate recommendations based on data
  const recommendations = options.includeRecommendations ? generateRecommendations(data) : [];

  const recommendationsHtml = recommendations.map(rec => `<li>${rec}</li>`).join('');

  // Prepare chart data in the format expected by Chart.js
  const engagementData = {
    labels: data.timeLabels,
    datasets: [
      {
        label: 'Sessions',
        data: data.sessionsByDay,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Users',
        data: data.usersByDay,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
      },
      {
        label: 'Conversions',
        data: data.conversionsByDay,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
      },
    ],
  };

  // Demographics data
  const demographicsData = options.includeDemographics
    ? {
        labels: Object.keys(data.demographics),
        datasets: [
          {
            data: Object.values(data.demographics),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'],
          },
        ],
      }
    : null;

  // Geographic data
  const geoData = options.includeGeo
    ? {
        labels: data.topLocations.map((loc: any) => loc.name),
        datasets: [
          {
            label: 'Users',
            data: data.topLocations.map((loc: any) => loc.users),
            backgroundColor: '#4f46e5',
          },
        ],
      }
    : null;

  return {
    report_title: `Analytics Report: ${format(new Date(data.startDate), 'PPP')} to ${format(new Date(data.endDate), 'PPP')}`,
    generated_date: format(new Date(), 'PPP p'),
    time_period: `${format(new Date(data.startDate), 'PPP')} to ${format(new Date(data.endDate), 'PPP')}`,
    report_type: options.reportType || 'Standard',
    summary_text: `This report provides an analysis of user engagement and conversion metrics for the period from ${format(new Date(data.startDate), 'PPP')} to ${format(new Date(data.endDate), 'PPP')}. ${data.summaryText || ''}`,
    total_sessions: data.totalSessions.toLocaleString(),
    sessions_trend: calculateTrend(data.totalSessions, data.previousPeriod.totalSessions),
    unique_users: data.uniqueUsers.toLocaleString(),
    users_trend: calculateTrend(data.uniqueUsers, data.previousPeriod.uniqueUsers),
    conversion_rate: data.conversionRate.toFixed(2),
    conversion_trend: calculateTrend(data.conversionRate, data.previousPeriod.conversionRate),
    avg_duration: (data.averageDuration / 60).toFixed(2),
    duration_trend: calculateTrend(data.averageDuration, data.previousPeriod.averageDuration),
    product_rows: productRows,
    recommendations: recommendationsHtml,
    current_year: new Date().getFullYear(),
    engagement_data: JSON.stringify(engagementData),
    demographics_data: demographicsData ? JSON.stringify(demographicsData) : '{}',
    geo_data: geoData ? JSON.stringify(geoData) : '{}',
  };
}

/**
 * Generate recommendations based on analytics data
 */
function generateRecommendations(data: any): string[] {
  const recommendations: string[] = [];

  // Check for declining conversion rate
  if (data.conversionRate < data.previousPeriod.conversionRate) {
    recommendations.push(
      'Conversion rate has decreased compared to the previous period. Consider reviewing your product pages and checkout process for potential improvements.'
    );
  }

  // Check for popular but low-converting products
  const lowConvertingPopular = data.topProducts.find(
    (p: any) => p.views > 1000 && p.conversionRate < 2
  );

  if (lowConvertingPopular) {
    recommendations.push(
      `${lowConvertingPopular.name} has high views but low conversion. Consider improving product presentation or pricing strategy.`
    );
  }

  // Check for short session durations
  if (data.averageDuration < 120) {
    // Less than 2 minutes
    recommendations.push(
      'Average session duration is relatively short. Consider adding more engaging content or improving the user experience to keep users on the platform longer.'
    );
  }

  // Add general recommendations
  recommendations.push(
    'Regularly review your top products and optimize their listings to maintain and improve conversion rates.'
  );

  if (data.mobilePercentage > 60) {
    recommendations.push(
      'Most of your users access the platform via mobile devices. Ensure your mobile experience is fully optimized.'
    );
  }

  return recommendations;
}

/**
 * Populate HTML template with report data
 */
function populateTemplate(template: string, data: AnalyticsReportData): string {
  let result = template;

  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, value as string);
  });

  return result;
}

// If this script is run directly, generate a report with default options
if (require.main === module) {
  generateAnalyticsReport()
    .then(({ htmlPath, pdfPath }) => {
      console.log('Report generation complete!');
      console.log(`HTML report: ${htmlPath}`);
      console.log(`PDF report: ${pdfPath}`);
    })
    .catch(error => {
      console.error('Report generation failed:', error);
      process.exit(1);
    });
}

export default generateAnalyticsReport;
