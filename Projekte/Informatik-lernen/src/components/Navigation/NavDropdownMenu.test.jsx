// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NavDropdownMenu, { groupMenuItems } from './NavDropdownMenu';
import { labsMenuItems, labsMenuGroupOf } from '../../data/navbarMenuItems';

afterEach(cleanup);

const items = [
  { id: 'a', label: 'Hub', desc: 'Übersicht' },
  { id: 'b', label: 'Subnetting', desc: 'IPv4', badge: 'Neu' },
  { id: 'c', label: 'Skonto', desc: 'Zahlung' },
  { id: 'd', label: 'VLAN', desc: 'Switch' }
];
const groupOf = (i) => ({ b: 'Netz', d: 'Netz', c: 'WISO' })[i.id] || null;

describe('groupMenuItems', () => {
  it('stellt ungruppierte Einträge voran und bündelt den Rest', () => {
    const g = groupMenuItems(items, '', groupOf);
    expect(g.map((x) => x.name)).toEqual([null, 'Netz', 'WISO']);
    expect(g[1].items.map((i) => i.id)).toEqual(['b', 'd']);
  });

  it('filtert nach Titel, Beschreibung und Badge ohne Groß-/Kleinschreibung', () => {
    expect(groupMenuItems(items, 'subnet', groupOf)[0].items[0].id).toBe('b');
    expect(groupMenuItems(items, 'zahlung', groupOf)[0].items[0].id).toBe('c');
    expect(groupMenuItems(items, 'NEU', groupOf)[0].items[0].id).toBe('b');
    expect(groupMenuItems(items, 'xyz', groupOf)).toEqual([]);
  });

  it('liefert ohne groupOf eine einzige Liste', () => {
    expect(groupMenuItems(items)).toEqual([{ name: null, items }]);
  });
});

describe('labsMenuGroupOf', () => {
  it('ordnet Labs ihrer Kategorie zu, Nicht-Labs bleiben ungruppiert', () => {
    expect(labsMenuGroupOf({ id: 'exam' })).toBeNull();
    const grouped = labsMenuItems.filter((i) => labsMenuGroupOf(i));
    expect(grouped.length).toBeGreaterThan(50);
  });
});

describe('NavDropdownMenu mit Suche', () => {
  it('zeigt Gruppenüberschriften, filtert und meldet fehlende Treffer', () => {
    const onSelect = vi.fn();
    render(<NavDropdownMenu items={items} activeTab="a" onSelect={onSelect} searchable groupOf={groupOf} />);
    expect(screen.getByText('Netz')).toBeTruthy();
    const input = screen.getByLabelText('Menü durchsuchen');
    fireEvent.change(input, { target: { value: 'skonto' } });
    expect(screen.queryByText('Subnetting')).toBeNull();
    fireEvent.click(screen.getByText('Skonto'));
    expect(onSelect).toHaveBeenCalledWith('c');
    fireEvent.change(input, { target: { value: 'qqq' } });
    expect(screen.getByRole('status').textContent).toMatch(/Kein Treffer/);
  });

  it('zeigt ohne searchable kein Suchfeld', () => {
    render(<NavDropdownMenu items={items} activeTab="a" onSelect={() => {}} />);
    expect(screen.queryByRole('searchbox')).toBeNull();
  });
});
