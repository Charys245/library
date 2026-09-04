import { useState } from "react";
import { borrowBook } from "../services/bookService";

export const useBorrowings = (onSuccess?: () => void) => {
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borrow = async (bookId: number) => {
    try {
      setIsBorrowing(true);
      setError(null);

      await borrowBook(bookId);

      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsBorrowing(false);
    }
  };

  return {
    borrow,
    isBorrowing,
    error,
  };
};
