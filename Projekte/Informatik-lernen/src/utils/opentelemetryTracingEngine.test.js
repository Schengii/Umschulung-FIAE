import { describe, it, expect } from 'vitest';
import { OpenTelemetryTracingSimulator } from './opentelemetryTracingEngine';

describe('OpenTelemetry Tracing Engine', () => {
  it('generates standard W3C traceparent header strings', () => {
    const otel = new OpenTelemetryTracingSimulator();
    const header = otel.generateTraceparent();

    expect(header).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });

  it('returns valid distributed waterfall trace spans', () => {
    const otel = new OpenTelemetryTracingSimulator();
    const spans = otel.getWaterfallSpans();

    expect(spans.length).toBe(5);
    expect(spans[0].name).toContain('checkout');
    expect(spans[3].service).toBe('postgres-db');
  });
});
