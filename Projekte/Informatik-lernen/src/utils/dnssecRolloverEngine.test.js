import { describe, it, expect } from 'vitest';
import { initZoneRollover, advanceRolloverStep } from './dnssecRolloverEngine';

describe('dnssecRolloverEngine', () => {
  it('initializes clean DNSSEC zone state', () => {
    const state = initZoneRollover('test.de', 'ZSK_PRE_PUBLISH');
    expect(state.zone).toBe('test.de');
    expect(state.currentPhase).toBe('INIT');
    expect(state.activeKeys.length).toBe(2);
    expect(state.isChainValid).toBe(true);
  });

  it('progresses through ZSK Pre-Publish rollover without chain breaks', () => {
    let state = initZoneRollover('test.de', 'ZSK_PRE_PUBLISH');

    // Step 1: Pre-publish
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('NEW_KEY_PUBLISHED');
    expect(state.activeKeys.length).toBe(3); // ksk, old zsk, new zsk
    expect(state.isChainValid).toBe(true);

    // Step 2: Switch Signatures
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('SIGNATURES_SWITCHED');
    const newZsk = state.activeKeys.find(k => k.id === 'zsk-next');
    expect(newZsk?.state).toBe('ACTIVE_SIGNING');
    expect(state.isChainValid).toBe(true);

    // Step 3: Retire Old Key
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('COMPLETED');
    expect(state.activeKeys.length).toBe(2);
    expect(state.activeKeys.some(k => k.id === 'zsk-current')).toBe(false);
  });

  it('progresses through KSK Double-DS rollover across parent registry', () => {
    let state = initZoneRollover('test.de', 'KSK_DOUBLE_DS');

    // Step 1: Publish new KSK
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('NEW_KEY_PUBLISHED');

    // Step 2: Parent DS updated
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('PARENT_DS_UPDATED');
    expect(state.isChainValid).toBe(true);

    // Step 3: Complete
    state = advanceRolloverStep(state);
    expect(state.currentPhase).toBe('COMPLETED');
    const finalKsk = state.activeKeys.find(k => k.type === 'KSK');
    expect(finalKsk?.id).toBe('ksk-next');
  });
});
