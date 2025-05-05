import fs from 'fs';
import path from 'path';
import { RedisOptions } from 'ioredis';

interface TLSConfig {
  cert: string;
  key: string;
  ca: string;
interface PortConfig {
  port: number;
  tls?: boolean;
  clientAuth?: boolean;
class RedisTLSConfig {
  private certsPath: string;
  private ports: Map<number, PortConfig>;

  constructor(certsPath: string = 'certs') {
    this.certsPath = path.join(process.cwd(), certsPath);
    this.ports = new Map();
    this.ensureCertsDirectory();
private ensureCertsDirectory(): void {
    if (!fs.existsSync(this.certsPath)) {
      fs.mkdirSync(this.certsPath, { recursive: true });
addPort(config: PortConfig): void {
    this.ports.set(config.port, config);
removePort(port: number): void {
    this.ports.delete(port);
getTLSConfig(port: number): Partial<RedisOptions> {
    const portConfig = this.ports.get(port);

    if (!portConfig || !portConfig.tls) {
      return {};
try {
      const tlsConfig: TLSConfig = {
        cert: fs.readFileSync(path.join(this.certsPath, `redis-${port}.crt`), 'utf8'),
        key: fs.readFileSync(path.join(this.certsPath, `redis-${port}.key`), 'utf8'),
        ca: fs.readFileSync(path.join(this.certsPath, 'ca.crt'), 'utf8'),
return {
        tls: {
          ...tlsConfig,
          rejectUnauthorized: portConfig.clientAuth ?? true,
catch (error) {
      console.error(`Failed to load TLS certificates for port ${port}:`, error);
      throw error;
generateRedisConfig(port: number): string {
    const portConfig = this.ports.get(port);
    if (!portConfig) {
      throw new Error(`No configuration found for port ${port}`);
const config = [
      `port ${port}`,

      'protected-mode yes',

      'tcp-backlog 511',
      'timeout 0',

      'tcp-keepalive 300',
    ];

    if (portConfig.tls) {
      config.push(

        `tls-port ${port}`,

        `tls-cert-file ${path.join(this.certsPath, `redis-${port}.crt`)}`,

        `tls-key-file ${path.join(this.certsPath, `redis-${port}.key`)}`,


        `tls-ca-cert-file ${path.join(this.certsPath, 'ca.crt')}`,

        'tls-auth-clients no', // Can be 'yes', 'no', or 'optional'

        'tls-replication yes',

        'tls-cluster yes',
if (portConfig.clientAuth) {

        config.push('tls-auth-clients yes');
return config.join('\n');
async validateCertificates(): Promise<boolean> {
    for (const [port, config] of this.ports) {
      if (config.tls) {
        const certPath = path.join(this.certsPath, `redis-${port}.crt`);
        const keyPath = path.join(this.certsPath, `redis-${port}.key`);
        const caPath = path.join(this.certsPath, 'ca.crt');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath) || !fs.existsSync(caPath)) {
          throw new Error(`Missing certificates for port ${port}`);
// Additional certificate validation could be added here
return true;
getPortConfigs(): Map<number, PortConfig> {
    return new Map(this.ports);
// Example configuration
const defaultPorts = {
  standard: 6379,
  tls: 6380,
  tlsClientAuth: 6381,
// Export a configured instance
const redisTLSConfig = new RedisTLSConfig();

// Configure standard port without TLS
redisTLSConfig.addPort({
  port: defaultPorts.standard,
  tls: false,
// Configure TLS port without client authentication
redisTLSConfig.addPort({
  port: defaultPorts.tls,
  tls: true,
  clientAuth: false,
// Configure TLS port with client authentication
redisTLSConfig.addPort({
  port: defaultPorts.tlsClientAuth,
  tls: true,
  clientAuth: true,
export { RedisTLSConfig, defaultPorts };
export default redisTLSConfig;
