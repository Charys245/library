from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.ports.borrower_repository import BorrowerRepository
from app.domain.entities.borrower import Borrower
from app.database.models import BorrowerModel


class PostgresBorrowerRepository(BorrowerRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, borrower: Borrower) -> Borrower:
        model = BorrowerModel(
            name=borrower.name,
            email=borrower.email,
            phone=borrower.phone,
            membership_date=borrower.membership_date,
            status=borrower.status,
            current_borrowings_count=borrower.current_borrowings_count,
            total_borrowings_count=borrower.total_borrowings_count,
            created_at=borrower.created_at,
        )

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        borrower.id = model.id

        return borrower

    def get_all(self) -> list[Borrower]:
        models = self.session.scalars(select(BorrowerModel)).all()

        return [self._to_domain(model) for model in models]

    def get_by_id(self, borrower_id: int) -> Borrower | None:
        model = self.session.get(BorrowerModel, borrower_id)

        if model is None:
            return None

        return self._to_domain(model)

    def update(self, borrower: Borrower) -> Borrower:
        model = self.session.get(BorrowerModel, borrower.id)

        if model is None:
            raise ValueError("Emprunteur introuvable.")

        model.name = borrower.name
        model.email = borrower.email
        model.phone = borrower.phone
        model.membership_date = borrower.membership_date
        model.status = borrower.status
        model.current_borrowings_count = borrower.current_borrowings_count
        model.total_borrowings_count = borrower.total_borrowings_count

        self.session.commit()
        self.session.refresh(model)

        return self._to_domain(model)

    def delete_borrower(self, borrower_id: int) -> bool:
        model = self.session.get(BorrowerModel, borrower_id)

        if model is None:
            return False

        self.session.delete(model)
        self.session.commit()

        return True

    @staticmethod
    def _to_domain(model: BorrowerModel) -> Borrower:
        return Borrower(
            id=model.id,
            name=model.name,
            email=model.email,
            phone=model.phone,
            membership_date=model.membership_date,
            status=model.status,
            current_borrowings_count=model.current_borrowings_count,
            total_borrowings_count=model.total_borrowings_count,
            created_at=model.created_at,
        )
