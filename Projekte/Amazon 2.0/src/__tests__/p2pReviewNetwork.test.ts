import { describe, it, expect } from 'vitest';
import { getP2PReviews, voteP2PReview, generateP2PSignature } from '../utils/p2pReviewNetwork';

describe('Decentralized P2P Review Verification Network', () => {
  it('manages cryptographically signed reviews and peer consensus voting', () => {
    const reviews = getP2PReviews();
    expect(reviews.length).toBeGreaterThan(0);

    const first = reviews[0];
    const initialHelpful = first.peerVotesHelpful;

    voteP2PReview(first.id, true);
    expect(first.peerVotesHelpful).toBe(initialHelpful + 1);

    const sig = generateP2PSignature('Test Review Content', 'Dr. Max');
    expect(sig.hash).toContain('sha256:');
    expect(sig.sig).toContain('ed25519:');
    expect(sig.blockId).toContain('AMZ-BLOCK-');
  });
});
