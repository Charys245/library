from app.application.ports.book_repository import BookRepository
from app.domain.entities.book import Book


class UpdateBook:
    def __init__(self, repository: BookRepository):
        self.repository = repository

    def execute(
        self,
        book_id: int,
        title: str,
        author: str,
        isbn: str | None = None,
        published_year: int | None = None,
        category: str | None = None,
        description: str | None = None,
    ) -> Book:
        book = self.repository.get_by_id(book_id)

        if book is None:
            raise ValueError("Ce livre n'est pas disponible")

        book.title = title
        book.author = author
        book.isbn = isbn
        book.published_year = published_year
        book.category = category
        book.description = description

        return self.repository.update(book)

