from abc import ABC, abstractmethod

from app.domain.entities.borrowing import Borrowing


class BorrowingRepository(ABC):

    @abstractmethod
    def save(self, borrowing: Borrowing) -> Borrowing:
        pass

    @abstractmethod
    def get_all(self) -> list[Borrowing]:
        pass

    @abstractmethod
    def get_by_id(self, borrowing_id: int) -> Borrowing | None:
        pass

    @abstractmethod
    def get_by_book_id(self, book_id: int) -> list[Borrowing]:
        pass

    @abstractmethod
    def get_by_borrower_id(self, borrower_id: int) -> list[Borrowing]:
        pass

    @abstractmethod
    def update(self, borrowing: Borrowing) -> Borrowing:
        pass
