#!/usr/bin/env node

/**
 * Redis Rate Limit Persistence Test
 * 
 * This script tests the persistence of rate limiting data in Redis
 * across Redis server restarts to ensure rate limits are maintained.
 * 
 * Usage: 
 *   node scripts/test-redis-persistence.js
 * 
 * Requirements:
 *   - Redis server running
 *   - ioredis package installed
 *   - Access to restart Redis service
 */

const Redis = require('ioredis');
const { spawn, exec } = require('child_process');
const readline = require('readline');

// Configuration
const config = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD || '',
  testKeys: 100,
  keyPrefix: 'vibewell:ratelimit:test:',
  restartCommand: process.env.REDIS_RESTART_CMD || 'sudo systemctl restart redis-server',
  isDocker: process.env.REDIS_DOCKER === 'true',
  dockerContainerName: process.env.REDIS_CONTAINER || 'redis',
};

// Create Redis client
const redis = new Redis(config.redisUrl, {
  password: config.redisPassword,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Create interactive interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility function to log with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Wait for a specified time
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ask for confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Test rate limit persistence
async function testPersistence() {
  try {
    log('Starting Redis rate limit persistence test...', colors.blue);
    log('This test will verify if rate limiting data persists across Redis restarts', colors.blue);
    
    // Connect to Redis
    log('Connecting to Redis server...', colors.cyan);
    await redis.ping();
    log('✅ Connected to Redis server', colors.green);
    
    // Clean up any previous test data
    log('Cleaning up previous test data...', colors.cyan);
    const testKeyPattern = `${config.keyPrefix}*`;
    const existingKeys = await redis.keys(testKeyPattern);
    if (existingKeys.length > 0) {
      await redis.del(...existingKeys);
      log(`✅ Cleaned up ${existingKeys.length} previous test keys`, colors.green);
    } else {
      log('✅ No previous test data found', colors.green);
    }
    
    // Create test rate limit data
    log('Creating test rate limit data...', colors.cyan);
    const creationPromises = [];
    const testData = {};
    
    for (let i = 1; i <= config.testKeys; i++) {
      const key = `${config.keyPrefix}${i}`;
      const value = i * 10; // Arbitrary value for testing
      testData[key] = value;
      creationPromises.push(redis.set(key, value, 'EX', 3600)); // 1 hour expiry
    }
    
    await Promise.all(creationPromises);
    log(`✅ Created ${config.testKeys} test rate limit entries`, colors.green);
    
    // Verify data was written
    log('Verifying test data...', colors.cyan);
    let mismatchCount = 0;
    
    for (const [key, expectedValue] of Object.entries(testData)) {
      const actualValue = await redis.get(key);
      if (parseInt(actualValue, 10) !== expectedValue) {
        log(`❌ Key ${key} has incorrect value: expected ${expectedValue}, got ${actualValue}`, colors.red);
        mismatchCount++;
      }
    }
    
    if (mismatchCount === 0) {
      log('✅ All test data verified successfully', colors.green);
    } else {
      log(`❌ ${mismatchCount} keys had incorrect values`, colors.red);
      return;
    }
    
    // Confirm restart
    const confirmed = await askConfirmation('Ready to restart Redis server to test persistence?');
    if (!confirmed) {
      log('Test cancelled by user', colors.yellow);
      return;
    }
    
    // Restart Redis server
    log('Restarting Redis server...', colors.magenta);
    
    if (config.isDocker) {
      // Docker restart
      await new Promise((resolve, reject) => {
        exec(`docker restart ${config.dockerContainerName}`, (error, stdout, stderr) => {
          if (error) {
            log(`❌ Error restarting Docker container: ${error.message}`, colors.red);
            reject(error);
            return;
          }
          log(`✅ Docker container ${config.dockerContainerName} restarted`, colors.green);
          resolve();
        });
      });
    } else {
      // System service restart
      await new Promise((resolve, reject) => {
        exec(config.restartCommand, (error, stdout, stderr) => {
          if (error) {
            log(`❌ Error restarting Redis: ${error.message}`, colors.red);
            reject(error);
            return;
          }
          log('✅ Redis restart command executed', colors.green);
          resolve();
        });
      });
    }
    
    // Wait for Redis to come back up
    log('Waiting for Redis server to restart...', colors.cyan);
    let isConnected = false;
    let attempts = 0;
    
    while (!isConnected && attempts < 30) {
      try {
        await wait(1000); // Wait 1 second between attempts
        await redis.ping();
        isConnected = true;
      } catch (error) {
        attempts++;
        process.stdout.write('.');
      }
    }
    
    console.log(''); // New line after dots
    
    if (!isConnected) {
      log('❌ Failed to reconnect to Redis after restart', colors.red);
      return;
    }
    
    log('✅ Successfully reconnected to Redis', colors.green);
    
    // Verify data persistence
    log('Verifying data persistence after restart...', colors.cyan);
    let persistenceMismatchCount = 0;
    let missingKeyCount = 0;
    
    for (const [key, expectedValue] of Object.entries(testData)) {
      const actualValue = await redis.get(key);
      
      if (actualValue === null) {
        log(`❌ Key ${key} is missing after restart`, colors.red);
        missingKeyCount++;
      } else if (parseInt(actualValue, 10) !== expectedValue) {
        log(`❌ Key ${key} has incorrect value after restart: expected ${expectedValue}, got ${actualValue}`, colors.red);
        persistenceMismatchCount++;
      }
    }
    
    if (missingKeyCount === 0 && persistenceMismatchCount === 0) {
      log('✅ All data persisted correctly after Redis restart', colors.green);
      log('🎉 Rate limit persistence test passed successfully! Your rate limiting will be maintained across restarts.', colors.green);
    } else {
      log(`❌ Persistence test failed: ${missingKeyCount} keys missing, ${persistenceMismatchCount} keys with incorrect values`, colors.red);
      log('⚠️ Your Redis configuration is not correctly set up for rate limit persistence!', colors.red);
      log('Make sure Redis is configured with persistence enabled (appendonly yes) in redis.conf', colors.yellow);
    }
    
    // Clean up test data
    log('Cleaning up test data...', colors.cyan);
    const keysToDelete = await redis.keys(testKeyPattern);
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
    log(`✅ Cleaned up ${keysToDelete.length} test keys`, colors.green);
    
  } catch (error) {
    log(`❌ Error during test: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    // Close connections
    redis.disconnect();
    rl.close();
  }
}

// Run the test
testPersistence(); 