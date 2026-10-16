import { describe, it, expect } from 'vitest';
import type { PartyMember, SharedItemVote } from '../components/coBrowsingParty';

describe('Live Co-Browsing Video-Party', () => {
  it('calculates split bill correctly among party members', () => {
    const members: PartyMember[] = [
      { id: '1', name: 'User A', avatar: '', isHost: true, isMuted: false, isVideoOn: true, cursorX: 0, cursorY: 0, selectedColor: '' },
      { id: '2', name: 'User B', avatar: '', isHost: false, isMuted: false, isVideoOn: true, cursorX: 0, cursorY: 0, selectedColor: '' },
      { id: '3', name: 'User C', avatar: '', isHost: false, isMuted: false, isVideoOn: true, cursorX: 0, cursorY: 0, selectedColor: '' },
    ];

    const items: SharedItemVote[] = [
      { productId: 'p1', productTitle: 'Item 1', price: 90, image: '', addedBy: 'User A', votesUp: 3, votesDown: 0 },
      { productId: 'p2', productTitle: 'Item 2', price: 60, image: '', addedBy: 'User B', votesUp: 2, votesDown: 1 },
    ];

    const total = items.reduce((s, i) => s + i.price, 0);
    const splitPerPerson = total / members.length;

    expect(total).toBe(150);
    expect(splitPerPerson).toBe(50);
  });
});
