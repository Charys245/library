import React from 'react';
import { useBorrowings } from '../../hooks/useQueries';
import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { History } from 'lucide-react';

export const BorrowerMyHistory: React.FC = () => {
  const { activeBorrower } = useAuth();

  const {
    data: history = [],
    isLoading,
    error,
    refetch,
  } = useBorrowings({
    borrower_id: activeBorrower?.id,
    status: 'returned',
  });

  if (!activeBorrower) {
    return (
      <EmptyState
        title="Aucun profil sélectionné"
        description="Veuillez sélectionner un compte emprunteur pour afficher votre historique."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Mon historique de lecture</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Retrouvez tous les livres que vous avez empruntés et retournés par le passé.
          </p>
        </div>
        <div className="text-xs text-zinc-400 font-mono bg-[#111114] border border-zinc-800 px-3 py-1.5 rounded-lg">
          Livres lus : <span className="text-zinc-100 font-semibold">{history.length}</span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : error ? (
        <ErrorState message={error.message || 'Erreur lors du chargement de votre historique.'} onRetry={() => refetch()} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="Historique de lecture vide"
          description="Vous n'avez pas encore terminé et rendu d'emprunts."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Date d'emprunt</TableHead>
              <TableHead>Date de retour effectif</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((bw) => (
              <TableRow key={bw.id}>
                {/* Livre */}
                <TableCell>
                  <div className="font-semibold text-zinc-100">{bw.book_title}</div>
                  {bw.book_author && (
                    <div className="text-[11px] text-zinc-400">{bw.book_author}</div>
                  )}
                </TableCell>

                {/* Emprunté le */}
                <TableCell className="text-xs font-mono text-zinc-400">
                  {bw.borrowed_at}
                </TableCell>

                {/* Retourné le */}
                <TableCell className="text-xs font-mono text-emerald-400 font-medium">
                  {bw.returned_at || 'Retourné'}
                </TableCell>

                {/* Statut */}
                <TableCell className="text-right">
                  <Badge variant="returned" size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
