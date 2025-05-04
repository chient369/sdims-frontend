import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isOpen: (modalId: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Provider component for modal management
 */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const openModal = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.add(modalId);
      return newSet;
    });
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(modalId);
      return newSet;
    });
  }, []);

  const isOpen = useCallback(
    (modalId: string) => openModals.has(modalId),
    [openModals]
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

/**
 * Hook to access the modal context
 */
export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

/**
 * Hook to manage a specific modal by ID
 * @param modalId Unique identifier for the modal
 */
export function useModal(modalId: string) {
  const { openModal, closeModal, isOpen } = useModalContext();

  return {
    open: () => openModal(modalId),
    close: () => closeModal(modalId),
    isOpen: isOpen(modalId),
  };
} 