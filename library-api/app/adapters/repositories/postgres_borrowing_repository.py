from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.application.ports.borrowing_repository import BorrowingRepository
from app.domain.entities.borrowing import Borrowing
from app.database.models import BookModel, BorrowerModel, BorrowingModel


class PostgresBorrowingRepository(BorrowingRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, borrowing: Borrowing) -> Borrowing:
        model = BorrowingModel(
            book_id=borrowing.book_id,
            borrower_id=borrowing.borrower_id,
            borrowed_at=borrowing.borrowed_at,
            due_date=borrowing.due_date,
            returned_at=borrowing.returned_at,
            status=borrowing.status,
            notes=borrowing.notes,
        )

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        borrowing.id = model.id

        return borrowing

    def get_all(self, status: str | None = None) -> list[Borrowing]:
        today = date.today().isoformat()

        stmt = (
            select(
                BorrowingModel,
                BookModel.title.label("book_title"),
                BorrowerModel.name.label("borrower_name"),
                BorrowerModel.email.label("borrower_email"),
            )
            .outerjoin(BookModel, BorrowingModel.book_id == BookModel.id)
            .outerjoin(BorrowerModel, BorrowingModel.borrower_id == BorrowerModel.id)
        )

        if status and status != "all":
            if status == "active":
                # active = not yet returned (includes overdue)
                stmt = stmt.where(BorrowingModel.returned_at.is_(None))
            elif status == "overdue":
                stmt = stmt.where(
                    BorrowingModel.returned_at.is_(None),
                    BorrowingModel.due_date < today,
                )
            elif status == "returned":
                stmt = stmt.where(BorrowingModel.returned_at.isnot(None))

        rows = self.session.execute(stmt).all()

        return [
            self._to_domain_enriched(row, today)
            for row in rows
        ]

    def get_by_id(self, borrowing_id: int) -> Borrowing | None:
        model = self.session.get(BorrowingModel, borrowing_id)

        if model is None:
            return None

        return self._to_domain(model)

    def get_by_book_id(self, book_id: int) -> list[Borrowing]:
        today = date.today().isoformat()

        stmt = (
            select(
                BorrowingModel,
                BookModel.title.label("book_title"),
                BorrowerModel.name.label("borrower_name"),
                BorrowerModel.email.label("borrower_email"),
            )
            .outerjoin(BookModel, BorrowingModel.book_id == BookModel.id)
            .outerjoin(BorrowerModel, BorrowingModel.borrower_id == BorrowerModel.id)
            .where(BorrowingModel.book_id == book_id)
        )

        rows = self.session.execute(stmt).all()

        return [self._to_domain_enriched(row, today) for row in rows]

    def get_by_borrower_id(self, borrower_id: int) -> list[Borrowing]:
        today = date.today().isoformat()

        stmt = (
            select(
                BorrowingModel,
                BookModel.title.label("book_title"),
                BorrowerModel.name.label("borrower_name"),
                BorrowerModel.email.label("borrower_email"),
            )
            .outerjoin(BookModel, BorrowingModel.book_id == BookModel.id)
            .outerjoin(BorrowerModel, BorrowingModel.borrower_id == BorrowerModel.id)
            .where(BorrowingModel.borrower_id == borrower_id)
        )

        rows = self.session.execute(stmt).all()

        return [self._to_domain_enriched(row, today) for row in rows]

    def update(self, borrowing: Borrowing) -> Borrowing:
        model = self.session.get(BorrowingModel, borrowing.id)

        if model is None:
            raise ValueError("Emprunt introuvable.")

        model.book_id = borrowing.book_id
        model.borrower_id = borrowing.borrower_id
        model.borrowed_at = borrowing.borrowed_at
        model.due_date = borrowing.due_date
        model.returned_at = borrowing.returned_at
        model.status = borrowing.status
        model.notes = borrowing.notes

        self.session.commit()
        self.session.refresh(model)

        return self._to_domain(model)

    @staticmethod
    def _to_domain_enriched(row, today: str) -> Borrowing:
        model = row.BorrowingModel
        computed_status = model.status
        if computed_status == "active" and model.returned_at is None and model.due_date < today:
            computed_status = "overdue"
        return Borrowing(
            id=model.id,
            book_id=model.book_id,
            borrower_id=model.borrower_id,
            borrowed_at=model.borrowed_at,
            due_date=model.due_date,
            returned_at=model.returned_at,
            status=computed_status,
            notes=model.notes,
            book_title=row.book_title,
            borrower_name=row.borrower_name,
            borrower_email=row.borrower_email,
        )

    @staticmethod
    def _to_domain(model: BorrowingModel) -> Borrowing:
        return Borrowing(
            id=model.id,
            book_id=model.book_id,
            borrower_id=model.borrower_id,
            borrowed_at=model.borrowed_at,
            due_date=model.due_date,
            returned_at=model.returned_at,
            status=model.status,
            notes=model.notes,
        )
