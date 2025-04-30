const { monitorResourceUsage, logger } = require('../src/lib/monitoring');

async function monitorResources() {
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