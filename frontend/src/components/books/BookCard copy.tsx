import React from 'react';
// import { Book } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BookOpen, Calendar, ArrowRight, BookmarkCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  showBorrowButton?: boolean;
  basePath?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  showBorrowButton = true,
  basePath = '/borrower/catalog',
}) => {
  const navigate = useNavigate();
  const isAvailable = book.status === 'available';

  return (
    <div className="flex flex-col justify-between bg-[#111114] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:bg-[#16161a] group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">
            {book.category || 'Général'}
          </span>
          <Badge variant={book.status} size="sm" />
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {book.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 font-medium truncate">{book.author}</p>

        {book.description && (
          <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{book.isbn || 'ISBN Non renseigné'}</span>
          </div>
          {book.published_year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{book.published_year}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${basePath}/${book.id}`)}
          className="flex-1 text-xs"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Voir les détails
        </Button>

        {showBorrowButton && isAvailable && onBorrow && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBorrow(book)}
            className="text-xs"
            leftIcon={<BookmarkCheck className="w-3.5 h-3.5" />}
          >
            Emprunter
          </Button>
        )}
      </div>
    </div>
  );
};

