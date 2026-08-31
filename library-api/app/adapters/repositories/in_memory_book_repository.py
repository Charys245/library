from app.domain.book import Book
from app.application.ports.book_repository import BookRepository


class InMemoryBookRepository(BookRepository):

    def __init__(self):
        self.books: list[Book] = []
        self.next_id = 1

    def save(self, book: Book) -> Book:
        if book.id == 0:
            book.id = self.next_id
            self.next_id += 1

        self.books.append(book)

        return book

    def get_all(self) -> list[Book]:
        return self.books

    def get_by_id(self, book_id: int) -> Book | None:
        return next(
            (book for book in self.books if book.id == book_id),
            None
        )