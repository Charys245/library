from app.application.ports.borrower_repository import BorrowerRepository
from app.domain.entities.borrower import Borrower


class InMemoryBorrowerRepository(BorrowerRepository):
    def __init__(self):
        self.borrowers: list[Borrower] = []
        self.next_id = 1

    def save(self, borrower: Borrower) -> Borrower:
        if borrower.id == 0:
            borrower.id = self.next_id
            self.next_id += 1

            self.borrowers.append(borrower)
        return borrower

    def get_all(self) -> list[Borrower]:
        return self.borrowers

    def get_by_id(self, borrower_id: int) -> Borrower | None:
        return next(
            (borrower for borrower in self.borrowers if borrower.id == borrower_id),
            None,
        )

    def update(self, borrower: Borrower) -> Borrower:
        existing_borrower = self.get_by_id(borrower.id)

        if existing_borrower is None:
            raise ValueError("Emprunteur introuvable.")

        existing_borrower.name = borrower.name
        existing_borrower.email = borrower.email
        existing_borrower.phone = borrower.phone

        return existing_borrower

    def delete_borrower(self, borrower_id: int) -> bool:
        borrower = self.get_by_id(borrower_id)

        if borrower is None:
            return False

        self.borrowers.remove(borrower)

        return True
