import { createPortal } from 'react-dom';
import Button from './Button';
import { ReactNode } from 'react';

type AcceptDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: ReactNode;
};

const AcceptDialog = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  children,
}: AcceptDialogProps) => {
  if (!open) {
    return null;
  }
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="min-w-[320px] rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 text-lg font-semibold">{title}</div>
        <div className="mb-6 text-sm text-gray-700">{description}</div>
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={onCancel} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm} type="button">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AcceptDialog;
