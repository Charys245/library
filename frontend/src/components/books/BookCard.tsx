import type { Book } from "../../types/book";

type BookCardProps = {
  book: Book;
  onBorrow: (id: number) => void;
};

function BookCard({ book, onBorrow }: BookCardProps) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow">
      <h3 className="text-xl font-bold text-slate-900">{book.title}</h3>

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
            onClick={() => onBorrow(book.id)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Emprunter
          </button>
        )}
      </div>
    </article>
  );
}

export default BookCard;
