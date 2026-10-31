import { describe, it, expect, vi } from 'vitest';
import { onActivationKey } from './keyActivation';

const keyEvent = (key) => ({ key, preventDefault: vi.fn() });

describe('onActivationKey', () => {
  it('löst bei Enter und Leertaste aus und verhindert das Scrollen', () => {
    const handler = vi.fn();
    const onKeyDown = onActivationKey(handler);
    const enter = keyEvent('Enter');
    const space = keyEvent(' ');
    onKeyDown(enter);
    onKeyDown(space);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith(enter);
    expect(space.preventDefault).toHaveBeenCalled();
  });

  it('ignoriert andere Tasten', () => {
    const handler = vi.fn();
    const tab = keyEvent('Tab');
    onActivationKey(handler)(tab);
    expect(handler).not.toHaveBeenCalled();
    expect(tab.preventDefault).not.toHaveBeenCalled();
  });
});
