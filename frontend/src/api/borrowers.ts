import type { Borrower, Borrowing } from "@/types";
import {
  apiClient,
  getStoredBorrowers,
  saveStoredBorrowers,
  getStoredBorrowings,
  addStoredActivity,
  delay,
} from "./client";

export async function getBorrowers(search?: string): Promise<Borrower[]> {
  try {
    const res = await apiClient.get<Borrower[]>("/api/borrowers", {
      params: search ? { search } : undefined,
    });
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  let borrowers = getStoredBorrowers();
  const borrowings = getStoredBorrowings();

  // Recalculate dynamic counts
  borrowers = borrowers.map((b) => {
    const userBorrowings = borrowings.filter(
      (bw) => String(bw.borrower_id) === String(b.id)
    );
    const activeCount = userBorrowings.filter(
      (bw) => bw.status === "active" || bw.status === "overdue"
    ).length;
    return {
      ...b,
      current_borrowings_count: activeCount,
      total_borrowings_count: userBorrowings.length,
    };
  });

  if (search) {
    const s = search.toLowerCase();
    borrowers = borrowers.filter(
      (b) =>
        b.name.toLowerCase().includes(s) || b.email.toLowerCase().includes(s)
    );
  }

  return borrowers;
}

export async function getBorrowerById(id: string | number): Promise<Borrower> {
  try {
    const res = await apiClient.get<Borrower>(`/api/borrowers/${id}`);
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const borrowers = getStoredBorrowers();
  const found = borrowers.find((b) => String(b.id) === String(id));
  if (!found) {
    throw new Error(`Emprunteur introuvable (${id})`);
  }

  const borrowings = getStoredBorrowings().filter(
    (bw) => String(bw.borrower_id) === String(id)
  );
  const activeCount = borrowings.filter(
    (bw) => bw.status === "active" || bw.status === "overdue"
  ).length;

  return {
    ...found,
    current_borrowings_count: activeCount,
    total_borrowings_count: borrowings.length,
  };
}

export async function createBorrower(data: {
  name: string;
  email: string;
  phone?: string;
}): Promise<Borrower> {
  try {
    const res = await apiClient.post<Borrower>("/api/borrowers", data);
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const borrowers = getStoredBorrowers();

  // Check unique email
  if (
    borrowers.some((b) => b.email.toLowerCase() === data.email.toLowerCase())
  ) {
    throw new Error("Un emprunteur avec cette adresse email existe déjà.");
  }

  const newBorrower: Borrower = {
    id: "bor-" + Date.now(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || undefined,
    membership_date: new Date().toISOString().split("T")[0],
    status: "active",
    current_borrowings_count: 0,
    total_borrowings_count: 0,
    created_at: new Date().toISOString(),
  };

  saveStoredBorrowers([newBorrower, ...borrowers]);

  addStoredActivity({
    type: "borrower_registered",
    title: "Nouvel emprunteur inscrit",
    description: `${newBorrower.name} (${newBorrower.email})`,
    timestamp: new Date().toISOString(),
    borrower_id: newBorrower.id,
  });

  return newBorrower;
}

export async function updateBorrower(
  id: string | number,
  data: Partial<
    Omit<Borrower, "id" | "current_borrowings_count" | "total_borrowings_count">
  >
): Promise<Borrower> {
  try {
    const res = await apiClient.put<Borrower>(`/api/borrowers/${id}`, data);
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const borrowers = getStoredBorrowers();
  const index = borrowers.findIndex((b) => String(b.id) === String(id));
  if (index === -1) {
    throw new Error("Emprunteur non trouvé");
  }

  const updated: Borrower = {
    ...borrowers[index],
    ...data,
    id: borrowers[index].id,
  };

  borrowers[index] = updated;
  saveStoredBorrowers(borrowers);
  return updated;
}

export async function getBorrowerHistory(
  borrowerId: string | number
): Promise<Borrowing[]> {
  try {
    const res = await apiClient.get<Borrowing[]>(
      `/api/borrowers/${borrowerId}/history`
    );
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fallback
  }

  await delay();
  const all = getStoredBorrowings();
  return all
    .filter((bw) => String(bw.borrower_id) === String(borrowerId))
    .sort(
      (a, b) =>
        new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
    );
}

export async function getBorrowerActiveBorrowings(
  borrowerId: string | number
): Promise<Borrowing[]> {
  const history = await getBorrowerHistory(borrowerId);
  return history.filter(
    (bw) => bw.status === "active" || bw.status === "overdue"
  );
}
