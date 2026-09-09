from app.adapters.repositories.in_memory_book_repository import (
    InMemoryBookRepository,
)
from app.application.use_cases.add_book import AddBook


def test_add_book():
    repository = InMemoryBookRepository()
    use_case = AddBook(repository)

    book = use_case.execute(
        title="Clean Architecture",
        author="Robert C. Martin",
    )

    assert book.id == 1
    assert book.title == "Clean Architecture"
    assert book.author == "Robert C. Martin"
    assert book.status == "available"

    books = repository.get_all()

    assert len(books) == 1
    assert books[0] == book
