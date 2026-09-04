import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import { Borrowing, Book } from '../../types';
import {
  useBorrowerStats,
  useBorrowings,
  useBooks,
  useReturnBorrowing,
  useCreateBorrowing,
} from "../../hooks/useQueries";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
// import { BookCard } from '../../components/books/BookCard';
import { StatsSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { ReturnConfirmModal } from "../../components/borrowings/ReturnConfirmModal";
import { useToast } from "../../context/ToastContext";
import {
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookMarked,
} from "lucide-react";
import type { Book, Borrowing } from "@/types";
import { BookCard } from "@/components/books/BookCard copy";

export const BorrowerDashboard: React.FC = () => {
  const { activeBorrower } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useBorrowerStats(activeBorrower?.id);

  const {
    data: myActiveBorrowings = [],
    isLoading: isBorrowingsLoading,
    error: borrowingsError,
    refetch: refetchBorrowings,
  } = useBorrowings({
    borrower_id: activeBorrower?.id,
    status: "active",
  });

  const {
    data: allAvailableBooks = [],
    isLoading: isBooksLoading,
    error: booksError,
    refetch: refetchBooks,
  } = useBooks({ status: "available" });

  const returnBorrowingMutation = useReturnBorrowing();
  const createBorrowingMutation = useCreateBorrowing();

  // Return modal
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);

  const isLoading = isStatsLoading || isBorrowingsLoading || isBooksLoading;
  const error = statsError || borrowingsError || booksError;

  const handleRefetchAll = () => {
    refetchStats();
    refetchBorrowings();
    refetchBooks();
  };

  const handleReturnConfirm = async () => {
    if (!returnTarget) return;
    try {
      await returnBorrowingMutation.mutateAsync(returnTarget.id);
      success(
        "Livre retourné",
        `Merci ! "${returnTarget.book_title}" a été retourné.`
      );
      setReturnTarget(null);
    } catch (err: any) {
      toastError("Erreur", err?.message);
    }
  };

  const handleDirectBorrow = async (book: Book) => {
    if (!activeBorrower) return;
    try {
      await createBorrowingMutation.mutateAsync({
        book_id: book.id,
        borrower_id: activeBorrower.id,
      });
      success("Emprunt confirmé", `Vous avez emprunté "${book.title}".`);
    } catch (err: any) {
      toastError("Erreur d’emprunt", err?.message);
    }
  };

  const isActionLoading =
    returnBorrowingMutation.isPending || createBorrowingMutation.isPending;
  const availableBooks = allAvailableBooks.slice(0, 3);

  if (!activeBorrower) {
    return (
      <EmptyState
        title="Aucun profil sélectionné"
        description="Veuillez sélectionner un compte emprunteur dans le panneau latéral pour accéder à votre espace personnalisé."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error.message || "Erreur lors du chargement de votre espace."}
        onRetry={handleRefetchAll}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-[#111114] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
            Espace Lecteur
          </span>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">
            Bonjour, {activeBorrower.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Consultez l’état de vos prêts, anticipez vos dates d’échéance et
            découvrez les nouveautés.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/borrower/catalog")}
          leftIcon={<BookMarked className="w-4 h-4" />}
        >
          Parcourir le catalogue
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading || !stats ? (
        <StatsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Mes emprunts en cours
            </span>
            <p className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.my_active_borrowings}
            </p>
            <p className="text-[11px] text-zinc-500">
              Livres actuellement en votre possession
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Retours à venir
            </span>
            <p className="text-2xl font-bold text-blue-400 tracking-tight">
              {stats.upcoming_returns}
            </p>
            <p className="text-[11px] text-zinc-500">Prêts dans les délais</p>
          </div>

          <div className="p-4 rounded-lg bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Retards
            </span>
            <p
              className={`text-2xl font-bold tracking-tight ${
                stats.overdue_borrowings > 0 ? "text-red-400" : "text-zinc-400"
              }`}
            >
              {stats.overdue_borrowings}
            </p>
            <p className="text-[11px] text-zinc-500">Échéances dépassées</p>
          </div>

          <div className="p-4 rounded-lg bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Lectures terminées
            </span>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {stats.total_read}
            </p>
            <p className="text-[11px] text-zinc-500">Livres déjà rendus</p>
          </div>
        </div>
      )}

      {/* Active Borrowings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Livres actuellement empruntés ({myActiveBorrowings.length})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pensez à retourner vos exemplaires avant la date d'échéance.
            </p>
          </div>
          {myActiveBorrowings.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/borrower/borrowings")}
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Gérer tous mes emprunts
            </Button>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={2} columns={4} />
        ) : myActiveBorrowings.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-zinc-800 bg-[#111114]/50 text-center">
            <BookOpen className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">
              Aucun emprunt en cours
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Vous n'avez aucun livre emprunté pour le moment. Explorez le
              catalogue pour trouver votre prochaine lecture.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/borrower/catalog")}
              className="mt-4 text-xs"
            >
              Explorer le catalogue
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveBorrowings.map((bw) => {
              const isOverdue = bw.status === "overdue";
              return (
                <div
                  key={bw.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isOverdue
                      ? "bg-red-950/20 border-red-800/50"
                      : "bg-[#111114] border-zinc-800"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {bw.book_title}
                      </h3>
                      <Badge variant={bw.status} size="sm" />
                    </div>
                    {bw.book_author && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {bw.book_author}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span>Emprunté le : {bw.borrowed_at}</span>
                      <span
                        className={
                          isOverdue
                            ? "text-red-400 font-semibold"
                            : "text-zinc-300"
                        }
                      >
                        Retour prévu : {bw.due_date}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReturnTarget(bw)}
                      className="text-xs"
                      leftIcon={
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      }
                    >
                      Retourner le livre
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Books Highlights */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Quelques livres disponibles</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Suggestions d'ouvrages immédiatement empruntables.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/borrower/catalog")}
            className="text-xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Tout voir
          </Button>
        </div>

        {availableBooks.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Aucun livre disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={handleDirectBorrow}
                showBorrowButton={true}
                basePath="/borrower/catalog"
              />
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
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
