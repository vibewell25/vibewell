
    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { monitorResourceUsage, logger } = require('../src/lib/monitoring');

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); monitorResources() {
  try {
    // Monitor every minute
    setInterval(() => {
      monitorResourceUsage();
    }, 60000);

    // Initial monitoring
    monitorResourceUsage();
    
    logger.info('Resource monitoring started');
  } catch (error) {
    logger.error('Error in resource monitoring:', error);
    process.exit(1);
  }
}

monitorResources(); 