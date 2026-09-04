import React, { useState } from 'react';
import type { Borrower } from '../../types';
import {
  useBorrowers,
  useCreateBorrower,
  useUpdateBorrower,
  useCreateBorrowing,
  useReturnBorrowing,
} from '../../hooks/useQueries';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { BorrowerFormModal } from '../../components/borrowers/BorrowerFormModal';
import { BorrowerDetailDrawer } from '../../components/borrowers/BorrowerDetailDrawer';
import { BorrowModal } from '../../components/borrowings/BorrowModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  BookmarkPlus,
  Mail,
  Phone,
} from 'lucide-react';

export const ManagerBorrowers: React.FC = () => {
  const { refreshBorrowers } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // React Query hooks
  const {
    data: borrowers = [],
    isLoading,
    error,
    refetch,
  } = useBorrowers(activeSearch.trim() || undefined);

  const createBorrowerMutation = useCreateBorrower();
  const updateBorrowerMutation = useUpdateBorrower();
  const createBorrowingMutation = useCreateBorrowing();
  const returnBorrowingMutation = useReturnBorrowing();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowerToEdit, setBorrowerToEdit] = useState<Borrower | null>(null);
  const [selectedBorrowerForDetail, setSelectedBorrowerForDetail] = useState<Borrower | null>(null);
  const [borrowerToBorrow, setBorrowerToBorrow] = useState<Borrower | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const handleCreateOrUpdateBorrower = async (formData: any) => {
    try {
      if (borrowerToEdit) {
        await updateBorrowerMutation.mutateAsync({ id: borrowerToEdit.id, data: formData });
        success('Emprunteur mis à jour', `${formData.name} a été modifié.`);
        setBorrowerToEdit(null);
      } else {
        await createBorrowerMutation.mutateAsync(formData);
        success('Emprunteur inscrit', `${formData.name} a été inscrit avec succès.`);
        setIsAddModalOpen(false);
      }
      await refreshBorrowers();
    } catch (err: any) {
      toastError('Erreur', err?.message || 'Une erreur est survenue.');
    }
  };

  const handleCreateBorrow = async (data: any) => {
    try {
      await createBorrowingMutation.mutateAsync(data);
      success('Emprunt validé', 'Le prêt a été enregistré avec succès.');
      setBorrowerToBorrow(null);
    } catch (err: any) {
      toastError('Erreur d’emprunt', err?.message);
    }
  };

  const handleReturnFromDrawer = async (borrowingId: string | number) => {
    try {
      await returnBorrowingMutation.mutateAsync(borrowingId);
      success('Retour enregistré', 'Le livre a été retourné.');
      // Update selected drawer borrower count if applicable
      if (selectedBorrowerForDetail) {
        setSelectedBorrowerForDetail((prev) =>
          prev
            ? {
                ...prev,
                current_borrowings_count: Math.max(0, prev.current_borrowings_count - 1),
              }
            : null
        );
      }
    } catch (err: any) {
      toastError('Erreur', err?.message);
    }
  };

  const isActionLoading =
    createBorrowerMutation.isPending ||
    updateBorrowerMutation.isPending ||
    createBorrowingMutation.isPending ||
    returnBorrowingMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Gestion des emprunteurs
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Répertoire des adhérents, suivi des prêts actifs et historique individuel.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Inscrire un emprunteur
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
          <Input
            placeholder="Rechercher par nom ou adresse email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : error ? (
        <ErrorState message={error.message || 'Erreur lors du chargement des emprunteurs.'} onRetry={() => refetch()} />
      ) : borrowers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Aucun emprunteur trouvé"
          description={
            activeSearch
              ? 'Aucun adhérent ne correspond à votre recherche.'
              : 'Aucun emprunteur n’est actuellement inscrit dans le registre.'
          }
          actionLabel="Inscrire un emprunteur"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adhérent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Emprunts en cours</TableHead>
              <TableHead>Total emprunts</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowers.map((borrower) => (
              <TableRow key={borrower.id}>
                {/* Nom */}
                <TableCell>
                  <div className="font-semibold text-zinc-100">{borrower.name}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Adhésion : {borrower.membership_date || '2024'}
                  </div>
                </TableCell>

                {/* Email / Téléphone */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{borrower.email}</span>
                  </div>
                  {borrower.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-600" />
                      <span>{borrower.phone}</span>
                    </div>
                  )}
                </TableCell>

                {/* Emprunts en cours */}
                <TableCell>
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                      borrower.current_borrowings_count > 0
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                        : 'text-zinc-500'
                    }`}
                  >
                    {borrower.current_borrowings_count} livre(s)
                  </span>
                </TableCell>

                {/* Total historique */}
                <TableCell className="text-xs text-zinc-300 font-medium">
                  {borrower.total_borrowings_count} prêts
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <Badge
                    variant={borrower.status === 'active' ? 'success' : 'danger'}
                    size="sm"
                  >
                    {borrower.status === 'active' ? 'Actif' : 'Suspendu'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details & History */}
                    <button
                      type="button"
                      onClick={() => setSelectedBorrowerForDetail(borrower)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                      title="Voir détails & historique"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => setBorrowerToEdit(borrower)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                      title="Modifier les coordonnées"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Preter un livre */}
                    <button
                      type="button"
                      onClick={() => setBorrowerToBorrow(borrower)}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-md transition-colors"
                      title="Attribuer un prêt"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <BorrowerFormModal
        isOpen={isAddModalOpen || !!borrowerToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setBorrowerToEdit(null);
        }}
        onSubmit={handleCreateOrUpdateBorrower}
        borrowerToEdit={borrowerToEdit}
        isLoading={isActionLoading}
      />

      <BorrowerDetailDrawer
        isOpen={!!selectedBorrowerForDetail}
        onClose={() => setSelectedBorrowerForDetail(null)}
        borrower={selectedBorrowerForDetail}
        onReturnBook={handleReturnFromDrawer}
      />

      <BorrowModal
        isOpen={!!borrowerToBorrow}
        onClose={() => setBorrowerToBorrow(null)}
        onSubmit={handleCreateBorrow}
        preselectedBorrower={borrowerToBorrow}
        isLoading={isActionLoading}
      />
    </div>
  );
};
