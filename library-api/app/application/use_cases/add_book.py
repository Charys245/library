from app.domain.entities.book import Book
from app.application.ports.book_repository import BookRepository


class AddBook:

    def __init__(self, repository: BookRepository):
        self.repository = repository

    def execute(
        self,
        title: str,
        author: str,
        isbn: str | None = None,
        published_year: int | None = None,
        category: str | None = None,
        description: str | None = None,
    ) -> Book:
        book = Book(
            id=0,
            title=title,
            author=author,
            isbn=isbn,
            published_year=published_year,
            category=category,
            description=description,
        )

        return self.repository.save(book)
