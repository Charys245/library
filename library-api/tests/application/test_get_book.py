import pytest

from app.adapters.repositories.in_memory_book_repository import (
    InMemoryBookRepository,
)
from app.application.use_cases.add_book import AddBook
from app.application.use_cases.add_book import GetBook


def test_get_book():
    repository = InMemoryBookRepository()

    add_book = AddBook(repository)
    get_book = GetBook(repository)

    book = add_book.execute(
        title="Clean Architecture",
        author="Robert C. Martin",
    )

    result = get_book.execute(book.id)

    assert result.id == book.id
    assert result.title == "Clean Architecture"
    assert result.author == "Robert C. Martin"


def test_get_book_not_found():
    repository = InMemoryBookRepository()
    get_book = GetBook(repository)

    with pytest.raises(ValueError, match="Book not found"):
        get_book.execute(999)
