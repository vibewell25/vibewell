import { NextRequest, NextResponse } from 'next/server';

import redisClient from '@/lib/redis-client';

import { securityMonitor } from './security-monitor';

interface WAFRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
const WAF_RULES: WAFRule[] = [
  {

    id: 'SQL-01',
    name: 'SQL Injection',
    pattern:
      /(\b(union|select|insert|update|delete|drop|alter)\b.*\b(from|into|table)\b)|(-{2,}|\/\*|\*\/)/i,
    severity: 'critical',
    description: 'Potential SQL injection attempt',
{

    id: 'XSS-01',

    name: 'Cross-Site Scripting',
    pattern: /(<script|javascript:|data:text\/html|vbscript:|onload=|onerror=)/i,
    severity: 'high',
    description: 'Potential XSS attack',
{

    id: 'PATH-01',
    name: 'Path Traversal',
    pattern: /(\.\.\/|\.\.\\|~\/|\.\.|\/etc\/passwd|\/etc\/shadow)/i,
    severity: 'high',
    description: 'Path traversal attempt',
{

    id: 'CMD-01',
    name: 'Command Injection',
    pattern: /(\b(exec|system|passthru|eval|shell_exec|phpinfo)\b|\$_GET|\$_POST|\$_REQUEST)/i,
    severity: 'critical',
    description: 'Command injection attempt',
{

    id: 'AUTH-01',
    name: 'Authentication Bypass',
    pattern: /(\b(admin|root|administrator)\b.*\b(\'|--| or |;))/i,
    severity: 'critical',
    description: 'Authentication bypass attempt',
];

interface BlockedIP {
  ip: string;
  reason: string;
  timestamp: number;
  expiresAt: number;
export class WAF {
  private static readonly BLOCK_DURATION = 24 * 60 * 60; // 24 hours in seconds
  private static readonly MAX_VIOLATIONS = 3;
  private static readonly VIOLATION_WINDOW = 60 * 60; // 1 hour in seconds

  static async processRequest(req: NextRequest): Promise<NextResponse | null> {


    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown';

    // Check if IP is blocked
    const isBlocked = await this.isIPBlocked(ip);
    if (isBlocked) {
      return new NextResponse('Access Denied', { status: 403 });
// Get request data to check
    const url = req.url;
    const method = req.method;
    const headers = Object.fromEntries(req.headers);
    let body = '';

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const clonedReq = req.clone();

        const contentType = headers['content-type'] || '';

        if (contentType.includes('application/json')) {
          const jsonBody = await clonedReq.json();
          body = JSON.stringify(jsonBody);
else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await clonedReq.formData();
          body = Array.from(formData.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
catch (error) {
        console.error('Error parsing request body:', error);
// Combine all request data for checking
    const dataToCheck = [url, body, ...Object.values(headers)].join(' ');

    // Check against WAF rules
    const violations = WAF_RULES.filter((rule) => rule.pattern.test(dataToCheck));

    if (violations.length > 0) {
      // Log violations
      for (const violation of violations) {
        await this.logViolation(ip, violation);
        await securityMonitor.logSecurityEvent({
          type: 'waf_violation',
          severity: violation.severity,
          message: `WAF Rule Violation: ${violation.name}`,
          metadata: {
            ip,
            ruleId: violation.id,
            description: violation.description,
            url,
timestamp: Date.now(),
// Check if we should block the IP
      const recentViolations = await this.getRecentViolations(ip);
      if (recentViolations >= this.MAX_VIOLATIONS) {
        await this.blockIP(
          ip,
          `Exceeded maximum WAF violations (${recentViolations} in last hour)`,
return new NextResponse('Access Denied', { status: 403 });
// Return 400 for less severe violations
      if (violations.every((v) => v.severity === 'low')) {
        return new NextResponse('Bad Request', { status: 400 });
// Return 403 for more severe violations
      return new NextResponse('Forbidden', { status: 403 });
return null;
private static async logViolation(ip: string, rule: WAFRule): Promise<void> {
    const key = `waf:violations:${ip}`;
    await redisClient.set(
      `${key}:${Date.now()}`,
      JSON.stringify({ ruleId: rule.id, timestamp: Date.now() }),
      'EX',
      this.VIOLATION_WINDOW,
private static async getRecentViolations(ip: string): Promise<number> {
    const keys = await redisClient.keys(`waf:violations:${ip}:*`);
    return keys.length;
private static async blockIP(ip: string, reason: string): Promise<void> {
    const blocked: BlockedIP = {
      ip,
      reason,
      timestamp: Date.now(),

      expiresAt: Date.now() + this.BLOCK_DURATION * 1000,
await redisClient.set(`waf:blocked:${ip}`, JSON.stringify(blocked), 'EX', this.BLOCK_DURATION);
private static async isIPBlocked(ip: string): Promise<boolean> {
    const blocked = await redisClient.get(`waf:blocked:${ip}`);
    if (!blocked) return false;

    const blockData: BlockedIP = JSON.parse(blocked);
    return Date.now() < blockData.expiresAt;
static async getBlockedIPs(): Promise<BlockedIP[]> {
    const keys = await redisClient.keys('waf:blocked:*');
    const blockedIPs: BlockedIP[] = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        blockedIPs.push(JSON.parse(data));
return blockedIPs;
export default WAF;
