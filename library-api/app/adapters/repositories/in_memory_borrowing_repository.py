from app.application.ports.borrowing_repository import BorrowingRepository
from app.domain.entities.borrowing import Borrowing


class InMemoryBorrowingRepository(BorrowingRepository):

    def __init__(self):
        self.borrowings: list[Borrowing] = []
        self.next_id = 1

    def save(self, borrowing: Borrowing) -> Borrowing:
        if borrowing.id == 0:
            borrowing.id = self.next_id
            self.next_id += 1

        self.borrowings.append(borrowing)

        return borrowing

    def get_all(self) -> list[Borrowing]:
        return self.borrowings

    def get_by_id(self, borrowing_id: int) -> Borrowing | None:
        return next(
            (
                borrowing
                for borrowing in self.borrowings
                if borrowing.id == borrowing_id
            ),
            None,
        )

    def get_by_book_id(self, book_id: int) -> list[Borrowing]:
        return [
            borrowing for borrowing in self.borrowings if borrowing.book_id == book_id
        ]

    def get_by_borrower_id(self, borrower_id: int) -> list[Borrowing]:
        return [
            borrowing
            for borrowing in self.borrowings
            if borrowing.borrower_id == borrower_id
        ]

    def update(self, borrowing: Borrowing) -> Borrowing:
        existing_borrowing = self.get_by_id(borrowing.id)

        if existing_borrowing is None:
            raise ValueError("Emprunt introuvable.")

        existing_borrowing.book_id = borrowing.book_id
        existing_borrowing.borrower_id = borrowing.borrower_id
        existing_borrowing.borrowed_at = borrowing.borrowed_at
        existing_borrowing.due_date = borrowing.due_date
        existing_borrowing.returned_at = borrowing.returned_at
        existing_borrowing.status = borrowing.status
        existing_borrowing.notes = borrowing.notes

        return existing_borrowing
