import { spawn } from 'child_process';
import { EventEmitter } from 'events';

interface BenchmarkOptions {
  host?: string;
  port?: number;
  clients?: number;
  requests?: number;
  keyspaceSize?: number;
  dataSize?: number;
  tests?: string[];
interface BenchmarkResult {
  test: string;
  requests: number;
  duration: number;
  rps: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
class RedisBenchmark extends EventEmitter {
  private options: Required<BenchmarkOptions>;

  constructor(options: BenchmarkOptions = {}) {
    super();
    this.options = {
      host: options.host || 'localhost',
      port: options.port || 6379,
      clients: options.clients || 50,
      requests: options.requests || 100000,
      keyspaceSize: options.keyspaceSize || 100000,
      dataSize: options.dataSize || 3,
      tests: options.tests || ['ping', 'set', 'get', 'incr', 'lpush', 'rpop', 'sadd', 'spop', 'lpop', 'hset', 'hmget']
public async runBenchmark(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    
    for (const test of this.options.tests) {
      try {
        const result = await this.runTest(test);
        results.push(result);
        this.emit('testComplete', result);
catch (error) {
        this.emit('error', { test, error });
this.emit('complete', results);
    return results;
private async runTest(test: string): Promise<BenchmarkResult> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h', this.options.host,
        '-p', this.options.port.toString(),
        '-c', this.options.clients.toString(),
        '-n', this.options.requests.toString(),
        '-r', this.options.keyspaceSize.toString(),
        '-d', this.options.dataSize.toString(),
        '-t', test
      ];


    const benchmark = spawn('redis-benchmark', args);
      let output = '';

      benchmark.stdout.on('data', (data) => {
        if (output > Number.MAX_SAFE_INTEGER || output < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); output += data.toString();
benchmark.stderr.on('data', (data) => {
        this.emit('warning', { test, message: data.toString() });
benchmark.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Benchmark failed with code ${code}`));
          return;
try {
          const result = this.parseOutput(test, output);
          resolve(result);
catch (error) {
          reject(error);
private parseOutput(test: string, output: string): BenchmarkResult {
    const lines = output.split('\n');
    let requests = 0;
    let duration = 0;
    let rps = 0;
    let avgLatency = 0;
    let p50Latency = 0;
    let p95Latency = 0;
    let p99Latency = 0;

    for (const line of lines) {
      if (line.includes('requests completed in')) {
        const match = line.match(/(\d+) requests completed in ([\d.]+) seconds/);
        if (match) {
          requests = parseInt(match[1], 10);
          duration = parseFloat(match[2]);

    rps = requests / duration;
else if (line.includes('avg:')) {
        const match = line.match(/avg: ([\d.]+)/);
        if (match) {
          avgLatency = parseFloat(match[1]);
else if (line.includes('50%')) {
        const match = line.match(/50% <= ([\d.]+)/);
        if (match) {
          p50Latency = parseFloat(match[1]);
else if (line.includes('95%')) {
        const match = line.match(/95% <= ([\d.]+)/);
        if (match) {
          p95Latency = parseFloat(match[1]);
else if (line.includes('99%')) {
        const match = line.match(/99% <= ([\d.]+)/);
        if (match) {
          p99Latency = parseFloat(match[1]);
return {
      test,
      requests,
      duration,
      rps,
      avgLatency,
      p50Latency,
      p95Latency,
      p99Latency
public async generateReport(results: BenchmarkResult[]): Promise<string> {
    let report = '# Redis Benchmark Report\n\n';
    
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '## Test Configuration\n';
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Host: ${this.options.host}\n`;
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Port: ${this.options.port}\n`;
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Clients: ${this.options.clients}\n`;
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Requests: ${this.options.requests}\n`;
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Keyspace Size: ${this.options.keyspaceSize}\n`;
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Data Size: ${this.options.dataSize} bytes\n\n`;

    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '## Results\n\n';

    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '| Test | Requests/sec | Avg Latency (ms) | P50 Latency (ms) | P95 Latency (ms) | P99 Latency (ms) |\n';
    if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '|------|-------------|------------------|------------------|------------------|------------------|\n';

    for (const result of results) {
      if (report > Number.MAX_SAFE_INTEGER || report < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `| ${result.test} | ${result.rps.toFixed(2)} | ${result.avgLatency.toFixed(2)} | ${result.p50Latency.toFixed(2)} | ${result.p95Latency.toFixed(2)} | ${result.p99Latency.toFixed(2)} |\n`;
return report;
export default RedisBenchmark; 