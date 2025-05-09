/**
 * Types for analytics reports
 */

/**
 * Options for report generation
 */
export interface ReportOptions {
  /**
   * Start date for the report period
   */
  startDate?: Date;

  /**
   * End date for the report period
   */
  endDate?: Date;

  /**
   * Type of report to generate
   */
  reportType?: 'standard' | 'executive' | 'detailed';

  /**
   * Whether to include recommendations in the report
   */
  includeRecommendations?: boolean;

  /**
   * Whether to include demographic data in the report
   */
  includeDemographics?: boolean;

  /**
   * Whether to include geographic data in the report
   */
  includeGeo?: boolean;
}

/**
 * Data used to populate the report template
 */
export interface AnalyticsReportData {
  /**
   * Report title
   */
  report_title: string;

  /**
   * Date when the report was generated
   */
  generated_date: string;

  /**
   * Time period covered by the report
   */
  time_period: string;

  /**
   * Type of report
   */
  report_type: string;

  /**
   * Summary text for the report
   */
  summary_text: string;

  /**
   * Total number of sessions
   */
  total_sessions: string;

  /**
   * Trend percentage for sessions compared to previous period
   */
  sessions_trend: number;

  /**
   * Number of unique users
   */
  unique_users: string;

  /**
   * Trend percentage for users compared to previous period
   */
  users_trend: number;

  /**
   * Conversion rate percentage
   */
  conversion_rate: string;

  /**
   * Trend percentage for conversion rate compared to previous period
   */
  conversion_trend: number;

  /**
   * Average session duration in minutes
   */
  avg_duration: string;

  /**
   * Trend percentage for duration compared to previous period
   */
  duration_trend: number;

  /**
   * HTML for product rows in the table
   */
  product_rows: string;

  /**
   * HTML for recommendations list
   */
  recommendations: string;

  /**
   * Current year for the copyright notice
   */
  current_year: number;

  /**
   * JSON string for engagement chart data
   */
  engagement_data: string;

  /**
   * JSON string for demographics chart data
   */
  demographics_data: string;

  /**
   * JSON string for geographic chart data
   */
  geo_data: string;
}

/**
 * Performance report data structure
 */
export interface PerformanceReportData {
  /**
   * Report title
   */
  report_title: string;

  /**
   * Date when the report was generated
   */
  generated_date: string;

  /**
   * Summary text for the report
   */
  summary_text: string;

  /**
   * System information
   */
  system_info: {
    /**
     * Operating system
     */
    os: string;

    /**
     * Node.js version
     */
    node_version: string;

    /**
     * Browser versions tested
     */
    browser_versions: string;
  }

  /**
   * Performance metrics summary
   */
  metrics_summary: {
    /**
     * Average response time in milliseconds
     */
    avg_response_time: number;

    /**
     * 95th percentile response time in milliseconds
     */
    p95_response_time: number;

    /**
     * Time to first byte in milliseconds
     */
    ttfb: number;

    /**
     * First contentful paint in milliseconds
     */
    fcp: number;

    /**
     * Largest contentful paint in milliseconds
     */
    lcp: number;

    /**
     * Time to interactive in milliseconds
     */
    tti: number;

    /**
     * Cumulative layout shift score
     */
    cls: number;

    /**
     * Total blocking time in milliseconds
     */
    tbt: number;
  }

  /**
   * Resources summary
   */
  resources_summary: {
    /**
     * Total JavaScript size in KB
     */
    js_size: number;

    /**
     * Total CSS size in KB
     */
    css_size: number;

    /**
     * Total image size in KB
     */
    img_size: number;

    /**
     * Total font size in KB
     */
    font_size: number;

    /**
     * Total document size in KB
     */
    doc_size: number;

    /**
     * Total number of requests
     */
    request_count: number;
  }

  /**
   * JSON string for performance chart data
   */
  performance_chart_data: string;

  /**
   * JSON string for resource chart data
   */
  resource_chart_data: string;

  /**
   * JSON string for browser comparison chart data
   */
  browser_chart_data: string;
}
