from app.application.ports.borrower_repository import BorrowerRepository
from app.domain.entities.borrower import Borrower


class CreateBorrower:
    def __init__(self, repository: BorrowerRepository):
        self.repository = repository

    def execute(self, name: str, email: str, phone: str) -> Borrower:
        borrower = Borrower(id=0, name=name, email=email, phone=phone)

        return self.repository.save(borrower)


class ListBorrowers:
    def __init__(self, repository: BorrowerRepository):
        self.repository = repository

    def execute(self) -> list[Borrower]:
        return self.repository.get_all()


class GetBorrower:
    def __init__(self, repository: BorrowerRepository):
        self.repository = repository

    def execute(self, borrower_id: int) -> Borrower:
        borrower = self.repository.get_by_id(borrower_id)

        if borrower is None:
            raise ValueError("Emprunteur introuvable.")

        return borrower


class UpdateBorrower:
    def __init__(self, repository: BorrowerRepository):
        self.repository = repository

    def execute(
        self,
        borrower_id: int,
        name: str,
        email: str,
        phone: str | None = None,
    ) -> Borrower:
        borrower = self.repository.get_by_id(borrower_id)

        if borrower is None:
            raise ValueError("Emprunteur introuvable.")

        borrower.name = name
        borrower.email = email
        borrower.phone = phone

        return self.repository.update(borrower)


class DeleteBorrower:
    def __init__(self, repository: BorrowerRepository):
        self.repository = repository

    def execute(self, borrower_id: int) -> bool:
        borrower = self.repository.get_by_id(borrower_id)

        if borrower is None:
            raise ValueError("Emprunteur introuvable.")

        return self.repository.delete_borrower(borrower_id)
