import React, { useState } from "react";
import type { Borrowing } from "../../types";
import {
  useBorrowings,
  useCreateBorrowing,
  useReturnBorrowing,
} from "../../hooks/useQueries";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { BorrowModal } from "../../components/borrowings/BorrowModal";
import { ReturnConfirmModal } from "../../components/borrowings/ReturnConfirmModal";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeftRight,
  Plus,
  Search,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export const ManagerBorrowings: React.FC = () => {
  const { success, error: toastError } = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "overdue" | "returned"
  >("active");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // React Query
  const {
    data: borrowings = [],
    isLoading,
    error,
    refetch,
  } = useBorrowings({
    status: statusFilter,
    search: activeSearch.trim() || undefined,
  });

  const createBorrowingMutation = useCreateBorrowing();
  const returnBorrowingMutation = useReturnBorrowing();

  // Modals
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const handleCreateBorrow = async (data: any) => {
    try {
      await createBorrowingMutation.mutateAsync(data);
      success("Emprunt créé", "L’emprunt a été enregistré avec succès.");
      setIsBorrowModalOpen(false);
    } catch (err: any) {
      toastError("Erreur", err?.message);
    }
  };

  const handleReturnConfirm = async () => {
    if (!returnTarget) return;
    try {
      await returnBorrowingMutation.mutateAsync(returnTarget.id);
      success(
        "Retour enregistré",
        `Le livre "${returnTarget.book_title}" est à nouveau disponible.`
      );
      setReturnTarget(null);
    } catch (err: any) {
      toastError("Erreur", err?.message);
    }
  };

  const isActionLoading =
    createBorrowingMutation.isPending || returnBorrowingMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Registre des emprunts
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suivi des prêts en cours, gestion des retards et enregistrement des
            retours d'exemplaires.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsBorrowModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Créer un emprunt
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher par titre de livre ou nom d'emprunteur..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="flex items-center gap-1.5 p-1 bg-[#111114] border border-zinc-800 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === "active"
                ? "bg-zinc-800 text-blue-400 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            En cours
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("overdue")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === "overdue"
                ? "bg-zinc-800 text-red-400 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            En retard
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("returned")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === "returned"
                ? "bg-zinc-800 text-zinc-200 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Retournés
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Tous
          </button>
        </div>
      </div>

      {/* Borrowings Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : error ? (
        <ErrorState
          message={error.message || "Erreur lors du chargement des emprunts."}
          onRetry={() => refetch()}
        />
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="w-6 h-6" />}
          title="Aucun emprunt trouvé"
          description={
            activeSearch || statusFilter !== "all"
              ? "Aucun prêt ne correspond à ce filtre."
              : "Aucun emprunt n’est actuellement enregistré."
          }
          actionLabel="Créer un emprunt"
          onAction={() => setIsBorrowModalOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Emprunteur</TableHead>
              <TableHead>Date d'emprunt</TableHead>
              <TableHead>Retour prévu</TableHead>
              <TableHead>Date de retour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowings.map((bw) => {
              const isActive =
                !bw.returned_at &&
                (bw.status === "active" || bw.status === "overdue");
              return (
                <TableRow key={bw.id}>
                  {/* Livre */}
                  <TableCell>
                    <div className="font-semibold text-zinc-100">
                      {bw.book_title}
                    </div>
                    {bw.book_author && (
                      <div className="text-[11px] text-zinc-400">
                        {bw.book_author}
                      </div>
                    )}
                  </TableCell>

                  {/* Emprunteur */}
                  <TableCell>
                    <div className="text-zinc-200 font-medium">
                      {bw.borrower_name}
                    </div>
                    {bw.borrower_email && (
                      <div className="text-[11px] text-zinc-400">
                        {bw.borrower_email}
                      </div>
                    )}
                  </TableCell>

                  {/* Date d'emprunt */}
                  <TableCell className="text-xs font-mono text-zinc-300">
                    {bw.borrowed_at}
                  </TableCell>

                  {/* Retour prévu */}
                  <TableCell className="text-xs font-mono">
                    <span
                      className={
                        bw.status === "overdue"
                          ? "text-red-400 font-bold"
                          : "text-zinc-300"
                      }
                    >
                      {bw.due_date}
                    </span>
                  </TableCell>

                  {/* Date de retour */}
                  <TableCell className="text-xs font-mono text-zinc-400">
                    {bw.returned_at || "—"}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <Badge variant={bw.status} size="sm" />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    {isActive ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setReturnTarget(bw)}
                        className="text-xs"
                        leftIcon={
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        }
                      >
                        Retourner
                      </Button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Terminé
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSubmit={handleCreateBorrow}
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
