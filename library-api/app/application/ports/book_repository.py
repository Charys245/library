from abc import ABC, abstractmethod
from app.domain.book import Book


class BookRepository(ABC):

    @abstractmethod
    def save(self, book: Book) -> Book:
        pass

    @abstractmethod
    def get_all(self) -> list[Book]:
        pass

    @abstractmethod
    def get_by_id(self, book_id: int) -> Book | None:
        pass
