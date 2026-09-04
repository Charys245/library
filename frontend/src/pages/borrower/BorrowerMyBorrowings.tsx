import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Borrowing } from '@/types';
// import { useBorrowings, useReturnBorrowing } from '../../hooks/useQueries';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReturnConfirmModal } from '../../components/borrowings/ReturnConfirmModal';
import { ArrowLeftRight, RotateCcw, BookMarked, Eye } from 'lucide-react';
import type { Borrowing } from '@/types';
import { useBorrowings, useReturnBorrowing } from '@/hooks/useQueries';

export const BorrowerMyBorrowings: React.FC = () => {
  const { activeBorrower } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const {
    data: borrowings = [],
    isLoading,
    error,
    refetch,
  } = useBorrowings({
    borrower_id: activeBorrower?.id,
    status: 'active',
  });

  const returnBorrowingMutation = useReturnBorrowing();
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);

  const handleReturnConfirm = async () => {
    if (!returnTarget) return;
    try {
      await returnBorrowingMutation.mutateAsync(returnTarget.id);
      success('Livre retourné', `Le retour de "${returnTarget.book_title}" a été confirmé.`);
      setReturnTarget(null);
    } catch (err: any) {
      toastError('Erreur', err?.message);
    }
  };

  if (!activeBorrower) {
    return (
      <EmptyState
        title="Aucun profil sélectionné"
        description="Veuillez sélectionner un compte emprunteur pour consulter vos emprunts."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Mes emprunts en cours</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Liste de vos livres actuellement empruntés et échéances de restitution.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/borrower/catalog')}
          leftIcon={<BookMarked className="w-3.5 h-3.5" />}
        >
          Emprunter un autre livre
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={3} columns={5} />
      ) : error ? (
        <ErrorState message={error.message || 'Impossible de récupérer vos emprunts.'} onRetry={() => refetch()} />
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="w-6 h-6" />}
          title="Aucun livre emprunté"
          description="Vous n'avez aucun emprunt actif pour le moment."
          actionLabel="Découvrir le catalogue"
          onAction={() => navigate('/borrower/catalog')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Date d'emprunt</TableHead>
              <TableHead>Date limite de retour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowings.map((bw) => (
              <TableRow key={bw.id}>
                {/* Titre */}
                <TableCell>
                  <div className="font-semibold text-zinc-100">{bw.book_title}</div>
                  {bw.book_author && (
                    <div className="text-[11px] text-zinc-400">{bw.book_author}</div>
                  )}
                </TableCell>

                {/* Date d'emprunt */}
                <TableCell className="text-xs font-mono text-zinc-300">
                  {bw.borrowed_at}
                </TableCell>

                {/* Retour prévu */}
                <TableCell className="text-xs font-mono">
                  <span className={bw.status === 'overdue' ? 'text-red-400 font-bold' : 'text-zinc-200'}>
                    {bw.due_date}
                  </span>
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <Badge variant={bw.status} size="sm" />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/borrower/catalog/${bw.book_id}`)}
                      className="text-xs"
                      title="Détails de l'ouvrage"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReturnTarget(bw)}
                      className="text-xs"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                    >
                      Retourner
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Return Modal */}
      <ReturnConfirmModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturnConfirm}
        borrowing={returnTarget}
        isLoading={returnBorrowingMutation.isPending}
      />
    </div>
  );
};
