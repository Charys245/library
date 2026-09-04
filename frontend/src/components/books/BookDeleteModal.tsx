import React from 'react';
import { Dialog } from '../ui/Dialog';
// import { Book } from '../../types';
import { AlertCircle } from 'lucide-react';
import type { Book } from '@/types';

interface BookDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  book: Book | null;
  isLoading?: boolean;
}

export const BookDeleteModal: React.FC<BookDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  book,
  isLoading = false,
}) => {
  if (!book) return null;

  const isBorrowed = book.status === 'borrowed' || !!book.current_borrowing;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      title={isBorrowed ? 'Suppression impossible' : 'Supprimer cet ouvrage'}
      description={
        isBorrowed
          ? `L'ouvrage "${book.title}" est actuellement prêté. Les règles de gestion interdisent la suppression d'un livre en cours d'emprunt.`
          : `Êtes-vous sûr de vouloir supprimer définitivement "${book.title}" (${book.author}) du catalogue ? Cette action est irréversible.`
      }
      confirmLabel={isBorrowed ? 'Compris' : 'Supprimer le livre'}
      confirmVariant={isBorrowed ? 'secondary' : 'danger'}
      isLoading={isLoading}
    >
      {isBorrowed && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-200">Emprunt actif :</span>
            Emprunté par {book.current_borrowing?.borrower_name || 'un adhérent'}. Enregistrez d’abord le retour de l’exemplaire.
          </div>
        </div>
      )}
    </Dialog>
  );
};
