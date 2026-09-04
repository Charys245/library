import { useCallback, useEffect, useState } from "react";
import { getBooks } from "../services/bookService";
import type { Book } from "../types/book";

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    isLoading,
    error,
    fetchBooks,
  };
};
