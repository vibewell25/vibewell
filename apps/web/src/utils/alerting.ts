import { performanceTestSuite } from './performance-testing';

interface AlertConfig {
  name: string;
  metric: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  cooldown: number; // minutes
  channels: AlertChannel[];
interface AlertChannel {
  type: 'email' | 'slack' | 'pagerduty';
  config: {
    webhook?: string;
    apiKey?: string;
    recipients?: string[];
interface Alert {
  id: string;
  config: AlertConfig;
  value: number;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
class AlertingSystem {
  private static instance: AlertingSystem;
  private alerts: Alert[] = [];
  private configs: AlertConfig[] = [];
  private lastAlerts: Map<string, number> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
    this.startMonitoring();
private initializeDefaultConfigs() {
    this.configs = [
      {
        name: 'High CPU Usage',
        metric: 'cpuUsage',
        threshold: 80,
        severity: 'warning',
        cooldown: 15,
        channels: [
          {
            type: 'slack',
            config: {
              webhook: process.env.SLACK_WEBHOOK_URL,
],
{
        name: 'Memory Leak Detection',
        metric: 'memoryUsage',
        threshold: 90,
        severity: 'critical',
        cooldown: 5,
        channels: [
          {
            type: 'pagerduty',
            config: {
              apiKey: process.env.PAGERDUTY_API_KEY,
],
{
        name: 'High Error Rate',
        metric: 'errorRate',
        threshold: 5,
        severity: 'critical',
        cooldown: 10,
        channels: [
          {
            type: 'email',
            config: {
              recipients: ['oncall@vibewell.com'],
{
            type: 'slack',
            config: {
              webhook: process.env.SLACK_WEBHOOK_URL,
],
];
public static getInstance(): AlertingSystem {
    if (!AlertingSystem.instance) {
      AlertingSystem.instance = new AlertingSystem();
return AlertingSystem.instance;
private startMonitoring() {
    setInterval(() => this.checkMetrics(), 60000); // Check every minute
private async checkMetrics() {
    const testResults = await performanceTestSuite.runAllTests();

    for (const config of this.configs) {
      const metric = testResults.find((r) => r.metrics[config.metric]);

      if (metric && metric.metrics[config.metric] > config.threshold) {
        const lastAlertTime = this.lastAlerts.get(config.name) || 0;

        const cooldownInMs = config.cooldown * 60 * 1000;

        if (Date.now() - lastAlertTime > cooldownInMs) {
          await this.createAlert(config, metric.metrics[config.metric]);
private async createAlert(config: AlertConfig, value: number) {
    const alert: Alert = {
      id: crypto.randomUUID(),
      config,
      value,
      timestamp: Date.now(),
      acknowledged: false,
this.alerts.push(alert);
    this.lastAlerts.set(config.name, Date.now());

    await this.sendAlerts(alert);
    this.pruneOldAlerts();
private async sendAlerts(alert: Alert) {
    for (const channel of alert.config.channels) {
      try {
        switch (channel.type) {
          case 'slack':
            await this.sendSlackAlert(alert, channel.config);
            break;
          case 'pagerduty':
            await this.sendPagerDutyAlert(alert, channel.config);
            break;
          case 'email':
            await this.sendEmailAlert(alert, channel.config);
            break;
catch (error) {
        console.error(`Failed to send ${channel.type} alert:`, error);
private async sendSlackAlert(alert: Alert, config: AlertChannel['config']) {
    if (!config.webhook) return;

    const color = this.getSeverityColor(alert.config.severity);
    const message = {
      attachments: [
        {
          color,
          title: `🚨 ${alert.config.name}`,
          text: `Metric ${alert.config.metric} exceeded threshold: ${alert.value} (threshold: ${alert.config.threshold})`,
          fields: [
            {
              title: 'Severity',
              value: alert.config.severity,
              short: true,
{
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true,
],
],
await fetch(config.webhook, {
      method: 'POST',


      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
private async sendPagerDutyAlert(alert: Alert, config: AlertChannel['config']) {
    if (!config.apiKey) return;

    const payload = {
      incident: {
        type: 'incident',
        title: alert.config.name,
        service: {
          id: 'VIBEWELL_APP',
          type: 'service_reference',
urgency: alert.config.severity === 'critical' ? 'high' : 'low',
        body: {
          type: 'incident_body',
          details: `Metric ${alert.config.metric} exceeded threshold: ${alert.value} (threshold: ${alert.config.threshold})`,
await fetch('https://api.pagerduty.com/incidents', {
      method: 'POST',
      headers: {


        'Content-Type': 'application/json',
        Authorization: `Token token=${config.apiKey}`,
body: JSON.stringify(payload),
private async sendEmailAlert(alert: Alert, config: AlertChannel['config']) {
    if (!config.recipients.length) return;

    // Implement email sending logic here
    // This could use AWS SES, SendGrid, or other email service
    console.log('Sending email alert to:', config.recipients);
private getSeverityColor(severity: AlertConfig['severity']): string {
    switch (severity) {
      case 'critical':
        return '#ff0000';
      case 'warning':
        return '#ffa500';
      case 'info':
        return '#0000ff';
      default:
        return '#808080';
private pruneOldAlerts() {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(
      (alert) => Date.now() - alert.timestamp < ONE_WEEK || !alert.acknowledged,
public acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = Date.now();
public getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.acknowledged);
public getAlertHistory(days: number = 7): Alert[] {

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.alerts.filter((alert) => alert.timestamp >= cutoff);
public addAlertConfig(config: AlertConfig): void {
    this.configs.push(config);
public removeAlertConfig(name: string): void {
    this.configs = this.configs.filter((config) => config.name !== name);
public updateAlertConfig(name: string, updates: Partial<AlertConfig>): void {
    const config = this.configs.find((c) => c.name === name);
    if (config) {
      Object.assign(config, updates);
public getAlertConfigs(): AlertConfig[] {
    return [...this.configs];
export {};
