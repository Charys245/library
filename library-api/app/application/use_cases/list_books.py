from app.domain.entities.book import Book
from app.application.ports.book_repository import BookRepository


class ListBooks:

    def __init__(self, repository: BookRepository):
        self.repository = repository

    def execute(self) -> list[Book]:
        return self.repository.get_all()
