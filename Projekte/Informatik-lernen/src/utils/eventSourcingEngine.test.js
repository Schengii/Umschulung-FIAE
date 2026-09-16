import { describe, it, expect } from 'vitest';
import { EventSourcingProjectionEngine } from './eventSourcingEngine';

describe('Event-Sourcing & CQRS Engine', () => {
  it('deterministically projects aggregate state through sequential event replay', () => {
    const engine = new EventSourcingProjectionEngine();

    // Replay up to event 3 (2 items added, not paid)
    const partialState = engine.projectState(3);
    expect(partialState.items.length).toBe(2);
    expect(partialState.totalPrice).toBe(225.0);
    expect(partialState.paymentStatus).toBe('UNPAID');

    // Replay all 5 events
    const fullState = engine.projectState(5);
    expect(fullState.paymentStatus).toBe('PAID');
    expect(fullState.fulfillmentStatus).toContain('SHIPPED');
    expect(fullState.appliedEventsCount).toBe(5);
  });
});
