from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.application.use_cases.add_book import AddBook
from app.application.use_cases.list_books import ListBooks
from app.application.use_cases.borrow_book import BorrowBook
from app.adapters.repositories.in_memory_book_repository import (
    InMemoryBookRepository,
)

router = APIRouter(
    prefix="/books",
    tags=["Books"],
)


# Infrastructure
repository = InMemoryBookRepository()


# Use cases
add_book = AddBook(repository)
list_books = ListBooks(repository)
borrow_book = BorrowBook(repository)


class CreateBookRequest(BaseModel):
    title: str
    author: str


@router.post("")
def create_book(data: CreateBookRequest):
    return add_book.execute(
        title=data.title,
        author=data.author,
    )


@router.get("")
def get_books():
    return list_books.execute()


@router.post("/{book_id}/borrow")
def borrow(book_id: int):

    try:
        return borrow_book.execute(book_id)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# @router.delete("")
# def delete_book(data: CreateBookRequest):
#     return add_book.execute(
#         title=data.title,
#         author=data.author,
#     )
