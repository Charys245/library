import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  available: boolean;
};

const API_URL = "http://localhost:8000";

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const fetchBooks = async () => {
    const response = await fetch(`${API_URL}/books`);
    const data = await response.json();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !author) return;

    await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
      }),
    });

    setTitle("");
    setAuthor("");

    fetchBooks();
  };

  const borrowBook = async (id: number) => {
    const response = await fetch(`${API_URL}/books/${id}/borrow`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.detail);
      return;
    }

    fetchBooks();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">📚 Library</h1>

        <p className="mb-8 text-slate-500">
          Gestion des livres et des emprunts
        </p>

        {/* Formulaire */}
        <form
          onSubmit={addBook}
          className="mb-10 rounded-2xl bg-white p-6 shadow"
        >
          <h2 className="mb-4 text-xl font-semibold">Ajouter un livre</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Titre du livre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Auteur"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Ajouter le livre
          </button>
        </form>

        {/* Liste */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Livres disponibles</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {books.map((book) => (
              <article
                key={book.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <h3 className="text-xl font-bold text-slate-900">
                  {book.title}
                </h3>

                <p className="mt-1 text-slate-500">{book.author}</p>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      book.available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {book.available ? "Disponible" : "Emprunté"}
                  </span>

                  {book.available && (
                    <button
                      onClick={() => borrowBook(book.id)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      Emprunter
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
