import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book, Borrowing } from "../../types";
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
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
import { BookFormModal } from "../../components/books/BookFormModal";
import { BookDeleteModal } from "../../components/books/BookDeleteModal";
import { BorrowModal } from "../../components/borrowings/BorrowModal";
import { ReturnConfirmModal } from "../../components/borrowings/ReturnConfirmModal";
import { useToast } from "../../context/ToastContext";
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  Eye,
  Edit2,
  Trash2,
  BookmarkPlus,
  RotateCcw,
  BookMarked,
} from "lucide-react";

export const ManagerBooks: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "borrowed"
  >("all");

  // React Query hooks
  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useBooks({
    status: statusFilter,
    search: activeSearch.trim() || undefined,
  });

  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const createBorrowingMutation = useCreateBorrowing();
  const returnBorrowingMutation = useReturnBorrowing();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null);
  const [returnBorrowingTarget, setReturnBorrowingTarget] =
    useState<Borrowing | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const handleCreateOrUpdateBook = async (formData: any) => {
    try {
      if (bookToEdit) {
        await updateBookMutation.mutateAsync({
          id: bookToEdit.id,
          data: formData,
        });
        success("Livre modifié", `"${formData.title}" a été mis à jour.`);
        setBookToEdit(null);
      } else {
        await createBookMutation.mutateAsync(formData);
        success("Livre créé", `"${formData.title}" a été ajouté au catalogue.`);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      toastError("Erreur", err?.message || "Une erreur est survenue.");
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    if (bookToDelete.status === "borrowed" || bookToDelete.current_borrowing) {
      toastError(
        "Action impossible",
        "Un livre actuellement emprunté ne peut pas être supprimé."
      );
      setBookToDelete(null);
      return;
    }

    try {
      await deleteBookMutation.mutateAsync(bookToDelete.id);
      success(
        "Livre supprimé",
        `"${bookToDelete.title}" a été retiré du catalogue.`
      );
      setBookToDelete(null);
    } catch (err: any) {
      toastError(
        "Erreur de suppression",
        err?.message || "Impossible de supprimer ce livre."
      );
    }
  };

  const handleCreateBorrow = async (data: any) => {
    try {
      await createBorrowingMutation.mutateAsync(data);
      success("Emprunt validé", "L’emprunt a été enregistré.");
      setBookToBorrow(null);
    } catch (err: any) {
      toastError(
        "Erreur d’emprunt",
        err?.message || "Impossible d’enregistrer l’emprunt."
      );
    }
  };

  const handleReturnConfirm = async () => {
    if (!returnBorrowingTarget) return;
    try {
      await returnBorrowingMutation.mutateAsync(returnBorrowingTarget.id);
      success("Retour effectué", `Le livre est à nouveau disponible.`);
      setReturnBorrowingTarget(null);
    } catch (err: any) {
      toastError(
        "Erreur",
        err?.message || "Impossible d’enregistrer le retour."
      );
    }
  };

  const isActionLoading =
    createBookMutation.isPending ||
    updateBookMutation.isPending ||
    deleteBookMutation.isPending ||
    createBorrowingMutation.isPending ||
    returnBorrowingMutation.isPending;

  const openReturnModalForBook = (book: Book) => {
    if (book.current_borrowing) {
      setReturnBorrowingTarget({
        id: book.current_borrowing.id,
        book_id: book.id,
        book_title: book.title,
        borrower_id: book.current_borrowing.borrower_id,
        borrower_name: book.current_borrowing.borrower_name,
        borrower_email: book.current_borrowing.borrower_email,
        borrowed_at: book.current_borrowing.borrowed_at,
        due_date: book.current_borrowing.due_date,
        returned_at: null,
        status: "active",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Gestion des livres
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Inventaire complet, état des exemplaires et enregistrement des
            modifications.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Ajouter un livre
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher par titre, auteur, ISBN, catégorie..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
        </form>

        <div className="flex items-center gap-1.5 p-1 bg-[#111114] border border-zinc-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "all"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Tous ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("available")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "available"
                ? "bg-zinc-800 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Disponibles
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("borrowed")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "borrowed"
                ? "bg-zinc-800 text-amber-300"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Empruntés
          </button>
        </div>
      </div>

      {/* Table content */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : error ? (
        <ErrorState
          message={error.message || "Erreur lors du chargement des livres."}
          onRetry={() => refetch()}
        />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="w-6 h-6" />}
          title="Aucun livre trouvé"
          description={
            activeSearch || statusFilter !== "all"
              ? "Aucun résultat ne correspond à vos critères de recherche."
              : "Votre catalogue est actuellement vide. Commencez par ajouter un premier ouvrage."
          }
          actionLabel="Ajouter un livre"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Emprunteur</TableHead>
              <TableHead>Retour prévu</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => {
              const isBorrowed =
                book.status === "borrowed" || !!book.current_borrowing;
              return (
                <TableRow key={book.id}>
                  {/* Livre (Titre + ISBN/Catégorie) */}
                  <TableCell>
                    <div className="font-semibold text-zinc-100">
                      {book.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {book.isbn
                        ? `ISBN: ${book.isbn}`
                        : book.category || "Général"}
                    </div>
                  </TableCell>

                  {/* Auteur */}
                  <TableCell className="text-zinc-300">{book.author}</TableCell>

                  {/* Statut */}
                  <TableCell>
                    <Badge variant={book.status} size="sm" />
                  </TableCell>

                  {/* Emprunteur */}
                  <TableCell className="text-zinc-300">
                    {book.current_borrowing ? (
                      <div>
                        <span className="font-medium text-zinc-200 block">
                          {book.current_borrowing.borrower_name}
                        </span>
                        {book.current_borrowing.borrower_email && (
                          <span className="text-[11px] text-zinc-400">
                            {book.current_borrowing.borrower_email}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Retour prévu */}
                  <TableCell className="text-xs font-mono text-zinc-400">
                    {book.current_borrowing
                      ? book.current_borrowing.due_date
                      : "—"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => navigate(`/manager/books/${book.id}`)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Consulter les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setBookToEdit(book)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Modifier l’ouvrage"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Borrow / Return action */}
                      {isBorrowed ? (
                        <button
                          type="button"
                          onClick={() => openReturnModalForBook(book)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-md transition-colors"
                          title="Enregistrer le retour"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBookToBorrow(book)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-md transition-colors"
                          title="Créer un emprunt"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (disabled visually if borrowed) */}
                      <button
                        type="button"
                        onClick={() => setBookToDelete(book)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
                        title={
                          isBorrowed
                            ? "Impossible de supprimer un livre emprunté"
                            : "Supprimer le livre"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <BookFormModal
        isOpen={isAddModalOpen || !!bookToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setBookToEdit(null);
        }}
        onSubmit={handleCreateOrUpdateBook}
        bookToEdit={bookToEdit}
        isLoading={isActionLoading}
      />

      <BookDeleteModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteBook}
        book={bookToDelete}
        isLoading={isActionLoading}
      />

      <BorrowModal
        isOpen={!!bookToBorrow}
        onClose={() => setBookToBorrow(null)}
        onSubmit={handleCreateBorrow}
        preselectedBook={bookToBorrow}
        isLoading={isActionLoading}
      />

      <ReturnConfirmModal
        isOpen={!!returnBorrowingTarget}
        onClose={() => setReturnBorrowingTarget(null)}
        onConfirm={handleReturnConfirm}
        borrowing={returnBorrowingTarget}
        isLoading={isActionLoading}
      />
    </div>
  );
};
