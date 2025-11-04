
import React from 'react';
import Modal from '../Modal.tsx';
import Icon from '../Icon.tsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-gray-700">
        {message}
      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`text-white px-4 py-2 rounded-md disabled:opacity-75 flex items-center justify-center min-w-[120px] ${confirmButtonClass}`}
        >
          {isLoading ? (
            <>
              <Icon name="spinner" className="animate-spin" />
              <span className="ml-2">Processing...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;