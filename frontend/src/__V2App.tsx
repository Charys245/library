import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Clock,
  History,
  LayoutDashboard,
  Search,
  Plus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Filter,
  MoreVertical,
  LogOut,
  Shield,
  User as UserIcon,
  BookMarked,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  Trash2,
  Edit3,
  Bookmark,
  ExternalLink,
} from "lucide-react";

// --- TYPES ---
type UserRole = "manager" | "borrower";
type BookStatus = "available" | "borrowed";
type BorrowingStatus = "active" | "overdue" | "returned";

interface Borrower {
  id: number;
  name: string;
  email: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  borrowerId?: number;
  borrowedAt?: string;
  returnDueAt?: string;
  addedAt?: string;
}

interface Borrowing {
  id: number;
  book: Book;
  borrower: Borrower;
  borrowedAt: string;
  returnDueAt: string;
  returnedAt?: string;
  status: BorrowingStatus;
}

// --- MOCK DATA ---
const INITIAL_BORROWERS: Borrower[] = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@library.io" },
  { id: 2, name: "Marie K.", email: "marie.k@library.io" },
  { id: 3, name: "Thomas Bernard", email: "thomas.b@library.io" },
  { id: 4, name: "Sophie Martin", email: "sophie.m@library.io" },
];

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: "Clean Architecture",
    author: "Robert C. Martin",
    status: "borrowed",
    borrowerId: 1,
    borrowedAt: "2026-09-01",
    returnDueAt: "2026-09-15",
    addedAt: "2026-08-10",
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    status: "available",
    addedAt: "2026-08-12",
  },
  {
    id: 3,
    title: "Design Patterns",
    author: "Erich Gamma",
    status: "available",
    addedAt: "2026-08-15",
  },
  {
    id: 4,
    title: "Refactoring",
    author: "Martin Fowler",
    status: "borrowed",
    borrowerId: 2,
    borrowedAt: "2026-08-20",
    returnDueAt: "2026-09-03",
    addedAt: "2026-08-18",
  },
  {
    id: 5,
    title: "Domain-Driven Design",
    author: "Eric Evans",
    status: "available",
    addedAt: "2026-08-22",
  },
  {
    id: 6,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    status: "available",
    addedAt: "2026-08-25",
  },
];

const INITIAL_BORROWINGS: Borrowing[] = [
  {
    id: 101,
    book: INITIAL_BOOKS[0],
    borrower: INITIAL_BORROWERS[0],
    borrowedAt: "2026-09-01",
    returnDueAt: "2026-09-15",
    status: "active",
  },
  {
    id: 102,
    book: INITIAL_BOOKS[3],
    borrower: INITIAL_BORROWERS[1],
    borrowedAt: "2026-08-20",
    returnDueAt: "2026-09-03",
    status: "active",
  },
  {
    id: 103,
    book: {
      id: 99,
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      status: "returned",
    },
    borrower: INITIAL_BORROWERS[2],
    borrowedAt: "2026-08-01",
    returnDueAt: "2026-08-15",
    returnedAt: "2026-08-14",
    status: "returned",
  },
];

export default function App() {
  // Navigation & Auth State
  const [role, setRole] = useState<UserRole>("manager");
  const [currentPath, setCurrentPath] = useState<string>("/manager");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  // Core Data State
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [borrowers] = useState<Borrower[]>(INITIAL_BORROWERS);
  const [borrowings, setBorrowings] = useState<Borrowing[]>(INITIAL_BORROWINGS);
  const [currentUserId, setCurrentUserId] = useState<number>(1); // Jean Dupont by default for borrower

  // UI Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modals & Drawers state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [borrowingToReturn, setBorrowingToReturn] = useState<Borrowing | null>(
    null
  );
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handlers for Books
  const handleAddBook = (title: string, author: string) => {
    const newBook: Book = {
      id: Date.now(),
      title,
      author,
      status: "available",
      addedAt: new Date().toISOString().split("T")[0],
    };
    setBooks([newBook, ...books]);
    setIsAddBookOpen(false);
    showToast("Livre ajouté avec succès au catalogue.");
  };

  const handleEditBook = (id: number, title: string, author: string) => {
    setBooks(books.map((b) => (b.id === id ? { ...b, title, author } : b)));
    setBookToEdit(null);
    showToast("Livre mis à jour avec succès.");
  };

  const handleDeleteBook = (book: Book) => {
    if (book.status === "borrowed") {
      showToast(
        "Impossible de supprimer ce livre car il est actuellement emprunté.",
        "error"
      );
      return;
    }
    setBooks(books.filter((b) => b.id !== book.id));
    setBookToDelete(null);
    showToast("Livre supprimé du catalogue.");
  };

  const handleCreateBorrowing = (
    bookId: number,
    borrowerId: number,
    returnDueAt: string
  ) => {
    const targetBook = books.find((b) => b.id === bookId);
    const targetBorrower = borrowers.find((br) => br.id === borrowerId);
    if (!targetBook || !targetBorrower) return;

    const updatedBook: Book = {
      ...targetBook,
      status: "borrowed",
      borrowerId: targetBorrower.id,
      borrowedAt: new Date().toISOString().split("T")[0],
      returnDueAt,
    };

    setBooks(books.map((b) => (b.id === bookId ? updatedBook : b)));

    const newBorrowing: Borrowing = {
      id: Date.now(),
      book: updatedBook,
      borrower: targetBorrower,
      borrowedAt: updatedBook.borrowedAt!,
      returnDueAt,
      status: "active",
    };

    setBorrowings([newBorrowing, ...borrowings]);
    setIsBorrowModalOpen(false);
    setBookToBorrow(null);
    showToast("Emprunt enregistré avec succès.");
  };

  const handleReturnBook = (borrowing: Borrowing) => {
    const today = new Date().toISOString().split("T")[0];

    // Update Book
    setBooks(
      books.map((b) => {
        if (b.id === borrowing.book.id) {
          return {
            ...b,
            status: "available",
            borrowerId: undefined,
            borrowedAt: undefined,
            returnDueAt: undefined,
          };
        }
        return b;
      })
    );

    // Update Borrowing
    setBorrowings(
      borrowings.map((bor) => {
        if (bor.id === borrowing.id) {
          return {
            ...bor,
            status: "returned",
            returnedAt: today,
          };
        }
        return bor;
      })
    );

    setIsReturnModalOpen(false);
    setBorrowingToReturn(null);
    showToast("Livre retourné avec succès. Statut mis à jour.");
  };

  // Navigation Helper
  const navigate = (path: string, bookId?: number) => {
    setCurrentPath(path);
    if (bookId !== undefined) {
      setSelectedBookId(bookId);
    } else {
      setSelectedBookId(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl border border-neutral-800 animate-in fade-in slide-in-from-bottom-4">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Role Switcher Bar (Top Banner for demo convenience) */}
      <div className="bg-neutral-900 text-neutral-200 px-4 py-2 text-xs flex justify-between items-center border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">Mode de démonstration SaaS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Rôle actuel :</span>
          <div className="inline-flex bg-neutral-800 p-0.5 rounded-md">
            <button
              onClick={() => {
                setRole("manager");
                navigate("/manager");
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                role === "manager"
                  ? "bg-neutral-700 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Gérant
            </button>
            <button
              onClick={() => {
                setRole("borrower");
                navigate("/borrower");
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                role === "borrower"
                  ? "bg-neutral-700 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Emprunteur (Jean Dupont)
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-37px)] overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between hi bdden md:flex">
          <div>
            {/* Logo */}
            <div className="h-16 px-6 flex items-center border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-sm tracking-tighter">
                  LB
                </div>
                <div>
                  <span className="font-semibold text-sm tracking-wide block">
                    LIBRARY
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">
                    {role === "manager" ? "Administration" : "Espace Membre"}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {role === "manager" ? (
                <>
                  <SidebarItem
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="Tableau de bord"
                    active={currentPath === "/manager"}
                    onClick={() => navigate("/manager")}
                  />
                  <SidebarItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Livres & Catalogue"
                    active={currentPath.startsWith("/manager/books")}
                    onClick={() => navigate("/manager/books")}
                  />
                  <SidebarItem
                    icon={<Users className="w-4 h-4" />}
                    label="Emprunteurs"
                    active={currentPath === "/manager/borrowers"}
                    onClick={() => navigate("/manager/borrowers")}
                  />
                  <SidebarItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Emprunts en cours"
                    active={currentPath === "/manager/borrowings"}
                    onClick={() => navigate("/manager/borrowings")}
                  />
                  <SidebarItem
                    icon={<History className="w-4 h-4" />}
                    label="Historique complet"
                    active={currentPath === "/manager/history"}
                    onClick={() => navigate("/manager/history")}
                  />
                </>
              ) : (
                <>
                  <SidebarItem
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="Tableau de bord"
                    active={currentPath === "/borrower"}
                    onClick={() => navigate("/borrower")}
                  />
                  <SidebarItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Catalogue"
                    active={currentPath.startsWith("/borrower/catalog")}
                    onClick={() => navigate("/borrower/catalog")}
                  />
                  <SidebarItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Mes emprunts"
                    active={currentPath === "/borrower/borrowings"}
                    onClick={() => navigate("/borrower/borrowings")}
                  />
                  <SidebarItem
                    icon={<History className="w-4 h-4" />}
                    label="Mon historique"
                    active={currentPath === "/borrower/history"}
                    onClick={() => navigate("/borrower/history")}
                  />
                </>
              )}
            </nav>
          </div>

          {/* User Profile Footer in Sidebar */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-medium text-xs text-neutral-700">
                {role === "manager" ? "AD" : "JD"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900 truncate">
                  {role === "manager" ? "Administrateur" : "Jean Dupont"}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {role === "manager"
                    ? "admin@library.io"
                    : "jean.dupont@library.io"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* HEADER */}
          <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-neutral-500 hidden md:block">
                Bibliothèque Municipale & SaaS
              </div>
            </div>
            <div className="flex items-center gap-3">
              {role === "manager" && (
                <button
                  onClick={() => setIsBorrowModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvel emprunt</span>
                </button>
              )}
              <div className="h-4 w-px bg-neutral-200 mx-1"></div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                {role === "manager" ? "Vue Gérant" : "Vue Emprunteur"}
              </span>
            </div>
          </header>

          {/* VIEW RENDERER */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {/* --- MANAGER ROUTES --- */}
              {role === "manager" && currentPath === "/manager" && (
                <ManagerDashboard
                  books={books}
                  borrowers={borrowers}
                  borrowings={borrowings}
                  navigate={navigate}
                  setIsAddBookOpen={setIsAddBookOpen}
                />
              )}

              {role === "manager" && currentPath === "/manager/books" && (
                <ManagerBooks
                  books={books}
                  borrowers={borrowers}
                  navigate={navigate}
                  setIsAddBookOpen={setIsAddBookOpen}
                  setBookToEdit={setBookToEdit}
                  setBookToDelete={setBookToDelete}
                />
              )}

              {role === "manager" &&
                currentPath.startsWith("/manager/books/") && (
                  <BookDetailsView
                    bookId={selectedBookId!}
                    books={books}
                    borrowers={borrowers}
                    borrowings={borrowings}
                    role="manager"
                    navigate={navigate}
                    setBookToEdit={setBookToEdit}
                    setBookToDelete={setBookToDelete}
                    setIsReturnModalOpen={(b) => {
                      setBorrowingToReturn(b);
                      setIsReturnModalOpen(true);
                    }}
                  />
                )}

              {role === "manager" && currentPath === "/manager/borrowers" && (
                <ManagerBorrowers
                  borrowers={borrowers}
                  borrowings={borrowings}
                  books={books}
                />
              )}

              {role === "manager" && currentPath === "/manager/borrowings" && (
                <ManagerBorrowings
                  borrowings={borrowings}
                  onReturn={(b) => {
                    setBorrowingToReturn(b);
                    setIsReturnModalOpen(true);
                  }}
                />
              )}

              {role === "manager" && currentPath === "/manager/history" && (
                <ManagerHistory borrowings={borrowings} />
              )}

              {/* --- BORROWER ROUTES --- */}
              {role === "borrower" && currentPath === "/borrower" && (
                <BorrowerDashboard
                  books={books}
                  borrowings={borrowings}
                  currentUserId={currentUserId}
                  navigate={navigate}
                />
              )}

              {role === "borrower" && currentPath === "/borrower/catalog" && (
                <BorrowerCatalog
                  books={books}
                  navigate={navigate}
                  onBorrowClick={(book) => {
                    setBookToBorrow(book);
                  }}
                />
              )}

              {role === "borrower" &&
                currentPath.startsWith("/borrower/catalog/") && (
                  <BookDetailsView
                    bookId={selectedBookId!}
                    books={books}
                    borrowers={borrowers}
                    borrowings={borrowings}
                    role="borrower"
                    navigate={navigate}
                    onBorrowClick={(book) => {
                      setBookToBorrow(book);
                    }}
                  />
                )}

              {role === "borrower" &&
                currentPath === "/borrower/borrowings" && (
                  <MyBorrowings
                    borrowings={borrowings}
                    currentUserId={currentUserId}
                  />
                )}

              {role === "borrower" && currentPath === "/borrower/history" && (
                <MyHistory
                  borrowings={borrowings}
                  currentUserId={currentUserId}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* --- MODALS & DIALOGS --- */}
      {isAddBookOpen && (
        <AddBookModal
          onClose={() => setIsAddBookOpen(false)}
          onAdd={handleAddBook}
        />
      )}

      {bookToEdit && (
        <EditBookModal
          book={bookToEdit}
          onClose={() => setBookToEdit(null)}
          onUpdate={handleEditBook}
        />
      )}

      {bookToDelete && (
        <DeleteBookDialog
          book={bookToDelete}
          borrowers={borrowers}
          onClose={() => setBookToDelete(null)}
          onConfirm={() => handleDeleteBook(bookToDelete)}
        />
      )}

      {isBorrowModalOpen && (
        <BorrowBookModal
          books={books}
          borrowers={borrowers}
          onClose={() => setIsBorrowModalOpen(false)}
          onSubmit={handleCreateBorrowing}
        />
      )}

      {bookToBorrow && (
        <BorrowerConfirmModal
          book={bookToBorrow}
          borrowerName={
            borrowers.find((b) => b.id === currentUserId)?.name || "Jean Dupont"
          }
          onClose={() => setBookToBorrow(null)}
          onConfirm={() => {
            const defaultDue = new Date();
            defaultDue.setDate(defaultDue.getDate() + 14);
            handleCreateBorrowing(
              bookToBorrow.id,
              currentUserId,
              defaultDue.toISOString().split("T")[0]
            );
          }}
        />
      )}

      {isReturnModalOpen && borrowingToReturn && (
        <ReturnBookDialog
          borrowing={borrowingToReturn}
          onClose={() => {
            setIsReturnModalOpen(false);
            setBorrowingToReturn(null);
          }}
          onConfirm={() => handleReturnBook(borrowingToReturn)}
        />
      )}
    </div>
  );
}

// --- SIDEBAR ITEM COMPONENT ---
function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-neutral-900 text-white shadow-sm"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <span className={active ? "text-white" : "text-neutral-500"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// --- BADGES ---
function BookStatusBadge({ status }: { status: BookStatus }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Disponible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Emprunté
    </span>
  );
}

function BorrowingStatusBadge({ status }: { status: BorrowingStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        En cours
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        En retard
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
      Retourné
    </span>
  );
}

// ==========================================
// MANAGER VIEWS
// ==========================================

function ManagerDashboard({
  books,
  borrowers,
  borrowings,
  navigate,
  setIsAddBookOpen,
}: {
  books: Book[];
  borrowers: Borrower[];
  borrowings: Borrowing[];
  navigate: (p: string) => void;
  setIsAddBookOpen: (v: boolean) => void;
}) {
  const totalBooks = books.length;
  const availableBooks = books.filter((b) => b.status === "available").length;
  const borrowedBooks = books.filter((b) => b.status === "borrowed").length;
  const activeBorrowingsCount = borrowings.filter(
    (b) => b.status === "active"
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Bonjour, Administrateur
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Voici un aperçu global de l'activité de votre bibliothèque.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddBookOpen(true)}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un livre</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Total livres
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {totalBooks}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              Catalogue actif
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Disponibles
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {availableBooks}
            </span>
            <span className="text-xs text-neutral-500">
              {Math.round((availableBooks / (totalBooks || 1)) * 100)}% du total
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Emprunts en cours
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {activeBorrowingsCount}
            </span>
            <span className="text-xs text-blue-600 font-medium">Actifs</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Emprunteurs
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {borrowers.length}
            </span>
            <span className="text-xs text-neutral-500">Membres inscrits</span>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Borrowings List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Emprunts récents
            </h3>
            <button
              onClick={() => navigate("/manager/borrowings")}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {borrowings.slice(0, 5).map((borrowing) => (
              <div
                key={borrowing.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-neutral-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center font-medium text-xs text-neutral-700">
                    {borrowing.book.title.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">
                      {borrowing.book.title}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Emprunté par{" "}
                      <span className="font-medium text-neutral-700">
                        {borrowing.borrower.name}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-500">
                    {borrowing.borrowedAt}
                  </span>
                  <BorrowingStatusBadge status={borrowing.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added Books (1 col) */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Livres récents
            </h3>
            <button
              onClick={() => navigate("/manager/books")}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition"
            >
              <span>Catalogue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100 flex-1">
            {books.slice(0, 4).map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/manager/books/${book.id}`, book.id)}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-neutral-900 truncate">
                    {book.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {book.author}
                  </p>
                </div>
                <BookStatusBadge status={book.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagerBooks({
  books,
  borrowers,
  navigate,
  setIsAddBookOpen,
  setBookToEdit,
  setBookToDelete,
}: {
  books: Book[];
  borrowers: Borrower[];
  navigate: (p: string, id?: number) => void;
  setIsAddBookOpen: (v: boolean) => void;
  setBookToEdit: (b: Book) => void;
  setBookToDelete: (b: Book) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "borrowed"
  >("all");

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Livres
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gérez le catalogue complet de votre bibliothèque.
          </p>
        </div>
        <button
          onClick={() => setIsAddBookOpen(true)}
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un livre</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un titre ou un auteur..."
            className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 transition"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-lg">
          {(["all", "available", "borrowed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                statusFilter === filter
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {filter === "all"
                ? "Tous"
                : filter === "available"
                ? "Disponibles"
                : "Empruntés"}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Livre</th>
                <th className="px-6 py-3.5">Auteur</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5">Emprunteur</th>
                <th className="px-6 py-3.5">Emprunté le</th>
                <th className="px-6 py-3.5">Retour prévu</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    Aucun livre trouvé dans le catalogue.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const borrower = borrowers.find(
                    (b) => b.id === book.borrowerId
                  );
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-neutral-50/85 transition cursor-pointer"
                      onClick={() =>
                        navigate(`/manager/books/${book.id}`, book.id)
                      }
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {book.author}
                      </td>
                      <td className="px-6 py-4">
                        <BookStatusBadge status={book.status} />
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {borrower ? borrower.name : "—"}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {book.borrowedAt || "—"}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {book.returnDueAt || "—"}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setBookToEdit(book)}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManagerBorrowers({
  borrowers,
  borrowings,
  books,
}: {
  borrowers: Borrower[];
  borrowings: Borrowing[];
  books: Book[];
}) {
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(
    null
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Emprunteurs
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Consultez la liste des membres et leurs emprunts associés.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {borrowers.map((borrower) => {
          const activeCount = books.filter(
            (b) => b.borrowerId === borrower.id
          ).length;
          const totalHistoryCount = borrowings.filter(
            (b) => b.borrower.id === borrower.id
          ).length;

          return (
            <div
              key={borrower.id}
              onClick={() => setSelectedBorrower(borrower)}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 text-sm">
                      {borrower.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {borrower.name}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {borrower.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                    ID #{borrower.id}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                <div>
                  <span className="font-semibold text-neutral-900">
                    {activeCount}
                  </span>{" "}
                  emprunts en cours
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">
                    {totalHistoryCount}
                  </span>{" "}
                  total emprunts
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Borrower Detail Modal if selected */}
      {selectedBorrower && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {selectedBorrower.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedBorrower.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedBorrower(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Livres actuellement empruntés
                </h4>
                <div className="space-y-2">
                  {books.filter((b) => b.borrowerId === selectedBorrower.id)
                    .length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">
                      Aucun emprunt en cours pour cet utilisateur.
                    </p>
                  ) : (
                    books
                      .filter((b) => b.borrowerId === selectedBorrower.id)
                      .map((book) => (
                        <div
                          key={book.id}
                          className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              Retour prévu : {book.returnDueAt}
                            </p>
                          </div>
                          <BookStatusBadge status={book.status} />
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Historique des emprunts
                </h4>
                <div className="space-y-2">
                  {borrowings.filter(
                    (b) => b.borrower.id === selectedBorrower.id
                  ).length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">
                      Aucun historique enregistré.
                    </p>
                  ) : (
                    borrowings
                      .filter((b) => b.borrower.id === selectedBorrower.id)
                      .map((b) => (
                        <div
                          key={b.id}
                          className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {b.book.title}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {b.borrowedAt} → {b.returnedAt || "En cours"}
                            </p>
                          </div>
                          <BorrowingStatusBadge status={b.status} />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedBorrower(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerBorrowings({
  borrowings,
  onReturn,
}: {
  borrowings: Borrowing[];
  onReturn: (b: Borrowing) => void;
}) {
  const [filter, setFilter] = useState<
    "all" | "active" | "overdue" | "returned"
  >("all");

  const filtered = borrowings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Emprunts
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Suivi de tous les prêts en cours et passés.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-lg w-fit">
        {(["all", "active", "overdue", "returned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
              filter === f
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {f === "all"
              ? "Tous"
              : f === "active"
              ? "En cours"
              : f === "overdue"
              ? "En retard"
              : "Retournés"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Livre</th>
                <th className="px-6 py-3.5">Emprunteur</th>
                <th className="px-6 py-3.5">Date d'emprunt</th>
                <th className="px-6 py-3.5">Retour prévu</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    Aucun emprunt correspondant.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/85 transition">
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      {b.book.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {b.borrower.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {b.borrowedAt}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {b.returnDueAt}
                    </td>
                    <td className="px-6 py-4">
                      <BorrowingStatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status !== "returned" ? (
                        <button
                          onClick={() => onReturn(b)}
                          className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-xs font-medium transition"
                        >
                          Retourner
                        </button>
                      ) : (
                        <span className="text-neutral-400 italic">Terminé</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManagerHistory({ borrowings }: { borrowings: Borrowing[] }) {
  const historyList = borrowings.filter(
    (b) => b.status === "returned" || b.returnedAt
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Historique des emprunts
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Registre complet de tous les retours passés.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Livre</th>
                <th className="px-6 py-3.5">Emprunteur</th>
                <th className="px-6 py-3.5">Emprunté le</th>
                <th className="px-6 py-3.5">Retourné le</th>
                <th className="px-6 py-3.5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {historyList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    Aucun historique enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                historyList.map((h) => (
                  <tr key={h.id} className="hover:bg-neutral-50/85 transition">
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      {h.book.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {h.borrower.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {h.borrowedAt}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {h.returnedAt || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <BorrowingStatusBadge status="returned" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// BORROWER VIEWS
// ==========================================

function BorrowerDashboard({
  books,
  borrowings,
  currentUserId,
  navigate,
}: {
  books: Book[];
  borrowings: Borrowing[];
  currentUserId: number;
  navigate: (p: string) => void;
}) {
  const myActiveBorrowings = books.filter(
    (b) => b.borrowerId === currentUserId
  );
  const availableBooks = books.filter((b) => b.status === "available");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Bonjour, Jean
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Voici un aperçu de vos emprunts et des nouveautés.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Mes emprunts en cours
          </span>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-4">
            {myActiveBorrowings.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Livres disponibles
          </span>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-4">
            {availableBooks.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Retards
          </span>
          <p className="text-3xl font-bold tracking-tight text-emerald-600 mt-4">
            0
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Mes livres actuellement empruntés
          </h3>
          <button
            onClick={() => navigate("/borrower/borrowings")}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Voir tout
          </button>
        </div>

        {myActiveBorrowings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center">
            <p className="text-xs text-neutral-500 mb-3">
              Vous n'avez aucun livre emprunté pour le moment.
            </p>
            <button
              onClick={() => navigate("/borrower/catalog")}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
            >
              Découvrir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveBorrowings.map((book) => (
              <div
                key={book.id}
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-neutral-900">
                      {book.title}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">
                      En cours
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{book.author}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-500">
                  <span>Emprunté le : {book.borrowedAt}</span>
                  <span className="font-semibold text-neutral-900">
                    Retour prévu : {book.returnDueAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BorrowerCatalog({
  books,
  navigate,
  onBorrowClick,
}: {
  books: Book[];
  navigate: (p: string, id?: number) => void;
  onBorrowClick: (book: Book) => void;
}) {
  const [search, setSearch] = useState("");
  const availableBooks = books.filter(
    (b) =>
      b.status === "available" &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Catalogue
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Découvrez les livres disponibles dans la bibliothèque.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un livre ou un auteur..."
          className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableBooks.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-neutral-200">
            <p className="text-xs text-neutral-500">
              Aucun livre disponible correspondant à votre recherche.
            </p>
          </div>
        ) : (
          availableBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/borrower/catalog/${book.id}`, book.id)}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {book.title}
                  </h3>
                  <BookStatusBadge status={book.status} />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{book.author}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  Ajouté le {book.addedAt || "—"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBorrowClick(book);
                  }}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
                >
                  Emprunter
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MyBorrowings({
  borrowings,
  currentUserId,
}: {
  borrowings: Borrowing[];
  currentUserId: number;
}) {
  const myList = borrowings.filter((b) => b.borrower.id === currentUserId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Mes emprunts
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Historique de tous vos emprunts personnels.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Livre</th>
                <th className="px-6 py-3.5">Date d'emprunt</th>
                <th className="px-6 py-3.5">Retour prévu</th>
                <th className="px-6 py-3.5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {myList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    Vous n'avez aucun emprunt enregistré.
                  </td>
                </tr>
              ) : (
                myList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/85 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      {item.book.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {item.borrowedAt}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {item.returnDueAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <BorrowingStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MyHistory({
  borrowings,
  currentUserId,
}: {
  borrowings: Borrowing[];
  currentUserId: number;
}) {
  const historyList = borrowings.filter(
    (b) => b.borrower.id === currentUserId && b.status === "returned"
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Mon historique
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Retrouvez les livres que vous avez empruntés et retournés par le
          passé.
        </p>
      </div>

      <div className="space-y-3">
        {historyList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-neutral-200">
            <p className="text-xs text-neutral-500">
              Aucun historique d'emprunt trouvé.
            </p>
          </div>
        ) : (
          historyList.map((h) => (
            <div
              key={h.id}
              className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-neutral-900">{h.book.title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Emprunté le {h.borrowedAt} • Retourné le {h.returnedAt}
                </p>
              </div>
              <BorrowingStatusBadge status="returned" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// BOOK DETAILS VIEW (SECTION 9)
// ==========================================

function BookDetailsView({
  bookId,
  books,
  borrowers,
  borrowings,
  role,
  navigate,
  setBookToEdit,
  setBookToDelete,
  onBorrowClick,
  setIsReturnModalOpen,
}: {
  bookId: number;
  books: Book[];
  borrowers: Borrower[];
  borrowings: Borrowing[];
  role: UserRole;
  navigate: (p: string) => void;
  setBookToEdit?: (b: Book) => void;
  setBookToDelete?: (b: Book) => void;
  onBorrowClick?: (b: Book) => void;
  setIsReturnModalOpen?: (b: Borrowing) => void;
}) {
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-xs text-neutral-500">Livre introuvable.</p>
        <button
          onClick={() =>
            navigate(
              role === "manager" ? "/manager/books" : "/borrower/catalog"
            )
          }
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium"
        >
          Retour
        </button>
      </div>
    );
  }

  const currentBorrower = book.borrowerId
    ? borrowers.find((br) => br.id === book.borrowerId)
    : null;
  const bookHistory = borrowings.filter((b) => b.book.id === book.id);
  const activeBorrowing = borrowings.find(
    (b) => b.book.id === book.id && b.status === "active"
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() =>
            navigate(
              role === "manager" ? "/manager/books" : "/borrower/catalog"
            )
          }
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {role === "manager" ? "Retour aux livres" : "Retour au catalogue"}
          </span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">{book.author}</p>
          </div>
          <div>
            <BookStatusBadge status={book.status} />
          </div>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Informations générales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-1">
              Identifiant unique
            </span>
            <span className="font-semibold text-neutral-900">#{book.id}</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-1">Date d'ajout</span>
            <span className="font-semibold text-neutral-900">
              {book.addedAt || "2026-08-10"}
            </span>
          </div>
        </div>

        {/* Current Borrowing section */}
        {book.status === "borrowed" && (
          <div className="pt-6 border-t border-neutral-100 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Emprunt actuel
            </h3>
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-2">
              {role === "manager" && currentBorrower && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Emprunteur :</span>
                  <span className="font-semibold text-neutral-900">
                    {currentBorrower.name} ({currentBorrower.email})
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Date d'emprunt :</span>
                <span className="font-semibold text-neutral-900">
                  {book.borrowedAt || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Retour prévu :</span>
                <span className="font-semibold text-neutral-900">
                  {book.returnDueAt || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* History section */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Historique des emprunts
          </h3>
          <div className="space-y-2">
            {bookHistory.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">
                Aucun historique pour ce livre.
              </p>
            ) : (
              bookHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex justify-between items-center text-xs"
                >
                  <div>
                    {role === "manager" && (
                      <p className="font-semibold text-neutral-900">
                        {h.borrower.name}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-500">
                      {h.borrowedAt} → {h.returnedAt || "En cours"}
                    </p>
                  </div>
                  <BorrowingStatusBadge status={h.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-neutral-100 flex items-center justify-end gap-3">
          {role === "manager" ? (
            <>
              {setBookToEdit && (
                <button
                  onClick={() => setBookToEdit(book)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 transition"
                >
                  Modifier
                </button>
              )}
              {book.status === "available" && setBookToDelete && (
                <button
                  onClick={() => setBookToDelete(book)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100 transition"
                >
                  Supprimer
                </button>
              )}
              {book.status === "borrowed" &&
                activeBorrowing &&
                setIsReturnModalOpen && (
                  <button
                    onClick={() => setIsReturnModalOpen(activeBorrowing)}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
                  >
                    Retourner le livre
                  </button>
                )}
            </>
          ) : (
            <>
              {book.status === "available" ? (
                <button
                  onClick={() => onBorrowClick && onBorrowClick(book)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition"
                >
                  Emprunter ce livre
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-neutral-100 text-neutral-400 rounded-lg text-xs font-medium cursor-not-allowed"
                >
                  Indisponible
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODALS & DIALOGS COMPONENTS
// ==========================================

function AddBookModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string, author: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onAdd(title, author);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Ajouter un livre
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Titre du livre
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Clean Code"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Auteur
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex. Robert C. Martin"
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800"
            >
              Ajouter le livre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBookModal({
  book,
  onClose,
  onUpdate,
}: {
  book: Book;
  onClose: () => void;
  onUpdate: (id: number, title: string, author: string) => void;
}) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onUpdate(book.id, title, author);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Modifier le livre
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Titre du livre
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Auteur
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteBookDialog({
  book,
  borrowers,
  onClose,
  onConfirm,
}: {
  book: Book;
  borrowers: Borrower[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isBorrowed = book.status === "borrowed";
  const borrower = borrowers.find((b) => b.id === book.borrowerId);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-neutral-900">
          {isBorrowed
            ? "Impossible de supprimer ce livre"
            : "Supprimer ce livre ?"}
        </h3>
        {isBorrowed ? (
          <p className="text-neutral-600">
            Ce livre est actuellement emprunté par{" "}
            <span className="font-semibold text-neutral-900">
              {borrower?.name || "un membre"}
            </span>
            . Vous devez enregistrer son retour avant de pouvoir le supprimer.
          </p>
        ) : (
          <p className="text-neutral-600">
            Cette action supprimera définitivement{" "}
            <span className="font-semibold text-neutral-900">{book.title}</span>{" "}
            du catalogue.
          </p>
        )}
        <div className="pt-4 flex justify-end gap-2">
          {isBorrowed ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium"
            >
              Compris
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BorrowBookModal({
  books,
  borrowers,
  onClose,
  onSubmit,
}: {
  books: Book[];
  borrowers: Borrower[];
  onClose: () => void;
  onSubmit: (bookId: number, borrowerId: number, returnDueAt: string) => void;
}) {
  const availableBooks = books.filter((b) => b.status === "available");
  const [selectedBookId, setSelectedBookId] = useState<number>(
    availableBooks[0]?.id || 0
  );
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<number>(
    borrowers[0]?.id || 0
  );
  const [returnDueAt, setReturnDueAt] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedBorrowerId) return;
    onSubmit(Number(selectedBookId), Number(selectedBorrowerId), returnDueAt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Nouvel emprunt
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Sélectionner un livre disponible
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(Number(e.target.value))}
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              {availableBooks.length === 0 ? (
                <option value="">Aucun livre disponible</option>
              ) : (
                availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Sélectionner un emprunteur
            </label>
            <select
              value={selectedBorrowerId}
              onChange={(e) => setSelectedBorrowerId(Number(e.target.value))}
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              {borrowers.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.name} ({br.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Date prévue de retour
            </label>
            <input
              type="date"
              required
              value={returnDueAt}
              onChange={(e) => setReturnDueAt(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={availableBooks.length === 0}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              Confirmer l'emprunt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BorrowerConfirmModal({
  book,
  borrowerName,
  onClose,
  onConfirm,
}: {
  book: Book;
  borrowerName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const returnDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-neutral-900">
          Emprunter ce livre ?
        </h3>
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
          <p className="font-semibold text-neutral-900 text-sm">{book.title}</p>
          <p className="text-neutral-500">{book.author}</p>
        </div>
        <p className="text-neutral-600">
          Vous êtes sur le point d'emprunter ce livre en tant que{" "}
          <span className="font-semibold text-neutral-900">{borrowerName}</span>
          . Retour prévu le{" "}
          <span className="font-semibold text-neutral-900">{returnDate}</span>.
        </p>
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800"
          >
            Confirmer l'emprunt
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnBookDialog({
  borrowing,
  onClose,
  onConfirm,
}: {
  borrowing: Borrowing;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-neutral-900">
          Retour du livre
        </h3>
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
          <p className="font-semibold text-neutral-900 text-sm">
            {borrowing.book.title}
          </p>
          <p className="text-neutral-500">
            Emprunteur : {borrowing.borrower.name}
          </p>
        </div>
        <p className="text-neutral-600">
          Confirmez-vous le retour de ce livre ? Son statut repassera
          immédiatement en{" "}
          <span className="font-semibold text-emerald-600">Disponible</span>.
        </p>
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800"
          >
            Confirmer le retour
          </button>
        </div>
      </div>
    </div>
  );
}
