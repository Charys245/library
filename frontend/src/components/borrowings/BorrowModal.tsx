import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useBooks, useBorrowers } from '../../hooks/useQueries';
import { BookmarkPlus, AlertCircle } from 'lucide-react';
import type { Book, Borrower } from '@/types';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    book_id: string | number;
    borrower_id: string | number;
    due_date?: string;
    notes?: string;
  }) => Promise<void>;
  preselectedBook?: Book | null;
  preselectedBorrower?: Borrower | null;
  isLoading?: boolean;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedBook,
  preselectedBorrower,
  isLoading = false,
}) => {
  const { data: books = [] } = useBooks(isOpen ? { status: 'available' } : undefined);
  const { data: allBorrowers = [] } = useBorrowers(isOpen ? undefined : undefined);

  const availableBooks = books;
  const borrowers = allBorrowers.filter((b) => b.status === 'active');

  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Calculate default return date: 21 days from now
      const defaultReturn = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      setDueDate(defaultReturn);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (preselectedBook) {
        setSelectedBookId(String(preselectedBook.id));
      } else if (availableBooks.length > 0 && !selectedBookId) {
        setSelectedBookId(String(availableBooks[0].id));
      }
    }
  }, [isOpen, preselectedBook, availableBooks]);

  useEffect(() => {
    if (isOpen) {
      if (preselectedBorrower) {
        setSelectedBorrowerId(String(preselectedBorrower.id));
      } else if (borrowers.length > 0 && !selectedBorrowerId) {
        setSelectedBorrowerId(String(borrowers[0].id));
      }
    }
  }, [isOpen, preselectedBorrower, borrowers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBookId) {
      setError('Veuillez sélectionner un livre disponible.');
      return;
    }
    if (!selectedBorrowerId) {
      setError('Veuillez sélectionner un emprunteur.');
      return;
    }

    try {
      await onSubmit({
        book_id: selectedBookId,
        borrower_id: selectedBorrowerId,
        due_date: dueDate || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’enregistrement de l’emprunt.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer un nouvel emprunt"
      description="Attribuez un livre disponible à un adhérent et fixez la date limite de retour."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Select
            label="Livre à emprunter"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            required
            disabled={!!preselectedBook}
          >
            {preselectedBook ? (
              <option value={preselectedBook.id}>
                {preselectedBook.title} — {preselectedBook.author}
              </option>
            ) : availableBooks.length === 0 ? (
              <option value="">Aucun livre disponible pour le moment</option>
            ) : (
              availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author}
                </option>
              ))
            )}
          </Select>
          {!preselectedBook && availableBooks.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">
              Tous les livres sont actuellement empruntés.
            </p>
          )}
        </div>

        <div>
          <Select
            label="Emprunteur / Adhérent"
            value={selectedBorrowerId}
            onChange={(e) => setSelectedBorrowerId(e.target.value)}
            required
            disabled={!!preselectedBorrower}
          >
            {preselectedBorrower ? (
              <option value={preselectedBorrower.id}>
                {preselectedBorrower.name} ({preselectedBorrower.email})
              </option>
            ) : borrowers.length === 0 ? (
              <option value="">Aucun emprunteur actif trouvé</option>
            ) : (
              borrowers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.email})
                </option>
              ))
            )}
          </Select>
        </div>

        <div>
          <Input
            label="Date de retour prévue (échéance)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="borrow-notes" className="block text-xs font-medium text-zinc-300">
            Notes / Remarques (optionnel)
          </label>
          <textarea
            id="borrow-notes"
            rows={2}
            placeholder="ex: État de l'exemplaire, prêt inter-bibliothèque..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#16161a] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<BookmarkPlus className="w-3.5 h-3.5" />}
          >
            Valider l’emprunt
          </Button>
        </div>
      </form>
    </Modal>
  );
};
