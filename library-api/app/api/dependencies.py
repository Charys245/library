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

add_book_use_case = AddBook(book_repository)
list_books_use_case = ListBooks(book_repository)
borrow_book_use_case = BorrowBook(book_repository)
update_book_use_case = UpdateBook(book_repository)
delete_book_use_case = DeleteBook(book_repository)
get_book_use_case = GetBook(book_repository)


# ============================================================
# Borrower use cases
# ============================================================

create_borrower_use_case = CreateBorrower(borrower_repository)
list_borrowers_use_case = ListBorrowers(borrower_repository)
get_borrower_use_case = GetBorrower(borrower_repository)
update_borrower_use_case = UpdateBorrower(borrower_repository)
delete_borrower_use_case = DeleteBorrower(borrower_repository)


# ============================================================
# Borrowing use cases
# ============================================================

create_borrowing_use_case = CreateBorrowing(
    book_repository,
    borrower_repository,
    borrowing_repository,
)

list_borrowings_use_case = ListBorrowings(
    borrowing_repository,
)

get_borrowing_use_case = GetBorrowing(
    borrowing_repository,
)

return_borrowing_use_case = ReturnBorrowing(
    book_repository,
    borrower_repository,
    borrowing_repository,
)

get_book_borrowing_history_use_case = GetBookBorrowingHistory(
    borrowing_repository,
)

get_borrower_history_use_case = GetBorrowerHistory(
    borrowing_repository,
)
