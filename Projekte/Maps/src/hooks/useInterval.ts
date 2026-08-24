import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook für periodisch ausgeführte Callbacks (z.B. Live-Verkehr alle 30 Sekunden)
 * Sicherstellt keine Memory-Leaks durch automatisches Cleanup
 */
export function useInterval(callback: () => void, delayMs: number | null): void {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

/**
 * Hook für Debouncing (z.B. Suchfeld – verzögerter API-Call)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
