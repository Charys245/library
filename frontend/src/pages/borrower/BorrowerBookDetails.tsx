import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useCreateBorrowing } from '../../hooks/useQueries';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const BorrowerBookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { activeBorrower } = useAuth();
  const { success, error: toastError } = useToast();

  const { data: book, isLoading, error, refetch } = useBook(bookId);
  const createBorrowingMutation = useCreateBorrowing();

  const handleBorrow = async () => {
    if (!book || !activeBorrower) {
      toastError('Erreur', 'Profil emprunteur introuvable.');
      return;
    }
    if (book.status !== 'available') {
      toastError('Action impossible', 'Cet ouvrage n’est pas disponible.');
      return;
    }

    try {
      await createBorrowingMutation.mutateAsync({
        book_id: book.id,
        borrower_id: activeBorrower.id,
      });
      success('Emprunt validé', `Vous avez emprunté "${book.title}".`);
    } catch (err: any) {
      toastError('Erreur lors de l’emprunt', err?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/borrower/catalog')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Retour au catalogue
        </Button>
        <ErrorState message={error?.message || 'Livre introuvable'} onRetry={() => refetch()} />
      </div>
    );
  }

  const isAvailable = book.status === 'available';
  const isBorrowedByMe =
    activeBorrower &&
    book.current_borrowing &&
    String(book.current_borrowing.borrower_id) === String(activeBorrower.id);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/borrower/catalog')}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#16161a] border border-zinc-800 transition-colors"
            title="Retour au catalogue"
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

        {isAvailable && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleBorrow}
            isLoading={createBorrowingMutation.isPending}
            leftIcon={<BookmarkCheck className="w-4 h-4" />}
          >
            Emprunter ce livre
          </Button>
        )}
      </div>

      {/* Main Content Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-[#111114] border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Informations sur l’œuvre</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Titre</span>
                <span className="font-semibold text-zinc-100 text-sm">{book.title}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Auteur(s)</span>
                <span className="font-semibold text-zinc-100 text-sm">{book.author}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Identifiant ISBN</span>
                <span className="font-mono text-zinc-300">{book.isbn || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Année de publication</span>
                <span className="text-zinc-300">{book.published_year || 'Non renseignée'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Catégorie</span>
                <span className="text-zinc-300">{book.category || 'Général'}</span>
              </div>
            </div>

            {book.description && (
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs block mb-1.5">Résumé de l’ouvrage</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#0c0c0e] p-3.5 rounded-lg border border-zinc-800">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div>
          <div className="p-5 rounded-xl bg-[#111114] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Disponibilité
            </h2>

            {isAvailable ? (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-200">Disponible au prêt</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Cet exemplaire est disponible. Vous pouvez l'emprunter directement pour une durée standard de 3 semaines.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleBorrow}
                  isLoading={createBorrowingMutation.isPending}
                  leftIcon={<BookmarkCheck className="w-3.5 h-3.5" />}
                >
                  Emprunter maintenant
                </Button>
              </div>
            ) : isBorrowedByMe ? (
              <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-blue-200">Emprunté par vous</h4>
                  <Badge variant="active" size="sm" />
                </div>
                <p className="text-xs text-zinc-300">
                  Vous avez actuellement cet exemplaire en votre possession.
                </p>
                <div className="pt-2 border-t border-blue-900/40 text-xs">
                  <span className="text-zinc-500 block text-[11px]">Date d'échéance :</span>
                  <span className="font-mono text-blue-300 font-semibold">
                    {book.current_borrowing?.due_date}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#0c0c0e] border border-zinc-800 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-[#16161a] border border-zinc-800 flex items-center justify-center text-amber-400 mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-zinc-200">Actuellement indisponible</h4>
                <p className="text-[11px] text-zinc-500">
                  Cet exemplaire est actuellement emprunté par un autre adhérent et sera de nouveau disponible dès son retour.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
