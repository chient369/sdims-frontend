import { useEffect, useCallback } from 'react';

/**
 * Hook to detect ESC key presses
 * @param handler Function to call when ESC key is pressed
 * @param active Whether the hook is active (useful for conditional execution)
 */
export function useEscapeKey(
  handler: () => void,
  active: boolean = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    },
    [handler]
  );

  useEffect(() => {
    if (active) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, handleKeyDown]);
} 