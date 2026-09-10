from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.dependencies import (
    create_borrowing_use_case,
    list_borrowings_use_case,
    get_borrowing_use_case,
    return_borrowing_use_case,
    get_book_borrowing_history_use_case,
    get_borrower_history_use_case,
)

router = APIRouter(prefix="/borrowings", tags=["Borrowings"])


class CreateBorrowingRequest(BaseModel):
    book_id: int
    borrower_id: int
    due_date: str | None = None
    notes: str | None = None


@router.post("")
def create_borrowing(
    data: CreateBorrowingRequest,
    use_case=Depends(create_borrowing_use_case),
):
    try:
        return use_case.execute(
            book_id=data.book_id,
            borrower_id=data.borrower_id,
            due_date=data.due_date,
            notes=data.notes,
        )

    except ValueError as error:
        print("ERREUR CREATE BORROWING :", error)
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/")
def list_all(
    status: str | None = Query(default=None),
    use_case=Depends(list_borrowings_use_case),
):
    return use_case.execute(status)


@router.get("/book/{book_id}/history")
def get_book_history(
    book_id: int,
    use_case=Depends(get_book_borrowing_history_use_case),
):
    return use_case.execute(book_id)


@router.get("/borrower/{borrower_id}/history")
def get_borrower_history(
    borrower_id: int, use_case=Depends(get_borrower_history_use_case)
):
    return use_case.execute(borrower_id)


@router.get("/{borrowing_id}")
def get_one(borrowing_id: int, use_case=Depends(get_borrowing_use_case)):
    try:
        return use_case.execute(borrowing_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("/{borrowing_id}/return")
def return_borrowing(borrowing_id: int, use_case=Depends(return_borrowing_use_case)):
    try:
        return use_case.execute(borrowing_id)

    except ValueError as error:
        print("ERREUR RETURN BORROWING :", error)

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
