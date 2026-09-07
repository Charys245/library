from abc import ABC, abstractmethod
from app.domain.entities.borrower import Borrower


class BorrowerRepository(ABC):

    @abstractmethod
    def save(self, borrower: Borrower) -> Borrower:
        pass

    @abstractmethod
    def get_all(self) -> list[Borrower]:
        pass

    @abstractmethod
    def get_by_id(self, borrower_id: int) -> Borrower | None:
        pass

    @abstractmethod
    def update(self, borrower: Borrower) -> Borrower:
        pass

    @abstractmethod
    def delete_borrower(self, borrower_id: int) -> bool:
        pass
