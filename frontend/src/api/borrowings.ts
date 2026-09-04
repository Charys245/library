// import {
//   Borrowing,
//   ManagerDashboardStats,
//   BorrowerDashboardStats,
//   RecentActivity,
// } from "@/types";
import type { BorrowerDashboardStats, Borrowing, ManagerDashboardStats, RecentActivity } from "@/types";
import {
  apiClient,
  getStoredBooks,
  saveStoredBooks,
  getStoredBorrowers,
  getStoredBorrowings,
  saveStoredBorrowings,
  getStoredActivities,
  addStoredActivity,
  delay,
} from "./client";

export interface BorrowingFilterParams {
  status?: "all" | "active" | "returned" | "overdue";
  borrower_id?: string | number;
  book_id?: string | number;
  search?: string;
}

export async function getBorrowings(
  params?: BorrowingFilterParams
): Promise<Borrowing[]> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.status && params.status !== "all")
      queryParams.status = params.status;
    if (params?.borrower_id)
      queryParams.borrower_id = String(params.borrower_id);
    if (params?.book_id) queryParams.book_id = String(params.book_id);
    if (params?.search) queryParams.search = params.search;

    const res = await apiClient.get<Borrowing[]>("/api/borrowings", {
      params: queryParams,
    });
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  let borrowings = getStoredBorrowings();

  // Dynamic overdue computation for items not yet returned
  const todayStr = new Date().toISOString().split("T")[0];
  borrowings = borrowings.map((bw) => {
    if (!bw.returned_at && bw.due_date < todayStr) {
      return { ...bw, status: "overdue" as const };
    }
    return bw;
  });

  if (params?.status && params.status !== "all") {
    if (params.status === "active") {
      borrowings = borrowings.filter(
        (bw) => bw.status === "active" || bw.status === "overdue"
      );
    } else {
      borrowings = borrowings.filter((bw) => bw.status === params.status);
    }
  }

  if (params?.borrower_id) {
    borrowings = borrowings.filter(
      (bw) => String(bw.borrower_id) === String(params.borrower_id)
    );
  }

  if (params?.book_id) {
    borrowings = borrowings.filter(
      (bw) => String(bw.book_id) === String(params.book_id)
    );
  }

  if (params?.search) {
    const s = params.search.toLowerCase();
    borrowings = borrowings.filter(
      (bw) =>
        bw.book_title.toLowerCase().includes(s) ||
        bw.borrower_name.toLowerCase().includes(s) ||
        (bw.borrower_email && bw.borrower_email.toLowerCase().includes(s))
    );
  }

  return borrowings.sort(
    (a, b) =>
      new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
  );
}

export async function createBorrowing(data: {
  book_id: string | number;
  borrower_id: string | number;
  due_date?: string;
  notes?: string;
}): Promise<Borrowing> {
  try {
    const res = await apiClient.post<Borrowing>("/api/borrowings", data);
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const books = getStoredBooks();
  const borrowers = getStoredBorrowers();
  const borrowings = getStoredBorrowings();

  const bookIndex = books.findIndex(
    (b) => String(b.id) === String(data.book_id)
  );
  if (bookIndex === -1) {
    throw new Error("Livre introuvable.");
  }

  const book = books[bookIndex];

  // Business rule: Un livre emprunté ne peut pas être emprunté.
  if (book.status === "borrowed" || book.current_borrowing) {
    throw new Error("Ce livre est déjà actuellement emprunté.");
  }

  const borrower = borrowers.find(
    (b) => String(b.id) === String(data.borrower_id)
  );
  if (!borrower) {
    throw new Error("Emprunteur introuvable.");
  }

  if (borrower.status === "suspended") {
    throw new Error("Le compte de cet emprunteur est suspendu.");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  // Default due date: 21 days from now
  const defaultDueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const finalDueDate = data.due_date || defaultDueDate;

  const newBorrowingId = "bw-" + Date.now();

  const newBorrowing: Borrowing = {
    id: newBorrowingId,
    book_id: book.id,
    book_title: book.title,
    book_author: book.author,
    borrower_id: borrower.id,
    borrower_name: borrower.name,
    borrower_email: borrower.email,
    borrowed_at: todayStr,
    due_date: finalDueDate,
    returned_at: null,
    status: "active",
    notes: data.notes,
  };

  // Update book state
  books[bookIndex] = {
    ...book,
    status: "borrowed",
    current_borrowing: {
      id: newBorrowing.id,
      borrower_id: borrower.id,
      borrower_name: borrower.name,
      borrower_email: borrower.email,
      borrowed_at: todayStr,
      due_date: finalDueDate,
    },
    total_borrowings_count: (book.total_borrowings_count || 0) + 1,
  };

  saveStoredBooks(books);
  saveStoredBorrowings([newBorrowing, ...borrowings]);

  addStoredActivity({
    type: "borrow",
    title: "Nouvel emprunt enregistré",
    description: `${borrower.name} a emprunté "${book.title}"`,
    timestamp: new Date().toISOString(),
    book_id: book.id,
    borrower_id: borrower.id,
  });

  return newBorrowing;
}

export async function returnBorrowing(
  borrowingId: string | number
): Promise<Borrowing> {
  try {
    const res = await apiClient.post<Borrowing>(
      `/api/borrowings/${borrowingId}/return`
    );
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const borrowings = getStoredBorrowings();
  const books = getStoredBooks();

  const borrowingIndex = borrowings.findIndex(
    (bw) => String(bw.id) === String(borrowingId)
  );
  if (borrowingIndex === -1) {
    throw new Error("Emprunt introuvable.");
  }

  const currentBw = borrowings[borrowingIndex];
  if (currentBw.returned_at || currentBw.status === "returned") {
    throw new Error("Cet emprunt a déjà été retourné.");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const updatedBorrowing: Borrowing = {
    ...currentBw,
    returned_at: todayStr,
    status: "returned",
  };

  borrowings[borrowingIndex] = updatedBorrowing;
  saveStoredBorrowings(borrowings);

  // Business rule: Le retour rend automatiquement le livre disponible.
  const bookIndex = books.findIndex(
    (b) => String(b.id) === String(currentBw.book_id)
  );
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      status: "available",
      current_borrowing: null,
    };
    saveStoredBooks(books);
  }

  addStoredActivity({
    type: "return",
    title: "Retour enregistré",
    description: `Le livre "${currentBw.book_title}" a été retourné par ${currentBw.borrower_name}`,
    timestamp: new Date().toISOString(),
    book_id: currentBw.book_id,
    borrower_id: currentBw.borrower_id,
  });

  return updatedBorrowing;
}

export async function getBorrowingsHistory(params?: {
  borrower_id?: string | number;
  book_id?: string | number;
}): Promise<Borrowing[]> {
  const all = await getBorrowings({
    status: "returned",
    borrower_id: params?.borrower_id,
    book_id: params?.book_id,
  });
  return all;
}

export async function getManagerDashboardStats(): Promise<ManagerDashboardStats> {
  await delay(80);
  const books = getStoredBooks();
  const borrowers = getStoredBorrowers();
  const borrowings = getStoredBorrowings();

  const todayStr = new Date().toISOString().split("T")[0];
  const activeBorrowings = borrowings.filter((bw) => !bw.returned_at);
  const overdueBorrowings = activeBorrowings.filter(
    (bw) => bw.due_date < todayStr
  );

  return {
    total_books: books.length,
    available_books: books.filter((b) => b.status === "available").length,
    borrowed_books: books.filter((b) => b.status === "borrowed").length,
    active_borrowings: activeBorrowings.length,
    total_borrowers: borrowers.length,
    overdue_borrowings: overdueBorrowings.length,
  };
}

export async function getBorrowerDashboardStats(
  borrowerId: string | number
): Promise<BorrowerDashboardStats> {
  await delay(80);
  const borrowings = getStoredBorrowings().filter(
    (bw) => String(bw.borrower_id) === String(borrowerId)
  );
  const todayStr = new Date().toISOString().split("T")[0];

  const active = borrowings.filter((bw) => !bw.returned_at);
  const overdue = active.filter((bw) => bw.due_date < todayStr);
  const upcoming = active.filter((bw) => bw.due_date >= todayStr);
  const returned = borrowings.filter((bw) => !!bw.returned_at);

  return {
    my_active_borrowings: active.length,
    upcoming_returns: upcoming.length,
    overdue_borrowings: overdue.length,
    total_read: returned.length,
  };
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  await delay(80);
  return getStoredActivities();
}
