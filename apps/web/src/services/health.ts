export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  services?: {
    [key: string]: 'ok' | 'degraded' | 'down';
  };
  message?: string;
}

/**
 * Fetches the health status of the API via absolute URL for node environment
 * @returns A promise that resolves to the health status
 */
export async function fetchHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await fetch('http://localhost/api/health');

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Failed to fetch health status');
  }
}
