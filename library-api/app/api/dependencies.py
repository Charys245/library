from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.application.ports.book_repository import BookRepository
from app.adapters.repositories.postgres_book_repository import PostgresBookRepository
from app.application.ports.borrower_repository import BorrowerRepository

from app.adapters.repositories.postgres_borrower_repository import (
    PostgresBorrowerRepository,
)

from app.application.ports.borrowing_repository import BorrowingRepository
from app.adapters.repositories.postgres_borrowing_repository import (
    PostgresBorrowingRepository,
)


from app.adapters.repositories.in_memory_book_repository import (
    InMemoryBookRepository,
)

from app.adapters.repositories.in_memory_borrower_repository import (
    InMemoryBorrowerRepository,
)

from app.adapters.repositories.in_memory_borrowing_repository import (
    InMemoryBorrowingRepository,
)

from app.application.use_cases.add_book import AddBook
from app.application.use_cases.add_book import GetBook
from app.application.use_cases.list_books import ListBooks
from app.application.use_cases.borrow_book import BorrowBook
from app.application.use_cases.update_book import UpdateBook
from app.application.use_cases.delete_book import DeleteBook

from app.application.use_cases.borrower import CreateBorrower
from app.application.use_cases.borrower import ListBorrowers
from app.application.use_cases.borrower import GetBorrower
from app.application.use_cases.borrower import UpdateBorrower
from app.application.use_cases.borrower import DeleteBorrower

from app.application.use_cases.borrowing import CreateBorrowing
from app.application.use_cases.borrowing import ListBorrowings
from app.application.use_cases.borrowing import GetBorrowing
from app.application.use_cases.borrowing import ReturnBorrowing
from app.application.use_cases.borrowing import GetBookBorrowingHistory
from app.application.use_cases.borrowing import GetBorrowerHistory

# ============================================================
# Repositories
# ============================================================

book_repository = InMemoryBookRepository()
borrower_repository = InMemoryBorrowerRepository()
borrowing_repository = InMemoryBorrowingRepository()


# ============================================================
# Book use cases
# ============================================================

# add_book_use_case = AddBook(book_repository)
# list_books_use_case = ListBooks(book_repository)
# borrow_book_use_case = BorrowBook(book_repository)
# update_book_use_case = UpdateBook(book_repository)
# delete_book_use_case = DeleteBook(book_repository)
# get_book_use_case = GetBook(book_repository)


def get_book_repository(
    session: Session = Depends(get_session),
) -> BookRepository:
    return PostgresBookRepository(session)


def add_book_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> AddBook:
    return AddBook(repository)


def list_books_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> ListBooks:
    return ListBooks(repository)


def get_book_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> GetBook:
    return GetBook(repository)


def update_book_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> UpdateBook:
    return UpdateBook(repository)


def delete_book_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> DeleteBook:
    return DeleteBook(repository)


def borrow_book_use_case(
    repository: BookRepository = Depends(get_book_repository),
) -> BorrowBook:
    return BorrowBook(repository)


# ============================================================
# Borrower use cases
# ============================================================

# create_borrower_use_case = CreateBorrower(borrower_repository)
# list_borrowers_use_case = ListBorrowers(borrower_repository)
# get_borrower_use_case = GetBorrower(borrower_repository)
# update_borrower_use_case = UpdateBorrower(borrower_repository)
# delete_borrower_use_case = DeleteBorrower(borrower_repository)


def get_borrower_repository(
    session: Session = Depends(get_session),
) -> BorrowerRepository:
    return PostgresBorrowerRepository(session)


def create_borrower_use_case(
    repository: BorrowerRepository = Depends(get_borrower_repository),
) -> CreateBorrower:
    return CreateBorrower(repository)


def list_borrowers_use_case(
    repository: BorrowerRepository = Depends(get_borrower_repository),
) -> ListBorrowers:
    return ListBorrowers(repository)


def get_borrower_use_case(
    repository: BorrowerRepository = Depends(get_borrower_repository),
) -> GetBorrower:
    return GetBorrower(repository)


def update_borrower_use_case(
    repository: BorrowerRepository = Depends(get_borrower_repository),
) -> UpdateBorrower:
    return UpdateBorrower(repository)


def delete_borrower_use_case(
    repository: BorrowerRepository = Depends(get_borrower_repository),
) -> DeleteBorrower:
    return DeleteBorrower(repository)


# ============================================================
# Borrowing use cases
# ============================================================


def get_borrowing_repository(
    session: Session = Depends(get_session),
) -> BorrowingRepository:
    return PostgresBorrowingRepository(session)


# create_borrowing_use_case = CreateBorrowing(
#     book_repository,
#     borrower_repository,
#     borrowing_repository,
# )


def create_borrowing_use_case(
    book_repository: BookRepository = Depends(get_book_repository),
    borrower_repository: BorrowerRepository = Depends(get_borrower_repository),
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> CreateBorrowing:
    return CreateBorrowing(
        book_repository,
        borrower_repository,
        borrowing_repository,
    )


# list_borrowings_use_case = ListBorrowings(
#     borrowing_repository,
# )


def list_borrowings_use_case(
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> ListBorrowings:
    return ListBorrowings(
        borrowing_repository,
    )


# get_borrowing_use_case = GetBorrowing(
#     borrowing_repository,
# )


def get_borrowing_use_case(
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> GetBorrowing:
    return GetBorrowing(
        borrowing_repository,
    )


# return_borrowing_use_case = ReturnBorrowing(
#     book_repository,
#     borrower_repository,
#     borrowing_repository,
# )


def return_borrowing_use_case(
    book_repository: BookRepository = Depends(get_book_repository),
    borrower_repository: BorrowerRepository = Depends(get_borrower_repository),
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> ReturnBorrowing:
    return ReturnBorrowing(
        book_repository,
        borrower_repository,
        borrowing_repository,
    )


# get_book_borrowing_history_use_case = GetBookBorrowingHistory(
#     borrowing_repository,
# )


def get_book_borrowing_history_use_case(
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> GetBookBorrowingHistory:
    return GetBookBorrowingHistory(
        borrowing_repository,
    )


# get_borrower_history_use_case = GetBorrowerHistory(
#     borrowing_repository,
# )


def get_borrower_history_use_case(
    borrowing_repository: BorrowingRepository = Depends(get_borrowing_repository),
) -> GetBorrowerHistory:
    return GetBorrowerHistory(
        borrowing_repository,
    )
