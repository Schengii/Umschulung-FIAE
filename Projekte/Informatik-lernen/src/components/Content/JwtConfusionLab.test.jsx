// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import JwtConfusionLab from './JwtConfusionLab';

afterEach(() => cleanup());

describe('JwtConfusionLab Eingabe', () => {
  it('stürzt bei ungültigem Base64URL im Token nicht ab (Regression: atob warf)', () => {
    const { container } = render(<JwtConfusionLab onRewardXP={() => {}} />);
    const area = container.querySelector('textarea');
    expect(area).toBeTruthy();
    fireEvent.change(area, { target: { value: '%%%.@@@.sig' } });
    expect(screen.getAllByText(/kein gültiges Base64URL/).length).toBeGreaterThan(0);
  });
});
