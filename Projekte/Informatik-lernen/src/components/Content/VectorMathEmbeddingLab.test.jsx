// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VectorMathEmbeddingLab from './VectorMathEmbeddingLab';

afterEach(() => cleanup());

describe('VectorMathEmbeddingLab Unit Tests', () => {
  it('rendert Metriken und initiale Vektorkomponenten', () => {
    render(<VectorMathEmbeddingLab onRewardXP={() => {}} />);
    expect(screen.getByText(/Vektor-Mathematik & Embedding-Distanz Studio/i)).toBeTruthy();
    expect(screen.getByText(/Cosine Similarity:/i)).toBeTruthy();
    expect(screen.getByText(/Euklidische Distanz \(L2\):/i)).toBeTruthy();
  });

  it('lädt orthogonales Vektor-Preset und aktualisiert Cosine-Similarity auf 0', () => {
    render(<VectorMathEmbeddingLab onRewardXP={() => {}} />);
    const orthoBtn = screen.getByRole('button', { name: /orthogonal/i });
    fireEvent.click(orthoBtn);

    expect(screen.getByText(/Winkel: 90°/i)).toBeTruthy();
  });

  it('validiert das Lab und vergibt 65 XP', () => {
    const onRewardXP = vi.fn();
    render(<VectorMathEmbeddingLab onRewardXP={onRewardXP} />);

    const claimBtn = screen.getByRole('button', { name: /lab validieren/i });
    fireEvent.click(claimBtn);

    expect(onRewardXP).toHaveBeenCalledWith(65);
    expect(screen.getByText('Vektor-Meister')).toBeTruthy();
  });
});
