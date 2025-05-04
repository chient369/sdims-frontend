import React from 'react';
import { Modal, ModalProps } from './Modal';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { Button } from '../ui/Button';

interface ConfirmationDialogProps extends Omit<ModalProps, 'children'> {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
}

/**
 * Confirmation dialog for user actions
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onClose,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps} onClose={onClose} size="sm">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant as any}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}; 