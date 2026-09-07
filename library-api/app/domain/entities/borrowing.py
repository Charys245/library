from dataclasses import dataclass
from datetime import datetime


@dataclass
class Borrowing:
    id: int
    book_id: int
    borrower_id: int

    borrowed_at: datetime
    due_date: str

    returned_at: datetime | None = None
    status: str = "active"
    notes: str | None = None

    def return_book(self):
        if self.status == "returned":
            raise ValueError("Cet emprunt est déjà retourné.")

        self.status = "returned"
        self.returned_at = datetime.now()
