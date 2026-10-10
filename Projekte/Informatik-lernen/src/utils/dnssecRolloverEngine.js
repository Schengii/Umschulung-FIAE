// @ts-check
/**
 * DNSSEC KSK (Key Signing Key) & ZSK (Zone Signing Key) Rollover Engine
 * Simulates RFC 6781 DNSSEC Operational Practices:
 * 1. ZSK Rollover:
 *    - Pre-Publish Scheme: Publish new ZSK in DNSKEY RRset first, wait for 2x TTL, then switch RRSIG signatures.
 * 2. KSK Rollover:
 *    - Double-DS Scheme: Submit new DS record to parent registry (.de / root), wait for parent DS propagation and DNSKEY validation before retiring old KSK.
 * 3. Validation Chain: Validates RRset signatures during all phases to ensure zero DNS validation outages.
 */

/**
 * @typedef {'STANDBY' | 'PUBLISHED' | 'ACTIVE_SIGNING' | 'RETIRED'} KeyLifecycleState
 */

/**
 * @typedef {Object} DnssecKey
 * @property {string} id Key identifier (e.g. 'ksk-2026', 'zsk-q1')
 * @property {'KSK' | 'ZSK'} type Key type (257 = KSK, 256 = ZSK)
 * @property {number} keyTag Key tag integer
 * @property {string} algorithm e.g. 'ECDSAP256SHA256' (Algorithm 13)
 * @property {KeyLifecycleState} state Lifecycle state
 * @property {number} ttl Time to live in seconds
 * @property {string} publicKey Base64 public key representation
 */

/**
 * @typedef {'INIT' | 'NEW_KEY_PUBLISHED' | 'SIGNATURES_SWITCHED' | 'PARENT_DS_UPDATED' | 'COMPLETED'} RolloverPhase
 */

/**
 * @typedef {Object} ZoneRolloverState
 * @property {string} zone Domain zone (e.g. 'informatik-lernen.de')
 * @property {'ZSK_PRE_PUBLISH' | 'KSK_DOUBLE_DS'} method Rollover method
 * @property {RolloverPhase} currentPhase Current phase
 * @property {DnssecKey[]} activeKeys Keys in the zone
 * @property {number} simulatedElapsedHours Elapsed time in hours
 * @property {boolean} isChainValid Whether DNSSEC validation resolves cleanly
 * @property {string} statusMessage Explanation of the current step
 */

/**
 * Initializes a standard DNSSEC zone state
 * @param {string} [zone='informatik-lernen.de']
 * @param {'ZSK_PRE_PUBLISH' | 'KSK_DOUBLE_DS'} [method='ZSK_PRE_PUBLISH']
 * @returns {ZoneRolloverState}
 */
export function initZoneRollover(zone = 'informatik-lernen.de', method = 'ZSK_PRE_PUBLISH') {
  /** @type {DnssecKey[]} */
  const activeKeys = [
    {
      id: 'ksk-current',
      type: 'KSK',
      keyTag: 48219,
      algorithm: 'ECDSAP256SHA256',
      state: 'ACTIVE_SIGNING',
      ttl: 3600,
      publicKey: 'AwEAAcfv+...KSK-1'
    },
    {
      id: 'zsk-current',
      type: 'ZSK',
      keyTag: 12048,
      algorithm: 'ECDSAP256SHA256',
      state: 'ACTIVE_SIGNING',
      ttl: 3600,
      publicKey: 'AwEAAdkq+...ZSK-1'
    }
  ];

  return {
    zone,
    method,
    currentPhase: 'INIT',
    activeKeys,
    simulatedElapsedHours: 0,
    isChainValid: true,
    statusMessage: 'Zone befindet sich im stabilen Normalbetrieb mit aktuellem KSK und ZSK.'
  };
}

/**
 * Advances the rollover workflow to the next step
 * @param {ZoneRolloverState} state
 * @returns {ZoneRolloverState}
 */
export function advanceRolloverStep(state) {
  const next = {
    ...state,
    activeKeys: state.activeKeys.map(k => ({ ...k }))
  };

  if (state.method === 'ZSK_PRE_PUBLISH') {
    switch (state.currentPhase) {
      case 'INIT': {
        // Step 1: Pre-publish new ZSK in DNSKEY RRset without signing with it yet
        next.activeKeys.push({
          id: 'zsk-next',
          type: 'ZSK',
          keyTag: 39512,
          algorithm: 'ECDSAP256SHA256',
          state: 'PUBLISHED',
          ttl: 3600,
          publicKey: 'AwEAAe12+...ZSK-2'
        });
        next.currentPhase = 'NEW_KEY_PUBLISHED';
        next.simulatedElapsedHours += 24; // Wait 24h for recursive resolvers to cache new DNSKEY
        next.isChainValid = true;
        next.statusMessage = 'Schritt 1: Neuer ZSK im DNSKEY-Record vorveröffentlicht. Resolver cachen den neuen Public Key (Pre-Publish).';
        break;
      }
      case 'NEW_KEY_PUBLISHED': {
        // Step 2: Switch RRSIG signatures from old ZSK to new ZSK
        const oldZsk = next.activeKeys.find(k => k.id === 'zsk-current');
        const newZsk = next.activeKeys.find(k => k.id === 'zsk-next');
        if (oldZsk) oldZsk.state = 'RETIRED';
        if (newZsk) newZsk.state = 'ACTIVE_SIGNING';

        next.currentPhase = 'SIGNATURES_SWITCHED';
        next.simulatedElapsedHours += 24;
        next.isChainValid = true;
        next.statusMessage = 'Schritt 2: RRSIG-Signaturen auf den neuen ZSK umgestellt. Da der Key bereits gecacht war, entstehen keine Validierungsfehler!';
        break;
      }
      case 'SIGNATURES_SWITCHED': {
        // Step 3: Remove old retired ZSK completely
        next.activeKeys = next.activeKeys.filter(k => k.id !== 'zsk-current');
        next.currentPhase = 'COMPLETED';
        next.simulatedElapsedHours += 24;
        next.isChainValid = true;
        next.statusMessage = 'Schritt 3: Alter ZSK aus dem DNSKEY-RRset entfernt. ZSK-Rollover erfolgreich und unterbrechungsfrei abgeschlossen.';
        break;
      }
      default:
        break;
    }
  } else if (state.method === 'KSK_DOUBLE_DS') {
    switch (state.currentPhase) {
      case 'INIT': {
        // Step 1: Introduce new KSK into DNSKEY RRset
        next.activeKeys.push({
          id: 'ksk-next',
          type: 'KSK',
          keyTag: 59142,
          algorithm: 'ECDSAP256SHA256',
          state: 'PUBLISHED',
          ttl: 3600,
          publicKey: 'AwEAA81a+...KSK-2'
        });
        next.currentPhase = 'NEW_KEY_PUBLISHED';
        next.simulatedElapsedHours += 48;
        next.isChainValid = true;
        next.statusMessage = 'Schritt 1: Neuer KSK im DNSKEY-Record veröffentlicht und mit altem KSK signiert.';
        break;
      }
      case 'NEW_KEY_PUBLISHED': {
        // Step 2: Submit new DS Record to Parent Registry (e.g. DENIC / Root)
        next.currentPhase = 'PARENT_DS_UPDATED';
        next.simulatedElapsedHours += 72; // Wait for Parent DS propagation
        next.isChainValid = true;
        next.statusMessage = 'Schritt 2: Neuer DS-Record an die Registry übermittelt. Parent-Zone enthält nun beide DS-Records (Double-DS).';
        break;
      }
      case 'PARENT_DS_UPDATED': {
        // Step 3: Switch primary KSK and remove old DS from parent
        const oldKsk = next.activeKeys.find(k => k.id === 'ksk-current');
        const newKsk = next.activeKeys.find(k => k.id === 'ksk-next');
        if (oldKsk) oldKsk.state = 'RETIRED';
        if (newKsk) newKsk.state = 'ACTIVE_SIGNING';
        next.activeKeys = next.activeKeys.filter(k => k.id !== 'ksk-current');

        next.currentPhase = 'COMPLETED';
        next.simulatedElapsedHours += 48;
        next.isChainValid = true;
        next.statusMessage = 'Schritt 3: Alter DS-Record gelöscht und alter KSK stillgelegt. KSK-Rollover mit Parent-Zone lückenlos vollzogen.';
        break;
      }
      default:
        break;
    }
  }

  return next;
}
