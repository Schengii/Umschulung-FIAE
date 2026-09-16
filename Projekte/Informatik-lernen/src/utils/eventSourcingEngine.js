/**
 * Event-Sourcing & CQRS Read-Model Projection Engine
 * Simulates immutable Append-Only Event Logs, deterministic event replay projections,
 * and snapshotting for low-latency read-model materialization.
 */

export class EventSourcingProjectionEngine {
  constructor() {
    this.eventLog = [
      { id: 1, type: 'OrderCreated', timestamp: '10:00:01', payload: { orderId: 'ord-101', customer: 'Alice Dev' } },
      { id: 2, type: 'ItemAdded', timestamp: '10:00:15', payload: { orderId: 'ord-101', item: 'Cloud Server 16C/64G', price: 180.0 } },
      { id: 3, type: 'ItemAdded', timestamp: '10:01:02', payload: { orderId: 'ord-101', item: 'SSD Storage 2TB', price: 45.0 } },
      { id: 4, type: 'PaymentReceived', timestamp: '10:02:45', payload: { orderId: 'ord-101', provider: 'SEPA Direct Debit', amountPaid: 225.0 } },
      { id: 5, type: 'OrderShipped', timestamp: '10:05:00', payload: { orderId: 'ord-101', trackingCode: 'DHL-EXPRESS-9921' } }
    ];
  }

  projectState(upToEventId = 5) {
    const projection = {
      orderId: null,
      customer: null,
      items: [],
      totalPrice: 0.0,
      paymentStatus: 'UNPAID',
      fulfillmentStatus: 'PENDING',
      appliedEventsCount: 0
    };

    for (const evt of this.eventLog) {
      if (evt.id > upToEventId) break;

      projection.appliedEventsCount++;

      switch (evt.type) {
        case 'OrderCreated':
          projection.orderId = evt.payload.orderId;
          projection.customer = evt.payload.customer;
          break;
        case 'ItemAdded':
          projection.items.push(evt.payload.item);
          projection.totalPrice += evt.payload.price;
          break;
        case 'PaymentReceived':
          projection.paymentStatus = 'PAID';
          break;
        case 'OrderShipped':
          projection.fulfillmentStatus = `SHIPPED (${evt.payload.trackingCode})`;
          break;
      }
    }

    return projection;
  }
}
