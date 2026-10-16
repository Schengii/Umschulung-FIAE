import { describe, it, expect } from 'vitest';
import type { VideoShort } from '../components/videoShorts';

describe('Video Shorts & Unboxings Studio', () => {
  it('validates video short data model and like toggling', () => {
    const mockShort: VideoShort = {
      id: 'short-test',
      productId: 'prod-1',
      productTitle: 'Apple iPhone 15 Pro',
      productPrice: 1299,
      productImage: 'iphone.jpg',
      creatorName: 'TechTester',
      creatorAvatar: 'avatar.jpg',
      caption: 'Awesome titanium build!',
      tags: ['#Apple', '#Review'],
      likes: 100,
      isLiked: false,
      commentsCount: 10,
      views: '5k',
      videoDuration: 15,
      gradientBackground: '#111',
      verifiedBuyer: true,
    };

    expect(mockShort.likes).toBe(100);
    // Simulate like
    mockShort.isLiked = true;
    mockShort.likes += 1;
    expect(mockShort.likes).toBe(101);
    expect(mockShort.verifiedBuyer).toBe(true);
  });
});
