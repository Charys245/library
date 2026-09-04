export type BookStatus = 'available' | 'borrowed';
export type BorrowingStatus = 'active' | 'returned' | 'overdue';
export type UserRole = 'manager' | 'borrower';

export interface Book {
  id: string | number;
  title: string;
  author: string;
  isbn?: string;
  published_year?: number;
  category?: string;
  description?: string;
  status: BookStatus;
  // current_borrowing?: {
  //   id: string | number;
  //   borrower_id: string | number;
  //   borrower_name: string;
  //   borrower_email?: string;
  //   borrowed_at: string;
  //   due_date: string;
  // } | null;
  // total_borrowings_count?: number;
  created_at?: string;
}

export interface Borrower {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  membership_date?: string;
  status: 'active' | 'suspended';
  current_borrowings_count: number;
  total_borrowings_count: number;
  created_at?: string;
}

export interface Borrowing {
  id: string | number;
  book_id: string | number;
  book_title: string;
  book_author?: string;
  borrower_id: string | number;
  borrower_name: string;
  borrower_email?: string;
  borrowed_at: string;
  due_date: string;
  returned_at?: string | null;
  status: BorrowingStatus;
  notes?: string;
}

export interface ManagerDashboardStats {
  total_books: number;
  available_books: number;
  borrowed_books: number;
  active_borrowings: number;
  total_borrowers: number;
  overdue_borrowings: number;
}

export interface BorrowerDashboardStats {
  my_active_borrowings: number;
  upcoming_returns: number;
  overdue_borrowings: number;
  total_read: number;
}

export interface RecentActivity {
  id: string;
  type: 'borrow' | 'return' | 'book_added' | 'borrower_registered';
  title: string;
  description: string;
  timestamp: string;
  book_id?: string | number;
  borrower_id?: string | number;
}
