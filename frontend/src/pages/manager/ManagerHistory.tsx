import React, { useState } from 'react';
import { useBorrowingsHistory } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { History, Search } from 'lucide-react';

export const ManagerHistory: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: history = [], isLoading, error, refetch } = useBorrowingsHistory();

  const filtered = history.filter((bw) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      bw.book_title.toLowerCase().includes(s) ||
      bw.borrower_name.toLowerCase().includes(s) ||
      (bw.borrower_email && bw.borrower_email.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Historique global</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Archives complètes des emprunts terminés et retours confirmés.
          </p>
        </div>
        <div className="text-xs text-zinc-400 font-mono bg-[#111114] border border-zinc-800 px-3 py-1.5 rounded-lg">
          Total archivés : <span className="text-zinc-100 font-semibold">{history.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Filtrer l'historique par titre ou emprunteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : error ? (
        <ErrorState message={error.message || 'Erreur lors du chargement de l’historique.'} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="Historique vide"
          description={
            search
              ? 'Aucun emprunt archivé ne correspond à votre recherche.'
              : 'Aucun emprunt n’a encore été archivé comme retourné.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Emprunteur</TableHead>
              <TableHead>Date d'emprunt</TableHead>
              <TableHead>Échéance initiale</TableHead>
              <TableHead>Date de retour effectif</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((bw) => (
              <TableRow key={bw.id}>
                {/* Livre */}
                <TableCell>
                  <div className="font-semibold text-zinc-100">{bw.book_title}</div>
                  {bw.book_author && (
                    <div className="text-[11px] text-zinc-400">{bw.book_author}</div>
                  )}
                </TableCell>

                {/* Emprunteur */}
                <TableCell>
                  <div className="text-zinc-200 font-medium">{bw.borrower_name}</div>
                  {bw.borrower_email && (
                    <div className="text-[11px] text-zinc-400">{bw.borrower_email}</div>
                  )}
                </TableCell>

                {/* Date emprunt */}
                <TableCell className="text-xs font-mono text-zinc-400">{bw.borrowed_at}</TableCell>

                {/* Echéance */}
                <TableCell className="text-xs font-mono text-zinc-500">{bw.due_date}</TableCell>

                {/* Date de retour */}
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
