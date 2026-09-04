import axios from "axios";
import type { Book, Borrower, Borrowing, RecentActivity } from "@/types";
import {
  INITIAL_BOOKS,
  INITIAL_BORROWERS,
  INITIAL_BORROWINGS,
  INITIAL_ACTIVITIES,
} from "./mockData";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Configured Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const STORAGE_KEY_BOOKS = "lms_books_v1";
const STORAGE_KEY_BORROWERS = "lms_borrowers_v1";
const STORAGE_KEY_BORROWINGS = "lms_borrowings_v1";
const STORAGE_KEY_ACTIVITIES = "lms_activities_v1";

// Local storage management to provide reactive preview state & fallback
export function getStoredBooks(): Book[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BOOKS;
  }
}

export function saveStoredBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error("Error saving books to storage", e);
  }
}

export function getStoredBorrowers(): Borrower[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BORROWERS);
    if (!data) {
      localStorage.setItem(
        STORAGE_KEY_BORROWERS,
        JSON.stringify(INITIAL_BORROWERS)
      );
      return INITIAL_BORROWERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BORROWERS;
  }
}

export function saveStoredBorrowers(borrowers: Borrower[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BORROWERS, JSON.stringify(borrowers));
  } catch (e) {
    console.error("Error saving borrowers to storage", e);
  }
}

export function getStoredBorrowings(): Borrowing[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BORROWINGS);
    if (!data) {
      localStorage.setItem(
        STORAGE_KEY_BORROWINGS,
        JSON.stringify(INITIAL_BORROWINGS)
      );
      return INITIAL_BORROWINGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BORROWINGS;
  }
}

export function saveStoredBorrowings(borrowings: Borrowing[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BORROWINGS, JSON.stringify(borrowings));
  } catch (e) {
    console.error("Error saving borrowings to storage", e);
  }
}

export function getStoredActivities(): RecentActivity[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!data) {
      localStorage.setItem(
        STORAGE_KEY_ACTIVITIES,
        JSON.stringify(INITIAL_ACTIVITIES)
      );
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

export function addStoredActivity(activity: Omit<RecentActivity, "id">): void {
  try {
    const activities = getStoredActivities();
    const newActivity: RecentActivity = {
      ...activity,
      id: "act-" + Date.now(),
    };
    const updated = [newActivity, ...activities].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving activity to storage", e);
  }
}

// Reset data to defaults
export function resetToDefaults(): void {
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(
    STORAGE_KEY_BORROWERS,
    JSON.stringify(INITIAL_BORROWERS)
  );
  localStorage.setItem(
    STORAGE_KEY_BORROWINGS,
    JSON.stringify(INITIAL_BORROWINGS)
  );
  localStorage.setItem(
    STORAGE_KEY_ACTIVITIES,
    JSON.stringify(INITIAL_ACTIVITIES)
  );
}

// Simulated brief delay for realistic smooth loading states (100ms)
export const delay = (ms = 120) =>
  new Promise((resolve) => setTimeout(resolve, ms));
