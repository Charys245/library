from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.dependencies import (
    add_book_use_case,
    list_books_use_case,
    borrow_book_use_case,
    update_book_use_case,
    delete_book_use_case,
    get_book_use_case,
)

router = APIRouter(
    prefix="/books",
    tags=["Books"],
)


class CreateBookRequest(BaseModel):
    title: str
    author: str
    isbn: str | None = None
    published_year: int | None = None
    category: str | None = None
    description: str | None = None


class UpdateBookRequest(BaseModel):
    title: str
    author: str
    isbn: str | None = None
    published_year: int | None = None
    category: str | None = None
    description: str | None = None


@router.post("")
def create_book(data: CreateBookRequest, use_case=Depends(add_book_use_case)):
    return use_case.execute(
        title=data.title,
        author=data.author,
        isbn=data.isbn,
        published_year=data.published_year,
        category=data.category,
        description=data.description,
    )


@router.get("")
def get_books(
    use_case=Depends(list_books_use_case),
):
    return use_case.execute()


@router.post("/{book_id}/borrow")
def borrow(
    book_id: int,
    use_case=Depends(borrow_book_use_case),
):
    try:
        return use_case.execute(book_id)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# @router.get("/{book_id}")
# def get_book(book_id: int):
#     book = book_repository.get_by_id(book_id)

#     if book is None:
#         raise HTTPException(status_code=404, detail="Book not found")

#     return book


@router.get("/{book_id}")
def get_book(book_id: int, use_case=Depends(get_book_use_case)):
    try:
        return use_case.execute(book_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.put("/{book_id}")
def update(
    book_id: int, data: UpdateBookRequest, use_case=Depends(update_book_use_case)
):
    try:
        return use_case.execute(
            book_id=book_id,
            title=data.title,
            author=data.author,
            isbn=data.isbn,
            published_year=data.published_year,
            category=data.category,
            description=data.description,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.delete("/{book_id}")
def delete_book(book_id: int, use_case=Depends(delete_book_use_case)):
    try:
        use_case.execute(book_id)

        return {
            "message": "Book deleted successfully",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
