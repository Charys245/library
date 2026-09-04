import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookBorrowingHistory,
} from "@/api/books";

import type { BookFilterParams } from "@/api/books";

import {
  getBorrowers,
  getBorrowerById,
  createBorrower,
  updateBorrower,
  getBorrowerHistory,
  getBorrowerActiveBorrowings,
} from "@/api/borrowers";

import {
  getBorrowings,
  createBorrowing,
  returnBorrowing,
  getBorrowingsHistory,
  getManagerDashboardStats,
  getBorrowerDashboardStats,
  getRecentActivities,
} from "@/api/borrowings";

import type { BorrowingFilterParams } from "@/api/borrowings";

import type {
  Book,
  Borrower,
  BorrowerDashboardStats,
  Borrowing,
  ManagerDashboardStats,
  RecentActivity,
} from "@/types";

/* ============================================================
   QUERY KEYS
   ============================================================ */

export const queryKeys = {
  books: {
    all: ["books"] as const,

    list: (params?: BookFilterParams) => ["books", "list", params] as const,

    detail: (id: string | number) => ["books", "detail", String(id)] as const,

    history: (id: string | number) => ["books", "history", String(id)] as const,
  },

  borrowers: {
    all: ["borrowers"] as const,

    list: (search?: string) => ["borrowers", "list", search ?? ""] as const,

    detail: (id: string | number) =>
      ["borrowers", "detail", String(id)] as const,

    history: (id: string | number) =>
      ["borrowers", "history", String(id)] as const,

    active: (id: string | number) =>
      ["borrowers", "active", String(id)] as const,
  },

  borrowings: {
    all: ["borrowings"] as const,

    list: (params?: BorrowingFilterParams) =>
      ["borrowings", "list", params] as const,

    history: (params?: {
      borrower_id?: string | number;
      book_id?: string | number;
    }) => ["borrowings", "history", params] as const,
  },

  stats: {
    manager: ["stats", "manager"] as const,

    borrower: (id: string | number) =>
      ["stats", "borrower", String(id)] as const,
  },

  activities: ["activities"] as const,
};

/* ============================================================
   BOOKS
   ============================================================ */

export function useBooks(params?: BookFilterParams) {
  return useQuery<Book[], Error>({
    queryKey: queryKeys.books.list(params),
    queryFn: () => getBooks(params),
  });
}

export function useBook(id?: string | number) {
  return useQuery<Book, Error>({
    queryKey: queryKeys.books.detail(id ?? ""),
    queryFn: () => getBookById(id!),
    enabled: id !== undefined && id !== null,
  });
}

export function useBookHistory(bookId?: string | number) {
  return useQuery<Borrowing[], Error>({
    queryKey: queryKeys.books.history(bookId ?? ""),
    queryFn: () => getBookBorrowingHistory(bookId!),
    enabled: bookId !== undefined && bookId !== null,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation<
    Book,
    Error,
    {
      title: string;
      author: string;
      isbn?: string;
      published_year?: number;
      category?: string;
      description?: string;
    }
  >({
    mutationFn: createBook,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.books.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.manager,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation<
    Book,
    Error,
    {
      id: string | number;
      data: Partial<Omit<Book, "id" | "current_borrowing">>;
    }
  >({
    mutationFn: ({ id, data }) => updateBook(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.books.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.books.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string | number>({
    mutationFn: deleteBook,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.books.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.manager,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

/* ============================================================
   BORROWERS
   ============================================================ */

export function useBorrowers(search?: string) {
  return useQuery<Borrower[], Error>({
    queryKey: queryKeys.borrowers.list(search),
    queryFn: () => getBorrowers(search),
  });
}

export function useBorrower(id?: string | number) {
  return useQuery<Borrower, Error>({
    queryKey: queryKeys.borrowers.detail(id ?? ""),
    queryFn: () => getBorrowerById(id!),
    enabled: id !== undefined && id !== null,
  });
}

export function useBorrowerHistory(borrowerId?: string | number) {
  return useQuery<Borrowing[], Error>({
    queryKey: queryKeys.borrowers.history(borrowerId ?? ""),
    queryFn: () => getBorrowerHistory(borrowerId!),
    enabled: borrowerId !== undefined && borrowerId !== null,
  });
}

export function useBorrowerActiveBorrowings(borrowerId?: string | number) {
  return useQuery<Borrowing[], Error>({
    queryKey: queryKeys.borrowers.active(borrowerId ?? ""),
    queryFn: () => getBorrowerActiveBorrowings(borrowerId!),
    enabled: borrowerId !== undefined && borrowerId !== null,
  });
}

export function useCreateBorrower() {
  const queryClient = useQueryClient();

  return useMutation<
    Borrower,
    Error,
    {
      name: string;
      email: string;
      phone?: string;
    }
  >({
    mutationFn: createBorrower,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowers.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.manager,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

export function useUpdateBorrower() {
  const queryClient = useQueryClient();

  return useMutation<
    Borrower,
    Error,
    {
      id: string | number;
      data: Partial<
        Omit<
          Borrower,
          "id" | "current_borrowings_count" | "total_borrowings_count"
        >
      >;
    }
  >({
    mutationFn: ({ id, data }) => updateBorrower(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowers.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowers.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

/* ============================================================
   BORROWINGS
   ============================================================ */

export function useBorrowings(params?: BorrowingFilterParams) {
  return useQuery<Borrowing[], Error>({
    queryKey: queryKeys.borrowings.list(params),
    queryFn: () => getBorrowings(params),
  });
}

export function useBorrowingsHistory(params?: {
  borrower_id?: string | number;
  book_id?: string | number;
}) {
  return useQuery<Borrowing[], Error>({
    queryKey: queryKeys.borrowings.history(params),
    queryFn: () => getBorrowingsHistory(params),
  });
}

export function useCreateBorrowing() {
  const queryClient = useQueryClient();

  return useMutation<
    Borrowing,
    Error,
    {
      book_id: string | number;
      borrower_id: string | number;
      due_date?: string;
      notes?: string;
    }
  >({
    mutationFn: createBorrowing,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowings.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.books.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowers.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.manager,
      });

      queryClient.invalidateQueries({
        queryKey: ["stats", "borrower"],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

export function useReturnBorrowing() {
  const queryClient = useQueryClient();

  return useMutation<Borrowing, Error, string | number>({
    mutationFn: returnBorrowing,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowings.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.books.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.borrowers.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.manager,
      });

      queryClient.invalidateQueries({
        queryKey: ["stats", "borrower"],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.activities,
      });
    },
  });
}

/* ============================================================
   DASHBOARD & STATISTICS
   ============================================================ */

export function useManagerStats() {
  return useQuery<ManagerDashboardStats, Error>({
    queryKey: queryKeys.stats.manager,
    queryFn: getManagerDashboardStats,
  });
}

export function useBorrowerStats(borrowerId?: string | number) {
  return useQuery<BorrowerDashboardStats, Error>({
    queryKey: queryKeys.stats.borrower(borrowerId ?? ""),
    queryFn: () => getBorrowerDashboardStats(borrowerId!),
    enabled: borrowerId !== undefined && borrowerId !== null,
  });
}

export function useActivities() {
  return useQuery<RecentActivity[], Error>({
    queryKey: queryKeys.activities,
    queryFn: getRecentActivities,
  });
}
