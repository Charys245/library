from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.dependencies import (
    create_borrowing_use_case,
    list_borrowings_use_case,
    get_borrowing_use_case,
    return_borrowing_use_case,
    get_book_borrowing_history_use_case,
    get_borrower_history_use_case,
)

# from app.adapters.repositories.in_memory_book_repository import (
#     InMemoryBookRepository,
# )

# from app.adapters.repositories.in_memory_borrower_repository import (
#     InMemoryBorrowerRepository,
# )

# from app.adapters.repositories.in_memory_borrowing_repository import (
#     InMemoryBorrowingRepository,
# )

# from app.application.use_cases.borrowing import CreateBorrowing
# from app.application.use_cases.borrowing import ListBorrowings
# from app.application.use_cases.borrowing import GetBorrowing
# from app.application.use_cases.borrowing import ReturnBorrowing
# from app.application.use_cases.borrowing import GetBookBorrowingHistory
# from app.application.use_cases.borrowing import GetBorrowerHistory

router = APIRouter(prefix="/borrowings", tags=["Borrowings"])


# Infrastructure
# book_repository = InMemoryBookRepository()
# borrower_repository = InMemoryBorrowerRepository()
# borrowing_repository = InMemoryBorrowingRepository()


# create_borrowing_use_case = CreateBorrowing(
#     book_repository,
#     borrower_repository,
#     borrowing_repository,
# )
# list_borrowings_use_case = ListBorrowings(borrowing_repository)
# get_borrowing_use_case = GetBorrowing(borrowing_repository)
# return_borrowing_use_case = ReturnBorrowing(
#     book_repository,
#     borrower_repository,
#     borrowing_repository,
# )
# get_book_borrowing_history_use_case = GetBookBorrowingHistory(borrowing_repository)
# get_borrower_history_use_case = GetBorrowerHistory(borrowing_repository)


class CreateBorrowingRequest(BaseModel):
    book_id: int
    borrower_id: int
    due_date: str | None = None
    notes: str | None = None


@router.post("")
def create_borrowing(data: CreateBorrowingRequest):
    try:
        return create_borrowing_use_case.execute(
            book_id=data.book_id,
            borrower_id=data.borrower_id,
            due_date=data.due_date,
            notes=data.notes,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/")
def list_all():
    return list_borrowings_use_case.execute()


@router.get("/book/{book_id}/history")
def get_book_history(book_id: int):
    return get_book_borrowing_history_use_case.execute(book_id)


@router.get("/borrower/{borrower_id}/history")
def get_borrower_history(borrower_id: int):
    return get_borrower_history_use_case.execute(borrower_id)


@router.get("/{borrowing_id}")
def get_one(borrowing_id: int):
    try:
        return get_borrowing_use_case.execute(borrowing_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("/{borrowing_id}/return")
def return_borrowing(borrowing_id: int):
    try:
        return return_borrowing_use_case.execute(borrowing_id)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
