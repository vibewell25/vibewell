class for simulating various network conditions in tests
 */
export class NetworkChaos {
  private failureRate: number;
  private latencyMs: number;
  private packetLossRate: number;

  constructor(failureRate: number = 0.2, latencyMs: number = 2000) {
    this.failureRate = failureRate;
    this.latencyMs = latencyMs;
    this.packetLossRate = 0;
setLatency(ms: number): void {
    this.latencyMs = ms;
setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(1, rate));
setPacketLoss(rate: number): void {
    this.packetLossRate = Math.max(0, Math.min(1, rate));
async simulateNetworkConditions<T>(operation: () => Promise<T>): Promise<T> {
    // Simulate packet loss
    if (Math.random() < this.packetLossRate) {
      throw new Error('Network packet lost');
// Simulate random failures
    if (Math.random() < this.failureRate) {
      throw new Error('Network error');
// Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * this.latencyMs));

    return operation();
async simulateSlowNetwork<T>(operation: () => Promise<T>): Promise<T> {
    const originalLatency = this.latencyMs;
    this.latencyMs = 5000; // Set high latency
    
    try {
      return await this.simulateNetworkConditions(operation);
finally {
      this.latencyMs = originalLatency;
async simulateUnstableNetwork<T>(operation: () => Promise<T>): Promise<T> {
    const originalFailureRate = this.failureRate;
    const originalPacketLoss = this.packetLossRate;
    
    this.failureRate = 0.3;
    this.packetLossRate = 0.2;
    
    try {
      return await this.simulateNetworkConditions(operation);
finally {
      this.failureRate = originalFailureRate;
      this.packetLossRate = originalPacketLoss;
