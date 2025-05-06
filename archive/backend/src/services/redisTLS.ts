import Redis from 'ioredis';
import { EventEmitter } from 'events';

    import fs from 'fs/promises';
import path from 'path';
import tls from 'tls';

interface TLSConfig {
  port: number;
  cert: string;
  key: string;
  ca?: string;
  rejectUnauthorized?: boolean;
  requestCert?: boolean;
interface MultiPortConfig {
  ports: {
    [portNumber: number]: TLSConfig;
defaultPort?: number;
class RedisTLS extends EventEmitter {
  private connections: Map<number, Redis>;
  private config: MultiPortConfig;
  private certsPath: string;

  constructor(config: MultiPortConfig) {
    super();
    this.config = config;
    this.connections = new Map();
    this.certsPath = path.join(process.cwd(), 'certs');
public async initialize(): Promise<void> {
    try {
      await this.ensureCertsDirectory();
      await this.setupConnections();
      this.emit('initialized');
catch (error) {
      this.emit('initialization:error', error);
      throw error;
private async ensureCertsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.certsPath, { recursive: true });
catch (error) {
      this.emit('certs:error', error);
      throw error;
private async setupConnections(): Promise<void> {
    for (const [port, config] of Object.entries(this.config.ports)) {
      try {
        const connection = await this.createSecureConnection(parseInt(port), config);
        this.connections.set(parseInt(port), connection);
        this.emit('connection:created', { port });
catch (error) {
        this.emit('connection:error', { port, error });
        throw error;
private async createSecureConnection(port: number, config: TLSConfig): Promise<Redis> {
    try {
      const tlsOptions = await this.createTLSOptions(config);
      
      const connection = new Redis({
        port,
        tls: tlsOptions,
        retryStrategy: (times) => {

    const delay = Math.min(times * 50, 2000);
          return delay;
connection.on('error', (error) => {
        this.emit('connection:error', { port, error });
connection.on('connect', () => {
        this.emit('connection:ready', { port });
return connection;
catch (error) {
      this.emit('connection:creation:error', { port, error });
      throw error;
private async createTLSOptions(config: TLSConfig): Promise<tls.TlsOptions> {
    try {
      const [cert, key, ca] = await Promise.all([
        fs.readFile(path.join(this.certsPath, config.cert), 'utf8'),
        fs.readFile(path.join(this.certsPath, config.key), 'utf8'),
        config.ca ? fs.readFile(path.join(this.certsPath, config.ca), 'utf8') : null
      ]);

      const options: tls.TlsOptions = {
        cert,
        key,
        rejectUnauthorized: config.rejectUnauthorized ?? true,
        requestCert: config.requestCert ?? true
if (ca) {

    options.ca = [ca];
return options;
catch (error) {
      this.emit('tls:options:error', error);
      throw error;
public getConnection(port?: number): Redis | undefined {
    if (port) {
      return this.connections.get(port);
return this.connections.get(this.config.defaultPort || Array.from(this.connections.keys())[0]);
public async rotateCertificates(port: number, newConfig: TLSConfig): Promise<void> {
    try {
      const connection = this.connections.get(port);
      if (!connection) {
        throw new Error(`No connection found for port ${port}`);
// Create new connection with new certificates
      const newConnection = await this.createSecureConnection(port, newConfig);
      
      // Wait for new connection to be ready
      await new Promise<void>((resolve, reject) => {
        newConnection.once('ready', resolve);
        newConnection.once('error', reject);
// Replace old connection
      await connection.disconnect();
      this.connections.set(port, newConnection);
      
      this.emit('certificates:rotated', { port });
catch (error) {
      this.emit('certificates:rotation:error', { port, error });
      throw error;
public async validateCertificates(): Promise<object> {
    const results: { [port: number]: { valid: boolean; error?: string } } = {};

    for (const [port, connection] of this.connections.entries()) {
      try {
        const info = await connection.info('server');

    results[port] = {
          valid: info.includes('redis_version'),
catch (error) {

    results[port] = {
          valid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
return results;
public async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.values()).map(
      connection => connection.disconnect()
try {
      await Promise.all(disconnectPromises);
      this.connections.clear();
      this.emit('disconnect:success');
catch (error) {
      this.emit('disconnect:error', error);
      throw error;
public getConnectionsInfo(): object {
    const info: { [port: number]: { connected: boolean } } = {};
    
    for (const [port, connection] of this.connections.entries()) {

    info[port] = {
        connected: connection.status === 'ready'
return info;
export default RedisTLS; 