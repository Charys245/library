import type { Book } from "../../types/book";
import BookCard from "./BookCard";

type BookListProps = {
  books: Book[];
  onBorrow: (id: number) => void;
};

function BookList({ books, onBorrow }: BookListProps) {
  if (books.length === 0) {
    return (
      <p className="rounded-xl bg-white p-6 text-center text-slate-500">
        Aucun livre disponible.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onBorrow={onBorrow} />
      ))}
    </div>
  );
}

export default BookList;
