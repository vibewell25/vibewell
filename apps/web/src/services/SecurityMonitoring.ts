import { Redis } from 'ioredis';

import { logger } from '@/lib/logger';

export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
export class SecurityMonitoringService {
  private redis: Redis;
  private readonly eventTTL = 30 * 24 * 60 * 60; // 30 days

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
/**
   * Log a security event
   */
  async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
try {
      // Store event in Redis
      const eventKey = `security:event:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      await this.redis.setex(eventKey, this.eventTTL, JSON.stringify(fullEvent));

      // Log to application logger
      logger.info('Security event', 'security', {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        details: event.details,
// Check if event requires immediate alert
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.triggerAlert(fullEvent);
// Update event counters
      await this.updateEventCounters(event);
catch (error) {
      logger.error('Failed to log security event', 'security', { error, event });
/**
   * Get recent security events
   */
  async getRecentEvents(
    limit: number = 100,
    severity?: SecurityEvent['severity'],
  ): Promise<SecurityEvent[]> {
    try {
      const keys = await this.redis.keys('security:event:*');
      const events: SecurityEvent[] = [];

      for (const key of keys.slice(-limit)) {
        const eventData = await this.redis.get(key);
        if (eventData) {
          const event = JSON.parse(eventData) as SecurityEvent;
          if (!severity || event.severity === severity) {
            events.push(event);
return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
catch (error) {
      logger.error('Failed to get recent events', 'security', { error });
      return [];
/**
   * Get event statistics
   */
  async getEventStats(timeWindow: number = 24 * 60 * 60): Promise<{
    totalEvents: number;
    bySeverity: Record<SecurityEvent['severity'], number>;
    byType: Record<string, number>;
> {
    const now = Date.now();

    try {
      const counters = await this.redis.hgetall(`security:counters:${this.getTimeKey()}`);

      return {
        totalEvents: parseInt(counters.total || '0'),
        bySeverity: {
          low: parseInt(counters.severity_low || '0'),
          medium: parseInt(counters.severity_medium || '0'),
          high: parseInt(counters.severity_high || '0'),
          critical: parseInt(counters.severity_critical || '0'),
byType: Object.entries(counters)

    .filter(([key]) => key.startsWith('type_'))
          .reduce(
            (acc, [key, value]) => ({
              ...acc,
              [key.replace('type_', '')]: parseInt(value),
),
            {},
          ),
catch (error) {
      logger.error('Failed to get event stats', 'security', { error });
      return {
        totalEvents: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        byType: {},
/**
   * Check for suspicious activity patterns
   */
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const recentEvents = await this.getRecentEvents(50);
      const userEvents = recentEvents.filter((e) => e.userId === userId);

      // Check for multiple failed login attempts
      const failedLogins = userEvents.filter((e) => e.type === 'login_failed').length;
      if (failedLogins >= 5) return true;

      // Check for multiple MFA failures
      const mfaFailures = userEvents.filter((e) => e.type === 'mfa_verification_failed').length;
      if (mfaFailures >= 3) return true;

      // Check for password reset attempts
      const passwordResets = userEvents.filter((e) => e.type === 'password_reset_requested').length;
      if (passwordResets >= 3) return true;

      return false;
catch (error) {
      logger.error('Failed to detect suspicious activity', 'security', { error, userId });
      return false;
private async triggerAlert(event: SecurityEvent): Promise<void> {

    // Log critical/high severity events
    logger.error('Security alert', 'security', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      details: event.details,
// Send alerts through various channels based on severity
    try {
      // For high and critical severity events, use multiple notification channels
      if (event.severity === 'high' || event.severity === 'critical') {
        await Promise.all([
          this.sendEmailAlert(event),
          this.sendSlackAlert(event),
          this.sendPagerDutyAlert(event),
        ]);
// For medium severity, use email and Slack only
      else if (event.severity === 'medium') {
        await Promise.all([this.sendEmailAlert(event), this.sendSlackAlert(event)]);
// For low severity, just use Slack
      else {
        await this.sendSlackAlert(event);
catch (error) {
      logger.error('Failed to send external alerts', 'security', { error, event });
private async sendEmailAlert(event: SecurityEvent): Promise<void> {
    const securityEmail = process.env['SECURITY_ALERT_EMAIL'];

    if (!securityEmail) {
      logger.warn('No security alert email configured', 'security');
      return;
try {
      // Import email service

      const { EmailService } = await import('@/lib/email');

      // Send security alert email
      await EmailService.send({
        to: securityEmail,
        subject: `🚨 VibeWell Security Alert (${event.severity.toUpperCase()}): ${event.type}`,
        html: this.formatEmailAlertHtml(event),
        text: this.formatEmailAlertText(event),
logger.info('Security alert email sent', 'security', {
        to: securityEmail,
        eventType: event.type,
catch (error) {
      logger.error('Failed to send security alert email', 'security', { error, event });
private formatEmailAlertHtml(event: SecurityEvent): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>

          <meta charset="utf-8">
          <title>VibeWell Security Alert</title>
          <style>



            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }


            .alert { padding: 15px; border-radius: 5px; margin-bottom: 20px; }


            .critical { background-color: #fde0e0; border-left: 5px solid #d9534f; }


            .high { background-color: #fef5e7; border-left: 5px solid #f0ad4e; }


            .medium { background-color: #fcf8e3; border-left: 5px solid #ffd700; }


            .low { background-color: #dff0d8; border-left: 5px solid #5cb85c; }


            .details { background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>VibeWell Security Alert</h1>
          <div class="alert ${event.severity}">
            <h2>${event.type}</h2>
            <p><strong>Severity:</strong> ${event.severity.toUpperCase()}</p>
            <p><strong>Time:</strong> ${event.timestamp.toISOString()}</p>
            ${event.userId ? `<p><strong>User ID:</strong> ${event.userId}</p>` : ''}
            ${event.ip ? `<p><strong>IP Address:</strong> ${event.ip}</p>` : ''}
            ${event.userAgent ? `<p><strong>User Agent:</strong> ${event.userAgent}</p>` : ''}
          </div>
          <h3>Details</h3>
          <div class="details">
            <pre>${JSON.stringify(event.details, null, 2)}</pre>
          </div>
          <p>Please investigate this security alert immediately.</p>
        </body>
      </html>
    `;
private formatEmailAlertText(event: SecurityEvent): string {
    return `
VibeWell Security Alert

Type: ${event.type}
Severity: ${event.severity.toUpperCase()}
Time: ${event.timestamp.toISOString()}
${event.userId ? `User ID: ${event.userId}` : ''}
${event.ip ? `IP Address: ${event.ip}` : ''}
${event.userAgent ? `User Agent: ${event.userAgent}` : ''}

Details:
${JSON.stringify(event.details, null, 2)}

Please investigate this security alert immediately.
    `;
private async sendSlackAlert(event: SecurityEvent): Promise<void> {
    const slackWebhookUrl = process.env['SLACK_SECURITY_WEBHOOK_URL'];

    if (!slackWebhookUrl) {
      logger.warn('No Slack webhook configured for security alerts', 'security');
      return;
try {
      // Create Slack message payload
      const payload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 Security Alert: ${event.type}`,
              emoji: true,
{
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:*\n${this.getSeverityEmoji(event.severity)} ${event.severity.toUpperCase()}`,
{
                type: 'mrkdwn',
                text: `*Time:*\n${event.timestamp.toISOString()}`,
],
{
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',

                text: `*User ID:*\n${event.userId || 'N/A'}`,
{
                type: 'mrkdwn',

                text: `*IP Address:*\n${event.ip || 'N/A'}`,
],
{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Details:*\n\`\`\`${JSON.stringify(event.details, null, 2)}\`\`\``,
{
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',

                text: `🔍 *Investigate this alert in the <${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/security|Security Dashboard>*`,
],
],
// Send to Slack
      await fetch(slackWebhookUrl, {
        method: 'POST',


        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
logger.info('Security alert sent to Slack', 'security', { eventType: event.type });
catch (error) {
      logger.error('Failed to send security alert to Slack', 'security', { error, event });
private getSeverityEmoji(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
private async sendPagerDutyAlert(event: SecurityEvent): Promise<void> {
    const pagerDutyRoutingKey = process.env['PAGERDUTY_ROUTING_KEY'];

    if (!pagerDutyRoutingKey) {
      logger.warn('No PagerDuty routing key configured', 'security');
      return;
try {
      // Create PagerDuty event payload
      const payload = {
        routing_key: pagerDutyRoutingKey,
        event_action: 'trigger',
        dedup_key: `security_${event.type}_${Date.now()}`,
        payload: {
          summary: `VibeWell Security Alert: ${event.type} (${event.severity.toUpperCase()})`,
          source: 'VibeWell Security Monitoring',
          severity: this.mapSeverityToPagerDuty(event.severity),
          timestamp: event.timestamp.toISOString(),

          component: 'security-service',
          group: 'security',
          class: event.type,
          custom_details: {

            userId: event.userId || 'N/A',

            ip: event.ip || 'N/A',

            userAgent: event.userAgent || 'N/A',
            details: event.details,
links: [
          {

            href: `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/security?alert=${event.type}`,
            text: 'View in Security Dashboard',
],
// Send to PagerDuty

      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',


        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
logger.info('Security alert sent to PagerDuty', 'security', { eventType: event.type });
catch (error) {
      logger.error('Failed to send security alert to PagerDuty', 'security', { error, event });
private mapSeverityToPagerDuty(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
private async updateEventCounters(event: SecurityEvent): Promise<void> {
    const timeKey = this.getTimeKey();
    const counterKey = `security:counters:${timeKey}`;

    try {
      await this.redis
        .multi()
        .hincrby(counterKey, 'total', 1)
        .hincrby(counterKey, `severity_${event.severity}`, 1)
        .hincrby(counterKey, `type_${event.type}`, 1)
        .expire(counterKey, this.eventTTL)
        .exec();
catch (error) {
      logger.error('Failed to update event counters', 'security', { error, event });
private getTimeKey(): string {
    const date = new Date();
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
