// ============================================================
// Amazon 2.0 – Decentralized P2P Review Verification Engine
// ============================================================

export interface SignedReviewNode {
  id: string;
  authorName: string;
  productTitle: string;
  rating: number;
  content: string;
  hashSha256: string;
  cryptographicSignature: string;
  verifiedOrderBlockId: string;
  peerVotesHelpful: number;
  peerVotesSuspicious: number;
  consensusScorePercent: number;
  isImmutableLocked: boolean;
  timestamp: number;
}

const DEFAULT_NODES: SignedReviewNode[] = [
  {
    id: 'p2p-rev-1',
    authorName: 'Dr. Michael S.',
    productTitle: 'Sony WH-1000XM5 Noise Cancelling Kopfhörer',
    rating: 5,
    content: 'Brillante Geräuschunterdrückung im ICE und Flugzeug. Akku hält gefühlt ewig.',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    cryptographicSignature: 'ed25519:7f8a9...b12c4',
    verifiedOrderBlockId: 'AMZ-BLOCK-#89421',
    peerVotesHelpful: 142,
    peerVotesSuspicious: 2,
    consensusScorePercent: 98.6,
    isImmutableLocked: true,
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: 'p2p-rev-2',
    authorName: 'Laura B.',
    productTitle: 'Apple AirPods Pro (2. Generation)',
    rating: 5,
    content: 'Transparenzmodus ist unübertroffen. Nahtloser Wechsel zwischen iPhone und Mac.',
    hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    cryptographicSignature: 'ed25519:3a1e9...c90d8',
    verifiedOrderBlockId: 'AMZ-BLOCK-#89456',
    peerVotesHelpful: 89,
    peerVotesSuspicious: 1,
    consensusScorePercent: 98.9,
    isImmutableLocked: true,
    timestamp: Date.now() - 86400000 * 2,
  },
];

let p2pReviewNodes: SignedReviewNode[] = [...DEFAULT_NODES];

export function getP2PReviews(): SignedReviewNode[] {
  return p2pReviewNodes;
}

export function voteP2PReview(reviewId: string, isHelpful: boolean): SignedReviewNode | undefined {
  const node = p2pReviewNodes.find(n => n.id === reviewId);
  if (node) {
    if (isHelpful) node.peerVotesHelpful++;
    else node.peerVotesSuspicious++;

    const total = node.peerVotesHelpful + node.peerVotesSuspicious;
    node.consensusScorePercent = +((node.peerVotesHelpful / Math.max(1, total)) * 100).toFixed(1);
  }
  return node;
}

export function generateP2PSignature(content: string, author: string): { hash: string; sig: string; blockId: string } {
  const pseudoHash = Array.from(content + author)
    .reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)
    .toString(16)
    .padStart(32, '0');

  return {
    hash: `sha256:${pseudoHash}${pseudoHash}`,
    sig: `ed25519:${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 8)}`,
    blockId: `AMZ-BLOCK-#${Math.floor(10000 + Math.random() * 90000)}`,
  };
}
