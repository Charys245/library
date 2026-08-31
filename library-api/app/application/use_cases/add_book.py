from app.domain.book import Book
from app.application.ports.book_repository import BookRepository


class AddBook:

    def __init__(self, repository: BookRepository):
        self.repository = repository

    def execute(self, title: str, author: str) -> Book:
        book = Book(
            id=0,
            title=title,
            author=author,
        )

        return self.repository.save(book)
