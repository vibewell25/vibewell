import { AlertingSystem, AlertConfig } from '../../types/monitoring';

export class AlertingSystemImpl implements AlertingSystem {
  async sendAlert(name: string, config: AlertConfig): Promise<void> {
    // TODO: Implement actual alerting logic (e.g., sending to monitoring service)
    console.log(`Alert: ${name}`, config);
