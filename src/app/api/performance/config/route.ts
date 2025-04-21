import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Default configuration in case file doesn't exist
const defaultConfig = {
  metrics: {
    responseTime: true,
    memoryUsage: true,
    cpuUsage: true,
    networkLatency: true,
  },
  alertThresholds: {
    responseTime: 1000,
    memoryUsage: 80,
    cpuUsage: 70,
    networkLatency: 200,
  },
  samplingRate: 1,
};

export async function GET() {
  try {
    // Path to configuration file
    const configPath = path.join(process.cwd(), 'config', 'performance-monitoring.json');

    // Check if configuration file exists
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configFile);

      return NextResponse.json(config.performance || defaultConfig);
    }

    // Return default configuration if file doesn't exist
    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error('Error fetching performance configuration:', error);

    // Return default configuration in case of error
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate the configuration
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid configuration format' }, { status: 400 });
    }

    // Path to configuration file
    const configPath = path.join(process.cwd(), 'config', 'performance-monitoring.json');
    const configDir = path.join(process.cwd(), 'config');

    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Current config (if exists)
    let currentConfig = { performance: defaultConfig };
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      currentConfig = JSON.parse(configFile);
    }

    // Update configuration
    currentConfig.performance = {
      ...currentConfig.performance,
      ...data,
    };

    // Save updated configuration
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));

    return NextResponse.json({
      success: true,
      config: currentConfig.performance,
    });
  } catch (error) {
    console.error('Error updating performance configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update performance configuration' },
      { status: 500 }
    );
  }
}
