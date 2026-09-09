from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.ports.book_repository import BookRepository
from app.domain.entities.book import Book
from app.database.models import BookModel


class PostgresBookRepository(BookRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, book: Book) -> Book:
        if book.id == 0:
            model = BookModel(
                title=book.title,
                author=book.author,
                isbn=book.isbn,
                published_year=book.published_year,
                category=book.category,
                description=book.description,
                status=book.status,
                created_at=book.created_at,
            )

            self.session.add(model)
            self.session.commit()
            self.session.refresh(model)

            book.id = model.id
            return book

        model = self.session.get(BookModel, book.id)

        if model is None:
            raise ValueError("Livre introuvable.")

        model.title = book.title
        model.author = book.author
        model.isbn = book.isbn
        model.published_year = book.published_year
        model.category = book.category
        model.description = book.description
        model.status = book.status

        self.session.commit()

        return book

    def get_all(self) -> list[Book]:
        models = self.session.scalars(select(BookModel)).all()

        return [self._to_domain(model) for model in models]

    def get_by_id(self, book_id: int) -> Book | None:
        model = self.session.get(BookModel, book_id)

        if model is None:
            return None

        return self._to_domain(model)

    def delete(self, book_id: int) -> bool:
        model = self.session.get(BookModel, book_id)

        if model is None:
            return False

        self.session.delete(model)
        self.session.commit()

        return True
    
    def update(self, book: Book) -> Book:
        model = self.session.get(BookModel, book.id)

        if model is None:
            raise ValueError("Livre introuvable.")

        model.title = book.title
        model.author = book.author
        model.isbn = book.isbn
        model.published_year = book.published_year
        model.category = book.category
        model.description = book.description
        model.status = book.status

        self.session.commit()
        self.session.refresh(model)

        return self._to_domain(model)

    @staticmethod
    def _to_domain(model: BookModel) -> Book:
        return Book(
            id=model.id,
            title=model.title,
            author=model.author,
            isbn=model.isbn,
            published_year=model.published_year,
            category=model.category,
            description=model.description,
            status=model.status,
            created_at=model.created_at,
        )
