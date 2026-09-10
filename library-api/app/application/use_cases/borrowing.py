from datetime import datetime, timedelta

from app.application.ports.book_repository import BookRepository
from app.application.ports.borrower_repository import BorrowerRepository
from app.application.ports.borrowing_repository import BorrowingRepository
from app.domain.entities.borrowing import Borrowing


class CreateBorrowing:
    def __init__(
        self,
        book_repository: BookRepository,
        borrower_repository: BorrowerRepository,
        borrowing_repository: BorrowingRepository,
    ):
        self.book_repository = book_repository
        self.borrower_repository = borrower_repository
        self.borrowing_repository = borrowing_repository

    def execute(
        self,
        book_id: int,
        borrower_id: int,
        due_date: str | None = None,
        notes: str | None = None,
    ) -> Borrowing:
        book = self.book_repository.get_by_id(book_id)

        if book is None:
            raise ValueError("Livre introuvable.")

        if book.status == "borrowed":
            raise ValueError("Ce livre est déjà emprunté.")

        borrower = self.borrower_repository.get_by_id(borrower_id)

        if borrower is None:
            raise ValueError("Emprunteur introuvable.")

        if borrower.status == "suspended":
            raise ValueError("Le compte de cet emprunteur est suspendu.")

        if due_date is None:
            due_date = (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d")

        borrowing = Borrowing(
            id=0,
            book_id=book_id,
            borrower_id=borrower_id,
            borrowed_at=datetime.now(),
            due_date=due_date,
            notes=notes,
        )

        book.borrow()

        borrower.current_borrowings_count += 1
        borrower.total_borrowings_count += 1

        self.book_repository.save(book)
        self.borrower_repository.update(borrower)

        return self.borrowing_repository.save(borrowing)


class ListBorrowings:
    def __init__(self, repository: BorrowingRepository):
        self.repository = repository

    def execute(self, status: str | None = None) -> list[Borrowing]:
        return self.repository.get_all(status)


class GetBorrowing:
    def __init__(self, repository: BorrowingRepository):
        self.repository = repository

    def execute(self, borrowing_id: int) -> Borrowing:
        borrowing = self.repository.get_by_id(borrowing_id)

        if borrowing is None:
            raise ValueError("Emprunt introuvable.")

        return borrowing


class ReturnBorrowing:
    def __init__(
        self,
        book_repository: BookRepository,
        borrower_repository: BorrowerRepository,
        borrowing_repository: BorrowingRepository,
    ):
        self.book_repository = book_repository
        self.borrower_repository = borrower_repository
        self.borrowing_repository = borrowing_repository

    def execute(self, borrowing_id: int) -> Borrowing:
        borrowing = self.borrowing_repository.get_by_id(borrowing_id)

        if borrowing is None:
            raise ValueError("Emprunt introuvable.")

        borrowing.return_book()

        book = self.book_repository.get_by_id(borrowing.book_id)

        if book is not None:
            book.make_available()
            self.book_repository.save(book)

        borrower = self.borrower_repository.get_by_id(borrowing.borrower_id)

        if borrower is not None and borrower.current_borrowings_count > 0:
            borrower.current_borrowings_count -= 1
            self.borrower_repository.update(borrower)

        return self.borrowing_repository.update(borrowing)


class GetBookBorrowingHistory:
    def __init__(self, repository: BorrowingRepository):
        self.repository = repository

    def execute(self, book_id: int) -> list[Borrowing]:
        return self.repository.get_by_book_id(book_id)


class GetBorrowerHistory:
    def __init__(self, repository: BorrowingRepository):
        self.repository = repository

    def execute(self, borrower_id: int) -> list[Borrowing]:
        return self.repository.get_by_borrower_id(borrower_id)
