import type { Book } from "@/types";
import type { Borrowing } from "@/types";

import { apiClient } from "@/api/client";

export interface BookFilterParams {
  status?: "all" | "available" | "borrowed";
  search?: string;
  category?: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  published_year?: number;
  category?: string;
  description?: string;
}

export type UpdateBookData = Partial<
  Omit<
    Book,
    "id" | "current_borrowing" | "total_borrowings_count" | "created_at"
  >
>;

/**
 * Récupérer la liste des livres.
 */
export async function getBooks(params?: BookFilterParams): Promise<Book[]> {
  const queryParams: Record<string, string> = {};

  if (params?.status && params.status !== "all") {
    queryParams.status = params.status;
  }

  if (params?.search?.trim()) {
    queryParams.search = params.search.trim();
  }

  if (params?.category?.trim()) {
    queryParams.category = params.category.trim();
  }

  const response = await apiClient.get<Book[]>("/books", {
    params: queryParams,
  });

  return response.data;
}

/**
 * Récupérer un livre par son identifiant.
 */
export async function getBookById(id: string | number): Promise<Book> {
  const response = await apiClient.get<Book>(`/books/${id}`);

  return response.data;
}

/**
 * Créer un nouveau livre.
 */
export async function createBook(bookData: CreateBookData): Promise<Book> {
  const response = await apiClient.post<Book>("/books", {
    title: bookData.title.trim(),
    author: bookData.author.trim(),
    isbn: bookData.isbn?.trim() || undefined,
    published_year: bookData.published_year,
    category: bookData.category?.trim() || undefined,
    description: bookData.description?.trim() || undefined,
  });

  return response.data;
}

/**
 * Modifier un livre existant.
 */
export async function updateBook(
  id: string | number,
  bookData: UpdateBookData
): Promise<Book> {
  const response = await apiClient.put<Book>(`/books/${id}`, bookData);

  return response.data;
}

/**
 * Supprimer un livre.
 *
 * La vérification permettant de savoir si le livre peut être
 * supprimé doit être assurée par le backend.
 */
export async function deleteBook(id: string | number): Promise<boolean> {
  await apiClient.delete(`/books/${id}`);

  return true;
}

/**
 * Récupérer l'historique des emprunts d'un livre.
 */
export async function getBookBorrowingHistory(
  bookId: string | number
): Promise<Borrowing[]> {
  const response = await apiClient.get<Borrowing[]>(`/books/${bookId}/history`);

  return response.data;
}
