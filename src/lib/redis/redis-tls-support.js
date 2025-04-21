// Redis TLS Support Implementation

import fs from 'fs';
import path from 'path';
import redis from 'redis';
import { promisify } from 'util';
import { spawn } from 'child_process';

// Helper function to create a Redis client with TLS support
function createRedisTLSClient(options = {}) {
  const tlsOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    tls:
      process.env.REDIS_TLS === 'true'
        ? {
            ca: process.env.REDIS_CA_CERT ? fs.readFileSync(process.env.REDIS_CA_CERT) : undefined,
            cert: process.env.REDIS_CERT ? fs.readFileSync(process.env.REDIS_CERT) : undefined,
            key: process.env.REDIS_KEY ? fs.readFileSync(process.env.REDIS_KEY) : undefined,
            rejectUnauthorized: process.env.REDIS_REJECT_UNAUTHORIZED !== 'false',
          }
        : undefined,
    ...options,
  };

  const client = redis.createClient(tlsOptions);

  // Add error handler
  client.on('error', err => {
    console.error('Redis Client Error:', err);
  });

  return client;
}

// Enhanced Redis benchmark with TLS support
async function runRedisBenchmarkWithTLS(options = {}) {
  const {
    host = process.env.REDIS_HOST || 'localhost',
    port = process.env.REDIS_PORT || 6379,
    password = process.env.REDIS_PASSWORD,
    clients = 50,
    requests = 100000,
    keyspacelen = 100000,
    datasize = 3,
    tls = process.env.REDIS_TLS === 'true',
    ca = process.env.REDIS_CA_CERT,
    cert = process.env.REDIS_CERT,
    key = process.env.REDIS_KEY,
  } = options;

  return new Promise((resolve, reject) => {
    const args = [
      '-h',
      host,
      '-p',
      port,
      '-c',
      clients.toString(),
      '-n',
      requests.toString(),
      '-r',
      keyspacelen.toString(),
      '-d',
      datasize.toString(),
    ];

    if (password) {
      args.push('-a', password);
    }

    if (tls) {
      args.push('--tls');

      if (ca) args.push('--cacert', ca);
      if (cert) args.push('--cert', cert);
      if (key) args.push('--key', key);
    }

    const benchmark = spawn('redis-benchmark', args);

    let output = '';
    let error = '';

    benchmark.stdout.on('data', data => {
      output += data.toString();
    });

    benchmark.stderr.on('data', data => {
      error += data.toString();
    });

    benchmark.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Redis benchmark failed with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
}

// Enhanced Redis CLI for slave and RDB support with TLS
function enhancedRedisCLI(options = {}) {
  const {
    host = process.env.REDIS_HOST || 'localhost',
    port = process.env.REDIS_PORT || 6379,
    password = process.env.REDIS_PASSWORD,
    tls = process.env.REDIS_TLS === 'true',
    ca = process.env.REDIS_CA_CERT,
    cert = process.env.REDIS_CERT,
    key = process.env.REDIS_KEY,
    slave = false,
    rdb = null,
  } = options;

  return new Promise((resolve, reject) => {
    const args = ['-h', host, '-p', port];

    if (password) {
      args.push('-a', password);
    }

    if (tls) {
      args.push('--tls');

      if (ca) args.push('--cacert', ca);
      if (cert) args.push('--cert', cert);
      if (key) args.push('--key', key);
    }

    if (slave) {
      args.push('--slave');
    }

    if (rdb) {
      args.push('--rdb', rdb);
    }

    const cli = spawn('redis-cli', args);

    let output = '';
    let error = '';

    cli.stdout.on('data', data => {
      output += data.toString();
    });

    cli.stderr.on('data', data => {
      error += data.toString();
    });

    cli.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Redis CLI failed with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
}

export { createRedisTLSClient, runRedisBenchmarkWithTLS, enhancedRedisCLI };
