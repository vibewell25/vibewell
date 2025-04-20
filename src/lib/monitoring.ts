import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'vibewell-app',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: {
      'api-key': process.env.OTEL_EXPORTER_OTLP_HEADERS_API_KEY,
    },
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new PrismaInstrumentation(),
  ],
});

export function initializeMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    sdk.start()
      .then(() => console.log('Monitoring initialized'))
      .catch((error) => console.error('Error initializing monitoring:', error));
  }
}

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Monitoring shut down'))
    .catch((error) => console.error('Error shutting down monitoring:', error))
    .finally(() => process.exit(0));
}); 