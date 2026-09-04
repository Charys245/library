import React, { useEffect, useState } from 'react';
import type { Borrower, Borrowing } from '../../types';
import { getBorrowerHistory } from '../../api/borrowers';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Mail, Phone, Calendar, BookOpen, Clock, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

interface BorrowerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  borrower: Borrower | null;
  onReturnBook?: (borrowingId: string | number) => void;
}

export const BorrowerDetailDrawer: React.FC<BorrowerDetailDrawerProps> = ({
  isOpen,
  onClose,
  borrower,
  onReturnBook,
}) => {
  const [history, setHistory] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (borrower && isOpen) {
      setIsLoading(true);
      getBorrowerHistory(borrower.id)
        .then((data) => setHistory(data))
        .finally(() => setIsLoading(false));
    }
  }, [borrower, isOpen]);

  if (!borrower) return null;

  const activeBorrowings = history.filter((bw) => bw.status === 'active' || bw.status === 'overdue');
  const pastBorrowings = history.filter((bw) => bw.status === 'returned');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fiche détaillée de l’emprunteur"
      description="Consultez les informations de contact, prêts en cours et historique complet."
      maxWidth="xl"
    >
      <div className="space-y-6 text-zinc-200">
        {/* Top Info Banner */}
        <div className="p-4 rounded-lg bg-[#0c0c0e] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-100">
              {borrower.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-zinc-100">{borrower.name}</h4>
                <Badge variant={borrower.status === 'active' ? 'success' : 'danger'} size="sm">
                  {borrower.status === 'active' ? 'Actif' : 'Suspendu'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {borrower.email}
                </span>
                {borrower.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {borrower.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">En cours</span>
              <span className="text-base font-semibold text-zinc-100">
                {borrower.current_borrowings_count}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Total prêts</span>
              <span className="text-base font-semibold text-zinc-100">
                {borrower.total_borrowings_count}
              </span>
            </div>
          </div>
        </div>

        {/* Active Borrowings */}
        <div>
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Emprunts en cours ({activeBorrowings.length})</span>
          </h5>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
            </div>
          ) : activeBorrowings.length === 0 ? (
            <div className="p-3 text-center rounded-lg border border-zinc-800 bg-[#0c0c0e]/60 text-xs text-zinc-500">
              Aucun emprunt en cours pour cet adhérent.
            </div>
          ) : (
            <div className="space-y-2">
              {activeBorrowings.map((bw) => (
                <div
                  key={bw.id}
                  className="p-3 rounded-lg bg-[#16161a] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">{bw.book_title}</p>
                    <div className="flex items-center gap-3 text-zinc-400 text-[11px] mt-0.5">
                      <span>Emprunté le {bw.borrowed_at}</span>
                      <span className="text-zinc-500">•</span>
                      <span className={bw.status === 'overdue' ? 'text-red-400 font-semibold' : ''}>
                        Retour prévu : {bw.due_date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={bw.status} size="sm" />
                    {onReturnBook && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onReturnBook(bw.id)}
                        className="text-xs"
                      >
                        Retourner
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Historique des emprunts retournés ({pastBorrowings.length})</span>
          </h5>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pastBorrowings.length === 0 ? (
            <div className="p-3 text-center rounded-lg border border-zinc-800 bg-[#0c0c0e]/60 text-xs text-zinc-500">
              Aucun historique d'emprunt antérieur enregistré.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {pastBorrowings.map((bw) => (
                <div
                  key={bw.id}
                  className="p-2.5 rounded-lg bg-[#0c0c0e]/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{bw.book_title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Du {bw.borrowed_at} au {bw.returned_at || bw.due_date}
                    </p>
                  </div>
                  <Badge variant="returned" size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
