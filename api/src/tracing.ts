// tracing.ts
import 'dotenv/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import cluster from "cluster";

if (cluster.isWorker && process.env.OTEL_ENABLED === 'true') {
  const exporter = new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'}/v1/traces`,
    // Timeout del exporter alineado con el del BSP
    timeoutMillis: 10000
  });

  // Mitigación BSP: batches pequeños, export frecuente
  // Razonamiento: menos tiempo de contención del event loop por export
  // El event loop se libera más rápido aunque exporte más veces
  const maxQueueSize = parseInt(process.env.OTEL_BSP_MAX_QUEUE_SIZE ?? "512");
  const maxExportBatchSize = parseInt(process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE ?? "128");
  const scheduledDelayMillis = parseInt(process.env.OTEL_BSP_SCHEDULE_DELAY ?? "1000");

  const spanProcessor = new BatchSpanProcessor(exporter, {
    maxQueueSize,
    maxExportBatchSize,
    scheduledDelayMillis,
    exportTimeoutMillis: 10000
  });


  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'ts-test',
    }),
    traceExporter: exporter,
    spanProcessors: [spanProcessor], // Instancia explícita del BSP con tuning
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
        "@opentelemetry/instrumentation-express": { enabled: false },
        "@opentelemetry/instrumentation-nestjs-core": { enabled: true },
        "@opentelemetry/instrumentation-net": { enabled: false },
        // Deshabilitar instrumentaciones de alto volumen y bajo valor
        "@opentelemetry/instrumentation-http": { enabled: true },
        "@opentelemetry/instrumentation-grpc": { enabled: false } // Sin gRPC en este servicio
      }),
    ],
  });

  sdk.start();
  console.log(`🔭 OpenTelemetry initialized in worker ${process.pid}`);
  console.log(`   BSP: queue=${maxQueueSize} batch=${maxExportBatchSize} delay=${scheduledDelayMillis}ms`);

  process.on('SIGTERM', async () => {
    await sdk.shutdown();
  });
}

export default {};
