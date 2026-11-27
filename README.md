# Analytics & Telemetry Collector
Streaming ingestion pipeline aggregating clickstream metrics, trace spans, and SLA latency histograms.

## Runtime Settings
- Service Port: 9095
- Storage Backend: clickhouse://telemetry.internal:8123
- Batch Window: 10s
- Health Probe: /healthz/telemetry
