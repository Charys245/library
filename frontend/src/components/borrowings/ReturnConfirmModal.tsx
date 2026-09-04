import React from 'react';
import { Dialog } from '../ui/Dialog';
import type { Borrowing } from '@/types';

interface ReturnConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  borrowing: Borrowing | null;
  isLoading?: boolean;
}

export const ReturnConfirmModal: React.FC<ReturnConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  borrowing,
  isLoading = false,
}) => {
  if (!borrowing) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="info"
      title="Enregistrer le retour du livre"
      description={`Confirmez-vous la réception du livre "${borrowing.book_title}" prêté à ${borrowing.borrower_name} ?`}
      confirmLabel="Confirmer le retour"
      confirmVariant="primary"
      isLoading={isLoading}
    >
      <div className="p-3 bg-[#0c0c0e] rounded-lg border border-zinc-800 text-xs space-y-1.5 text-zinc-300">
        <div className="flex justify-between">
          <span className="text-zinc-500">Date d'emprunt :</span>
          <span>{borrowing.borrowed_at}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Date prévue :</span>
          <span className={borrowing.status === 'overdue' ? 'text-red-400 font-semibold' : ''}>
            {borrowing.due_date}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-zinc-800/80">
          <span className="text-zinc-500">Action :</span>
          <span className="text-emerald-400 font-medium">Remise en stock immédiate</span>
        </div>
      </div>
    </Dialog>
  );
};
