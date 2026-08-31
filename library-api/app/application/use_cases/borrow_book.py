from app.domain.book import Book
from app.application.ports.book_repository import BookRepository


class BorrowBook:

    def __init__(self, repository: BookRepository):
        self.repository = repository

    def execute(self, book_id: int) -> Book:
        book = self.repository.get_by_id(book_id)

        if book is None:
            raise ValueError("Book not found")

        book.borrow()

        return book
