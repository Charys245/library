import type { Book } from "../types/book";

const API_URL = "http://localhost:8000";

export const getBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_URL}/books`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer les livres");
  }

  return response.json();
};

export const createBook = async (
  title: string,
  author: string
): Promise<Book> => {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      author,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Impossible d'ajouter le livre");
  }

  return response.json();
};

export const borrowBook = async (id: number): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}/borrow`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Impossible d'emprunter le livre");
  }

  return response.json();
};
