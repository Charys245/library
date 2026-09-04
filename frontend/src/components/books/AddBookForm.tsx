import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook } from "../../services/bookService";

function AddBookForm() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const createBookMutation = useMutation({
    mutationFn: () => createBook(title.trim(), author.trim()),

    onSuccess: () => {
      setTitle("");
      setAuthor("");

      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) return;

    createBookMutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
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
        disabled={createBookMutation.isPending}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createBookMutation.isPending ? "Ajout..." : "Ajouter le livre"}
      </button>

      {createBookMutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          {createBookMutation.error instanceof Error
            ? createBookMutation.error.message
            : "Une erreur est survenue"}
        </p>
      )}
    </form>
  );
}

export default AddBookForm;
