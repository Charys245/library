import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddBookForm from "../components/books/AddBookForm";
import BookList from "../components/books/BookList";
import { borrowBook, getBooks } from "../services/bookService";

function BooksPage() {
  const queryClient = useQueryClient();

  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const borrowMutation = useMutation({
    mutationFn: borrowBook,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });

  return (
    <main>
      <AddBookForm />

      {isLoading && <p>Chargement...</p>}

      {error && <p>Une erreur est survenue.</p>}

      {!isLoading && !error && (
        <BookList books={books} onBorrow={borrowMutation.mutate} />
      )}
    </main>
  );
}

export default BooksPage;
