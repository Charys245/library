import React, { useState } from "react";
// import { Book } from "../../types";
// import { useBooks, useCreateBorrowing } from '../../hooks/useQueries';
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Input } from "../../components/ui/Input";
// import { BookCard } from '../../components/books/BookCard';
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Search, BookMarked } from "lucide-react";
import type { Book } from "@/types";
import { BookCard } from "@/components/books/BookCard copy";
import { useBooks, useCreateBorrowing } from "@/hooks/useQueries";

export const BorrowerCatalog: React.FC = () => {
  const { activeBorrower } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available">("all");

  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useBooks({
    status: statusFilter === "available" ? "available" : undefined,
    search: activeSearch.trim() || undefined,
  });

  const createBorrowingMutation = useCreateBorrowing();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const handleBorrowBook = async (book: Book) => {
    if (!activeBorrower) {
      toastError("Erreur", "Veuillez sélectionner un profil emprunteur.");
      return;
    }
    if (book.status === "borrowed") {
      toastError("Action impossible", "Cet ouvrage est déjà emprunté.");
      return;
    }

    try {
      await createBorrowingMutation.mutateAsync({
        book_id: book.id,
        borrower_id: activeBorrower.id,
      });
      success(
        "Livre emprunté avec succès",
        `"${book.title}" a été ajouté à vos emprunts en cours.`
      );
    } catch (err: any) {
      toastError("Erreur lors de l’emprunt", err?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Catalogue de la bibliothèque
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Consultez les ouvrages disponibles et empruntez directement vos
            lectures.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un livre par titre, auteur, catégorie..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="flex items-center gap-1.5 p-1 bg-[#111114] border border-zinc-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "all"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Tous les livres ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("available")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === "available"
                ? "bg-zinc-800 text-emerald-400 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Disponibles uniquement
          </button>
        </div>
      </div>

      {/* Grid of Books */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-zinc-800 bg-[#111114] space-y-3"
            >
              <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
              <div className="h-5 w-48 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
              <div className="h-16 w-full bg-zinc-800/60 rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error.message || "Impossible de charger le catalogue."}
          onRetry={() => refetch()}
        />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="w-6 h-6" />}
          title="Aucun ouvrage trouvé"
          description={
            activeSearch || statusFilter !== "all"
              ? "Aucun livre ne correspond à votre filtre de recherche."
              : "Le catalogue est actuellement vide."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={handleBorrowBook}
              showBorrowButton={true}
              basePath="/borrower/catalog"
            />
          ))}
        </div>
      )}
    </div>
  );
};
