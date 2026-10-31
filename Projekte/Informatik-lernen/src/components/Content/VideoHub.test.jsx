// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VideoHub from './VideoHub';

afterEach(() => cleanup());

describe('VideoHub Einwilligung', () => {
  it('lädt YouTube erst nach Klick (kein iframe vorher)', () => {
    const { container } = render(<VideoHub onCompleteVideo={() => {}} />);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Video von YouTube laden/i }));
    const frame = container.querySelector('iframe');
    expect(frame).toBeTruthy();
    expect(frame.getAttribute('src')).toContain('youtube-nocookie.com');
  });
});
