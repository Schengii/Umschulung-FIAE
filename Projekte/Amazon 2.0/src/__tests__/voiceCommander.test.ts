import { describe, it, expect } from 'vitest';
import { parseVoiceCommand } from '../utils/voiceCommander';
import type { Product } from '../types';

describe('Smart Voice Shopping Commander', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod-iphone-15',
      title: 'Apple iPhone 15 Pro Max',
      brand: 'Apple',
      category: 'electronics',
      price: 1299,
      rating: 4.8,
      reviewCount: 420,
      inStock: true,
      isPrime: true,
      images: ['iphone.jpg'],
      description: 'Smartphone',
    },
    {
      id: 'prod-sony-wh',
      title: 'Sony WH-1000XM5 Noise Cancelling',
      brand: 'Sony',
      category: 'electronics',
      price: 299,
      rating: 4.7,
      reviewCount: 300,
      inStock: true,
      isPrime: true,
      images: ['sony.jpg'],
      description: 'Headphones',
    },
  ];

  it('recognizes cart commands', () => {
    expect(parseVoiceCommand('öffne meinen warenkorb').action).toBe('open_cart');
    expect(parseVoiceCommand('zeige warenkorb').action).toBe('open_cart');
    expect(parseVoiceCommand('warenkorb').action).toBe('open_cart');
  });

  it('recognizes checkout commands', () => {
    expect(parseVoiceCommand('gehe zur kasse').action).toBe('open_checkout');
    expect(parseVoiceCommand('jetzt bezahlen').action).toBe('open_checkout');
  });

  it('recognizes orders and wishlist commands', () => {
    expect(parseVoiceCommand('zeige meine bestellungen').action).toBe('open_orders');
    expect(parseVoiceCommand('öffne wunschliste').action).toBe('open_wishlist');
  });

  it('recognizes theme toggle commands', () => {
    expect(parseVoiceCommand('dunkler modus').action).toBe('toggle_theme');
    expect(parseVoiceCommand('dark mode').action).toBe('toggle_theme');
  });

  it('recognizes add to cart intent with product matching', () => {
    const res = parseVoiceCommand('Füge das iPhone 15 zum Warenkorb hinzu', mockProducts);
    expect(res.action).toBe('add_to_cart');
    expect(res.matchedProduct?.id).toBe('prod-iphone-15');
  });

  it('falls back to search queries when appropriate', () => {
    const res = parseVoiceCommand('Suche nach mechanischer Tastatur');
    expect(res.action).toBe('search');
    expect(res.query).toBe('mechanischer Tastatur');
  });
});
