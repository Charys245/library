from app.adapters.repositories.in_memory_book_repository import (
    InMemoryBookRepository,
)
from app.application.use_cases.add_book import AddBook
from app.application.use_cases.list_books import ListBooks


def test_list_books():
    repository = InMemoryBookRepository()

    add_book = AddBook(repository)
    list_books = ListBooks(repository)

    add_book.execute(
        title="Clean Architecture",
        author="Robert C. Martin",
    )

    add_book.execute(
        title="Domain-Driven Design",
        author="Eric Evans",
    )

    books = list_books.execute()

    assert len(books) == 2
    assert books[0].title == "Clean Architecture"
    assert books[1].title == "Domain-Driven Design"
