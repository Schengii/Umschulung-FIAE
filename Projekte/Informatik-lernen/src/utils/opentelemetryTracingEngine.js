/**
 * OpenTelemetry Distributed Tracing & W3C TraceContext Engine
 * Generates W3C traceparent and baggage headers, calculates span parent-child relationships,
 * and formats waterfall timelines for distributed microservice requests.
 */

export class OpenTelemetryTracingSimulator {
  constructor() {
    this.traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    this.rootSpanId = '00f067aa0ba902b7';
    this.traceFlags = '01'; // Sampled
  }

  generateTraceparent(spanId = this.rootSpanId) {
    return `00-${this.traceId}-${spanId}-${this.traceFlags}`;
  }

  getWaterfallSpans() {
    return [
      {
        id: 'span-root',
        name: 'HTTP GET /api/v1/checkout',
        service: 'api-gateway',
        durationMs: 185,
        startOffsetMs: 0,
        status: 'OK',
        httpStatus: 200,
        spanId: '00f067aa0ba902b7',
        parentSpanId: null
      },
      {
        id: 'span-auth',
        name: 'validate_jwt_session',
        service: 'auth-service',
        durationMs: 32,
        startOffsetMs: 10,
        status: 'OK',
        spanId: '5a21b44c889912aa',
        parentSpanId: '00f067aa0ba902b7'
      },
      {
        id: 'span-order',
        name: 'process_order_checkout',
        service: 'order-service',
        durationMs: 135,
        startOffsetMs: 45,
        status: 'OK',
        spanId: '77f8899a11bb22cc',
        parentSpanId: '00f067aa0ba902b7'
      },
      {
        id: 'span-db',
        name: 'SELECT * FROM orders WHERE id = $1',
        service: 'postgres-db',
        durationMs: 68,
        startOffsetMs: 70,
        status: 'OK',
        spanId: '99aa887766554433',
        parentSpanId: '77f8899a11bb22cc'
      },
      {
        id: 'span-cache',
        name: 'GET cache:sku:inventory',
        service: 'redis-cache',
        durationMs: 12,
        startOffsetMs: 145,
        status: 'OK',
        spanId: '1122334455667788',
        parentSpanId: '77f8899a11bb22cc'
      }
    ];
  }
}
