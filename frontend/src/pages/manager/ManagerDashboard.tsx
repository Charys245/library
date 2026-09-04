import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  BookmarkCheck,
  ArrowLeftRight,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  UserPlus,
} from "lucide-react";
import type { Borrowing } from "@/types";
import {
  useManagerStats,
  useBorrowings,
  useActivities,
  useCreateBook,
  useCreateBorrower,
  useCreateBorrowing,
  useReturnBorrowing,
} from "../../hooks/useQueries";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatsSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { ReturnConfirmModal } from "../../components/borrowings/ReturnConfirmModal";
import { BorrowModal } from "../../components/borrowings/BorrowModal";
import { BookFormModal } from "../../components/books/BookFormModal";
import { BorrowerFormModal } from "../../components/borrowers/BorrowerFormModal";
import { useToast } from "../../context/ToastContext";

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Queries using useQuery
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useManagerStats();

  const {
    data: activeBorrowings = [],
    isLoading: isBorrowingsLoading,
    error: borrowingsError,
    refetch: refetchBorrowings,
  } = useBorrowings({ status: "active" });

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useActivities();

  // Mutations using useMutation
  const createBookMutation = useCreateBook();
  const createBorrowerMutation = useCreateBorrower();
  const createBorrowingMutation = useCreateBorrowing();
  const returnBorrowingMutation = useReturnBorrowing();

  // Modals state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false);
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Borrowing | null>(null);

  const isLoading =
    isStatsLoading || isBorrowingsLoading || isActivitiesLoading;
  const error = statsError || borrowingsError || activitiesError;

  const handleRefetchAll = () => {
    refetchStats();
    refetchBorrowings();
    refetchActivities();
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
      toastError(
        "Erreur de retour",
        err?.message || "Impossible d’enregistrer le retour."
      );
    }
  };

  const handleCreateBook = async (data: any) => {
    try {
      const newBook = await createBookMutation.mutateAsync(data);
      success("Livre ajouté", `"${newBook.title}" a été ajouté au catalogue.`);
      setIsAddBookOpen(false);
    } catch (err: any) {
      toastError(
        "Erreur d’ajout",
        err?.message || "Impossible d’ajouter le livre."
      );
    }
  };

  const handleCreateBorrower = async (data: any) => {
    try {
      const newBorrower = await createBorrowerMutation.mutateAsync(data);
      success(
        "Emprunteur inscrit",
        `${newBorrower.name} a été enregistré avec succès.`
      );
      setIsAddBorrowerOpen(false);
    } catch (err: any) {
      toastError(
        "Erreur d’inscription",
        err?.message || "Impossible d’inscrire l’emprunteur."
      );
    }
  };

  const handleCreateBorrowing = async (data: any) => {
    try {
      await createBorrowingMutation.mutateAsync(data);
      success("Emprunt validé", "L’emprunt a été enregistré avec succès.");
      setIsBorrowOpen(false);
    } catch (err: any) {
      toastError(
        "Erreur d’emprunt",
        err?.message || "Impossible d’enregistrer l’emprunt."
      );
    }
  };

  const isActionLoading =
    createBookMutation.isPending ||
    createBorrowerMutation.isPending ||
    createBorrowingMutation.isPending ||
    returnBorrowingMutation.isPending;

  const recentBorrowings = activeBorrowings.slice(0, 5);
  const recentActivities = activities.slice(0, 6);

  if (error && !stats && activeBorrowings.length === 0) {
    return (
      <ErrorState
        message={error.message || "Erreur lors du chargement."}
        onRetry={handleRefetchAll}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Vue d’ensemble
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suivi en temps réel des prêts, des retours et de la disponibilité du
            fonds documentaire.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddBorrowerOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Inscrire adhérent
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddBookOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Ajouter livre
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBorrowOpen(true)}
            leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
          >
            Nouvel emprunt
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {isLoading || !stats ? (
        <StatsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Total livres
            </span>
            <p className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.total_books}
            </p>
            <p className="text-[11px] text-zinc-500">Dans le catalogue</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Disponibles
            </span>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {stats.available_books}
            </p>
            <p className="text-[11px] text-zinc-500">Prêts à être empruntés</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Empruntés
            </span>
            <p className="text-2xl font-bold text-amber-300 tracking-tight">
              {stats.borrowed_books}
            </p>
            <p className="text-[11px] text-zinc-500">Actuellement sortis</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Emprunts actifs
            </span>
            <p className="text-2xl font-bold text-blue-400 tracking-tight">
              {stats.active_borrowings}
            </p>
            <p className="text-[11px] text-zinc-500">Prêts non retournés</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Emprunteurs
            </span>
            <p className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.total_borrowers}
            </p>
            <p className="text-[11px] text-zinc-500">Adhérents inscrits</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-1">
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
            <p className="text-[11px] text-zinc-500">Date dépassée</p>
          </div>
        </div>
      )}

      {/* Main Split: Recent Borrowings + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Active Borrowings */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              Emprunts récents en cours
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/manager/borrowings")}
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Voir tous les emprunts
            </Button>
          </div>

          {isLoading ? (
            <TableSkeleton rows={4} columns={5} />
          ) : recentBorrowings.length === 0 ? (
            <div className="p-6 rounded-lg border border-zinc-800 bg-[#111114]/60 text-center text-xs text-zinc-500">
              Aucun emprunt en cours actuellement.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Emprunteur</TableHead>
                  <TableHead>Retour prévu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBorrowings.map((bw) => (
                  <TableRow key={bw.id}>
                    <TableCell className="font-medium text-zinc-200">
                      {bw.book_title}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {bw.borrower_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {bw.due_date}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bw.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setReturnTarget(bw)}
                        className="text-xs"
                      >
                        Retourner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Activité récente</span>
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800 space-y-3.5">
            {isLoading ? (
              <div className="space-y-3">
                <TableSkeleton rows={3} columns={2} />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">
                Aucune activité récente.
              </p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="text-xs border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-zinc-200 leading-snug">
                    {act.title}
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    {new Date(act.timestamp).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookFormModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSubmit={handleCreateBook}
        isLoading={isActionLoading}
      />

      <BorrowerFormModal
        isOpen={isAddBorrowerOpen}
        onClose={() => setIsAddBorrowerOpen(false)}
        onSubmit={handleCreateBorrower}
        isLoading={isActionLoading}
      />

      <BorrowModal
        isOpen={isBorrowOpen}
        onClose={() => setIsBorrowOpen(false)}
        onSubmit={handleCreateBorrowing}
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
