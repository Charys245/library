import React, { useState, useEffect } from "react";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import type { Book } from "@/types";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    author: string;
    isbn?: string;
    published_year?: number;
    category?: string;
    description?: string;
  }) => Promise<void>;
  bookToEdit?: Book | null;
  isLoading?: boolean;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bookToEdit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publishedYear, setPublishedYear] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn || "");
      setPublishedYear(
        bookToEdit.published_year ? String(bookToEdit.published_year) : ""
      );
      setCategory(bookToEdit.category || "");
      setDescription(bookToEdit.description || "");
    } else {
      setTitle("");
      setAuthor("");
      setIsbn("");
      setPublishedYear("");
      setCategory("");
      setDescription("");
    }
    setErrors({});
  }, [bookToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Le titre du livre est obligatoire";
    }
    if (!author.trim()) {
      newErrors.author = "L’auteur est obligatoire";
    }
    if (
      publishedYear &&
      (isNaN(Number(publishedYear)) ||
        Number(publishedYear) < 1000 ||
        Number(publishedYear) > 2100)
    ) {
      newErrors.publishedYear = "Année invalide (ex: 2023)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim() || undefined,
      published_year: publishedYear ? Number(publishedYear) : undefined,
      category: category.trim() || "Général",
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookToEdit ? "Modifier le livre" : "Ajouter un nouveau livre"}
      description={
        bookToEdit
          ? "Mettez à jour les métadonnées de l’ouvrage dans le catalogue."
          : "Enregistrez un nouvel ouvrage dans l’inventaire de la bibliothèque."
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Titre de l’ouvrage"
              placeholder="ex: Clean Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Auteur(s)"
              placeholder="ex: Robert C. Martin"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              error={errors.author}
              required
            />
          </div>

          <div>
            <Input
              label="Numéro ISBN"
              placeholder="ex: 978-0134494166"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              helperText="Identifiant unique d'édition"
            />
          </div>

          <div>
            <Input
              label="Année de publication"
              placeholder="ex: 2017"
              type="number"
              value={publishedYear}
              onChange={(e) => setPublishedYear(e.target.value)}
              error={errors.publishedYear}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Catégorie / Rayon"
              placeholder="ex: Architecture Logicielle, DevOps, Conception..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label
              htmlFor="book-description"
              className="block text-xs font-medium text-zinc-300"
            >
              Résumé / Description
            </label>
            <textarea
              id="book-description"
              rows={3}
              placeholder="Courte description de l'ouvrage ou thèmes abordés..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#16161a] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            {bookToEdit ? "Enregistrer les modifications" : "Ajouter le livre"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
