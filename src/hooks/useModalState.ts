import { useState, useCallback } from 'react';

/**
 * Hook to manage modal state
 * @param initialState Initial state of the modal (open or closed)
 * @returns Object with isOpen state and functions to open, close, and toggle
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
} 