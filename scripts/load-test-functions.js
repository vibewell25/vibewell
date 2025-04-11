'use strict';

const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const redis = require('redis');

// Store test metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  responseTimeTotal: 0,
  startTime: null,
  endTime: null,
  operationCounts: {},
  errors: []
};

// Redis client for distributed testing
let redisClient = null;

// Check if Redis is available
function checkRedisStatus(userContext, events, done) {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = redis.createClient({ url: redisUrl });
    
    redisClient.on('error', (err) => {
      console.log(`Redis connection error: ${err.message}`);
      // Continue without Redis if connection fails
      redisClient = null;
      done();
    });
    
    redisClient.connect().then(() => {
      console.log('Redis connected successfully');
      // Initialize test metrics in Redis
      redisClient.set('loadtest:metrics', JSON.stringify({
        startTime: new Date().toISOString(),
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitedRequests: 0
      })).then(() => {
        console.log('Metrics initialized in Redis');
        done();
      });
    }).catch((err) => {
      console.log(`Redis connection failed: ${err.message}`);
      redisClient = null;
      done();
    });
  } catch (error) {
    console.log(`Redis setup error: ${error.message}`);
    redisClient = null;
    done();
  }
  
  // Set start time locally regardless of Redis connection
  metrics.startTime = new Date();
}

// Generate random user data
function generateRandomUser(userContext, events, done) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  userContext.vars.username = faker.internet.userName({ firstName, lastName });
  userContext.vars.email = faker.internet.email({ firstName, lastName });
  userContext.vars.password = faker.internet.password({ length: 12, memorable: true });
  userContext.vars.fullName = `${firstName} ${lastName}`;
  userContext.vars.address = faker.location.streetAddress();
  userContext.vars.city = faker.location.city();
  userContext.vars.state = faker.location.state();
  userContext.vars.zip = faker.location.zipCode();
  userContext.vars.country = faker.location.country();
  userContext.vars.phone = faker.phone.number();
  
  return done();
}

// Generate authentication token
function generateAuthToken(userContext, events, done) {
  // Generate a mockup auth token for testing
  const tokenPayload = {
    userId: crypto.randomBytes(8).toString('hex'),
    username: userContext.vars.username,
    email: userContext.vars.email
  };
  
  const tokenString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  userContext.vars.authToken = `MOCK_JWT_${tokenString}`;
  
  return done();
}

// Generate payment information
function generatePaymentInfo(userContext, events, done) {
  // Use test card numbers to avoid actual charges
  const testCards = [
    '4242424242424242', // Visa
    '5555555555554444', // Mastercard
    '378282246310005',  // American Express
    '6011111111111117'  // Discover
  ];
  
  userContext.vars.amount = faker.number.int({ min: 10, max: 1000 });
  userContext.vars.currency = faker.finance.currencyCode();
  userContext.vars.cardNumber = faker.helpers.arrayElement(testCards);
  userContext.vars.expMonth = faker.number.int({ min: 1, max: 12 }).toString();
  userContext.vars.expYear = (new Date().getFullYear() + faker.number.int({ min: 1, max: 5 })).toString();
  userContext.vars.cvc = faker.number.int({ min: 100, max: 999 }).toString();
  
  return done();
}

// Generate Web3 payment information
function generateWeb3PaymentInfo(userContext, events, done) {
  const cryptoCurrencies = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'];
  
  userContext.vars.cryptoAmount = (Math.random() * 1.5).toFixed(6);
  userContext.vars.cryptoCurrency = faker.helpers.arrayElement(cryptoCurrencies);
  userContext.vars.walletAddress = `0x${crypto.randomBytes(20).toString('hex')}`;
  userContext.vars.transactionHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  
  return done();
}

// Track operation counts for metrics
function trackOperationCount(requestParams, response, userContext, events, done) {
  metrics.totalRequests++;
  
  const operation = `${requestParams.method} ${requestParams.url}`;
  metrics.operationCounts[operation] = (metrics.operationCounts[operation] || 0) + 1;
  
  if (response.statusCode >= 200 && response.statusCode < 300) {
    metrics.successfulRequests++;
  } else {
    metrics.failedRequests++;
    
    if (response.statusCode === 429) {
      metrics.rateLimitedRequests++;
    }
    
    // Log errors with limited details
    metrics.errors.push({
      operation,
      statusCode: response.statusCode,
      timestamp: new Date().toISOString(),
      message: response.body ? JSON.stringify(response.body).substring(0, 100) : 'No response body'
    });
  }
  
  // Track response time
  if (response.timings && response.timings.phases.total) {
    metrics.responseTimeTotal += response.timings.phases.total;
  }
  
  // Update Redis metrics if available
  if (redisClient && redisClient.isReady) {
    try {
      redisClient.get('loadtest:metrics').then((data) => {
        const redisMetrics = JSON.parse(data);
        redisMetrics.totalRequests++;
        
        if (response.statusCode >= 200 && response.statusCode < 300) {
          redisMetrics.successfulRequests++;
        } else {
          redisMetrics.failedRequests++;
          
          if (response.statusCode === 429) {
            redisMetrics.rateLimitedRequests++;
          }
        }
        
        redisClient.set('loadtest:metrics', JSON.stringify(redisMetrics));
      });
    } catch (error) {
      console.log(`Redis update error: ${error.message}`);
    }
  }
  
  return done();
}

// Log rate limit status
function logRateLimitStatus(requestParams, response, userContext, events, done) {
  if (response.headers && response.headers['x-ratelimit-remaining']) {
    const remaining = parseInt(response.headers['x-ratelimit-remaining']);
    const limit = parseInt(response.headers['x-ratelimit-limit'] || '0');
    
    // Log when approaching rate limit
    if (remaining < limit * 0.2) {
      console.log(`⚠️ Rate limit warning: ${remaining}/${limit} remaining for ${requestParams.url}`);
    }
  }
  
  return done();
}

// Handle response errors
function handleResponseError(requestParams, response, userContext, events, done) {
  if (response.statusCode >= 400) {
    // Log the response for debugging
    events.emit('counter', `error.${response.statusCode}`, 1);
    
    // For severe errors, log more details
    if (response.statusCode >= 500) {
      console.error(`Server error ${response.statusCode} on ${requestParams.method} ${requestParams.url}`);
    }
  }
  
  return done();
}

// Print statistics at the end of the test
function printStats(userContext, events, done) {
  metrics.endTime = new Date();
  const durationSec = (metrics.endTime - metrics.startTime) / 1000;
  
  console.log('\n--------- LOAD TEST RESULTS ---------');
  console.log(`Duration: ${durationSec.toFixed(2)} seconds`);
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful Requests: ${metrics.successfulRequests} (${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%)`);
  console.log(`Failed Requests: ${metrics.failedRequests} (${(metrics.failedRequests / metrics.totalRequests * 100).toFixed(2)}%)`);
  console.log(`Rate Limited Requests: ${metrics.rateLimitedRequests}`);
  
  if (metrics.totalRequests > 0) {
    console.log(`Average Response Time: ${(metrics.responseTimeTotal / metrics.totalRequests).toFixed(2)} ms`);
  }
  
  console.log('\nOperation Counts:');
  Object.entries(metrics.operationCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([operation, count]) => {
      console.log(`  ${operation}: ${count}`);
    });
  
  if (metrics.errors.length > 0) {
    console.log('\nTop Errors:');
    metrics.errors
      .slice(0, 5)
      .forEach(error => {
        console.log(`  ${error.statusCode} on ${error.operation} at ${error.timestamp}: ${error.message}`);
      });
  }
  
  // Fetch and display Redis metrics if available
  if (redisClient && redisClient.isReady) {
    redisClient.get('loadtest:metrics').then((data) => {
      const redisMetrics = JSON.parse(data);
      redisMetrics.endTime = new Date().toISOString();
      
      console.log('\nDistributed Test Metrics (from Redis):');
      console.log(`Total Requests: ${redisMetrics.totalRequests}`);
      console.log(`Successful Requests: ${redisMetrics.successfulRequests} (${(redisMetrics.successfulRequests / redisMetrics.totalRequests * 100).toFixed(2)}%)`);
      console.log(`Failed Requests: ${redisMetrics.failedRequests} (${(redisMetrics.failedRequests / redisMetrics.totalRequests * 100).toFixed(2)}%)`);
      console.log(`Rate Limited Requests: ${redisMetrics.rateLimitedRequests}`);
      
      redisClient.disconnect().then(() => {
        done();
      });
    }).catch((err) => {
      console.log(`Redis metrics retrieval error: ${err.message}`);
      done();
    });
  } else {
    done();
  }
}

module.exports = {
  checkRedisStatus,
  generateRandomUser,
  generateAuthToken,
  generatePaymentInfo,
  generateWeb3PaymentInfo,
  trackOperationCount,
  logRateLimitStatus,
  handleResponseError,
  printStats
}; 