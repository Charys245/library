import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Borrowing } from '../../types';
import {
  useBook,
  useBookHistory,
  useUpdateBook,
  useDeleteBook,
  useCreateBorrowing,
  useReturnBorrowing,
} from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { BookFormModal } from '../../components/books/BookFormModal';
import { BookDeleteModal } from '../../components/books/BookDeleteModal';
import { BorrowModal } from '../../components/borrowings/BorrowModal';
import { ReturnConfirmModal } from '../../components/borrowings/ReturnConfirmModal';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Tag,
  User,
  Clock,
  Edit2,
  Trash2,
  BookmarkPlus,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Borrowing } from '@/types';

export const ManagerBookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const {
    data: book,
    isLoading: isBookLoading,
    error: bookError,
    refetch: refetchBook,
  } = useBook(bookId);

  const {
    data: history = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useBookHistory(bookId);

  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const createBorrowingMutation = useCreateBorrowing();
  const returnBorrowingMutation = useReturnBorrowing();

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);

  const isLoading = isBookLoading || isHistoryLoading;
  const error = bookError;

  const handleUpdateBook = async (formData: any) => {
    if (!book) return;
    try {
      await updateBookMutation.mutateAsync({ id: book.id, data: formData });
      success('Livre mis à jour', `"${formData.title}" a été actualisé.`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      toastError('Erreur de modification', err?.message);
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    if (book.status === 'borrowed' || book.current_borrowing) {
      toastError('Action refusée', 'Ce livre est actuellement emprunté et ne peut pas être supprimé.');
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await deleteBookMutation.mutateAsync(book.id);
      success('Livre supprimé', `"${book.title}" a été supprimé.`);
      navigate('/manager/books');
    } catch (err: any) {
      toastError('Erreur', err?.message);
    }
  };

  const handleCreateBorrow = async (data: any) => {
    try {
      await createBorrowingMutation.mutateAsync(data);
      success('Prêt enregistré', 'Le livre a été marqué comme emprunté.');
      setIsBorrowModalOpen(false);
    } catch (err: any) {
      toastError('Erreur', err?.message);
    }
  };

  const handleReturnConfirm = async () => {
    if (!returnTarget) return;
    try {
      await returnBorrowingMutation.mutateAsync(returnTarget.id);
      success('Retour validé', `"${book?.title}" est à nouveau disponible.`);
      setReturnTarget(null);
    } catch (err: any) {
      toastError('Erreur', err?.message);
    }
  };

  const isActionLoading =
    updateBookMutation.isPending ||
    deleteBookMutation.isPending ||
    createBorrowingMutation.isPending ||
    returnBorrowingMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/manager/books')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Retour aux livres
        </Button>
        <ErrorState
          message={error?.message || 'Livre non trouvé'}
          onRetry={() => {
            refetchBook();
            refetchHistory();
          }}
        />
      </div>
    );
  }

  const isBorrowed = book.status === 'borrowed' || !!book.current_borrowing;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/manager/books')}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#16161a] border border-zinc-800 transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-zinc-100">{book.title}</h1>
              <Badge variant={book.status} size="sm" />
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{book.author}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Modifier */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Modifier
          </Button>

          {/* Action Prêter / Retourner */}
          {isBorrowed && book.current_borrowing ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setReturnTarget({
                  id: book.current_borrowing!.id,
                  book_id: book.id,
                  book_title: book.title,
                  borrower_id: book.current_borrowing!.borrower_id,
                  borrower_name: book.current_borrowing!.borrower_name,
                  borrower_email: book.current_borrowing!.borrower_email,
                  borrowed_at: book.current_borrowing!.borrowed_at,
                  due_date: book.current_borrowing!.due_date,
                  returned_at: null,
                  status: 'active',
                })
              }
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Enregistrer le retour
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBorrowModalOpen(true)}
              leftIcon={<BookmarkPlus className="w-3.5 h-3.5" />}
            >
              Prêter ce livre
            </Button>
          )}

          {/* Action Supprimer */}
          <Button
            variant={isBorrowed ? 'outline' : 'danger'}
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Book Details & Description & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="p-6 rounded-xl bg-[#111114] border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Fiche signalétique</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Titre complet</span>
                <span className="font-semibold text-zinc-100 text-sm">{book.title}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Auteur(s)</span>
                <span className="font-semibold text-zinc-100 text-sm">{book.author}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Numéro ISBN</span>
                <span className="font-mono text-zinc-300">{book.isbn || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Année de parution</span>
                <span className="text-zinc-300">{book.published_year || 'Non renseignée'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Catégorie</span>
                <span className="text-zinc-300">{book.category || 'Général'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Total d’emprunts historiques</span>
                <span className="text-zinc-300 font-semibold">{book.total_borrowings_count || 0} prêts</span>
              </div>
            </div>

            {book.description && (
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs block mb-1.5">Résumé / Présentation</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#0c0c0e] p-3.5 rounded-lg border border-zinc-800">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          {/* Book Borrowing History */}
          <div className="p-6 rounded-xl bg-[#111114] border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <span>Historique des prêts de ce livre ({history.length})</span>
            </h2>

            {history.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                Aucun historique d’emprunt enregistré pour cet exemplaire.
              </p>
            ) : (
              <div className="space-y-2.5">
                {history.map((bw) => (
                  <div
                    key={bw.id}
                    className="p-3 rounded-lg bg-[#0c0c0e] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200 block">{bw.borrower_name}</span>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span>Emprunté le {bw.borrowed_at}</span>
                        <span>•</span>
                        <span>
                          {bw.returned_at ? `Retourné le ${bw.returned_at}` : `Échéance : ${bw.due_date}`}
                        </span>
                      </div>
                    </div>
                    <Badge variant={bw.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Current Status & Current Borrowing Card */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#111114] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              État actuel de l’exemplaire
            </h2>

            {isBorrowed && book.current_borrowing ? (
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Emprunt en cours</span>
                  </span>
                  <Badge variant="borrowed" size="sm" />
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Emprunteur</span>
                    <span className="font-semibold text-zinc-100">
                      {book.current_borrowing.borrower_name}
                    </span>
                    {book.current_borrowing.borrower_email && (
                      <span className="text-zinc-400 block text-[11px]">
                        {book.current_borrowing.borrower_email}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-900/40">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Date d'emprunt</span>
                      <span className="font-mono text-zinc-300">
                        {book.current_borrowing.borrowed_at}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Date prévue</span>
                      <span className="font-mono text-amber-300 font-semibold">
                        {book.current_borrowing.due_date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      setReturnTarget({
                        id: book.current_borrowing!.id,
                        book_id: book.id,
                        book_title: book.title,
                        borrower_id: book.current_borrowing!.borrower_id,
                        borrower_name: book.current_borrowing!.borrower_name,
                        borrower_email: book.current_borrowing!.borrower_email,
                        borrowed_at: book.current_borrowing!.borrowed_at,
                        due_date: book.current_borrowing!.due_date,
                        returned_at: null,
                        status: 'active',
                      })
                    }
                  >
                    Enregistrer le retour
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-200">Exemplaire disponible</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Cet ouvrage est en rayon et peut être attribué à un emprunteur.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsBorrowModalOpen(true)}
                  leftIcon={<BookmarkPlus className="w-3.5 h-3.5" />}
                >
                  Prêter à un adhérent
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateBook}
        bookToEdit={book}
        isLoading={isActionLoading}
      />

      <BookDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBook}
        book={book}
        isLoading={isActionLoading}
      />

      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSubmit={handleCreateBorrow}
        preselectedBook={book}
        isLoading={isActionLoading}
      />

      <ReturnConfirmModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturnConfirm}
        borrowing={returnTarget}
        isLoading={isActionLoading}
      />
    </div>
  );
};
