// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FlashcardsModal from './FlashcardsModal';
import { useStore } from '../../store/useStore';
import { FLASHCARDS_DATA } from '../../data/flashcardsData';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  localStorage.clear();
});

describe('FlashcardsModal', () => {
  it('rendert nichts, wenn isOpen=false', () => {
    const { container } = render(
      <FlashcardsModal isOpen={false} onClose={vi.fn()} onRewardXP={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('rendert semantischen Dialog mit ARIA-Attributen und Titel', () => {
    render(
      <FlashcardsModal isOpen={true} onClose={vi.fn()} onRewardXP={vi.fn()} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('flashcards-modal-title');
    expect(screen.getByText('IT-Karteikarten Trainer')).toBeTruthy();
  });

  it('schließt das Modal bei Drücken der Escape-Taste und Close-Button', () => {
    const onClose = vi.fn();
    render(<FlashcardsModal isOpen={true} onClose={onClose} onRewardXP={vi.fn()} />);

    // Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Close button
    const closeBtn = screen.getByLabelText('Schließen');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('dreht die Karteikarte bei Klick um und zeigt Lösung und Bewertungsbuttons', () => {
    render(<FlashcardsModal isOpen={true} onClose={vi.fn()} onRewardXP={vi.fn()} />);

    // Vor dem Klick: Front-Text sichtbar
    const frontText = FLASHCARDS_DATA[0].front;
    expect(screen.getByText(frontText)).toBeTruthy();
    expect(screen.queryByText(/💡 Lösung \/ Erklärung:/i)).toBeNull();

    // Klick auf die Karte
    const card = screen.getByText(frontText);
    fireEvent.click(card);

    // Nach dem Klick: Back-Text und Buttons sichtbar
    expect(screen.getByText(/💡 Lösung \/ Erklärung:/i)).toBeTruthy();
    expect(screen.getByText(FLASHCARDS_DATA[0].back)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Wiederholen/i })).toBeTruthy();
  });

  it('priorisiert fällige Karten vor Karten mit zukünftigem Fälligkeitsdatum (SM-2 Sortierung)', () => {
    const firstCard = FLASHCARDS_DATA[0];
    const secondCard = FLASHCARDS_DATA[1];

    // Mocke Store-Zustand: FirstCard ist erst 2099 fällig, SecondCard ist gestern fällig
    useStore.setState({
      userState: {
        ...useStore.getState().userState,
        srsFlashcards: {
          [firstCard.id]: { dueDate: '2099-12-31', repetitions: 3, interval: 30, easeFactor: 2.5 },
          [secondCard.id]: { dueDate: '2020-01-01', repetitions: 1, interval: 1, easeFactor: 2.5 }
        }
      }
    });

    render(<FlashcardsModal isOpen={true} onClose={vi.fn()} onRewardXP={vi.fn()} />);

    // Da secondCard fällig ist und firstCard erst 2099, muss secondCard als erstes angezeigt werden
    expect(screen.getByText(secondCard.front)).toBeTruthy();
    expect(screen.queryByText(firstCard.front)).toBeNull();
  });

  it('exportiert Anki-Deck und CSV per Klick auf die Download-Buttons', () => {
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    render(<FlashcardsModal isOpen={true} onClose={vi.fn()} onRewardXP={vi.fn()} />);

    const ankiBtn = screen.getByRole('button', { name: /Anki Deck/i });
    fireEvent.click(ankiBtn);
    expect(createObjectURLMock).toHaveBeenCalled();

    const csvBtn = screen.getByRole('button', { name: /CSV Export/i });
    fireEvent.click(csvBtn);
    expect(createObjectURLMock).toHaveBeenCalledTimes(2);
  });
});
