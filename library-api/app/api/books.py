from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.application.use_cases.add_book import AddBook
from app.application.use_cases.list_books import ListBooks
from app.application.use_cases.borrow_book import BorrowBook
from app.application.use_cases.update_book import UpdateBook
from app.application.use_cases.delete_book import DeleteBook
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
update_book = UpdateBook(repository)
delete_book = DeleteBook(repository)


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
def create_book(data: CreateBookRequest):
    return add_book.execute(
        title=data.title,
        author=data.author,
        isbn=data.isbn,
        published_year=data.published_year,
        category=data.category,
        description=data.description,
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


@router.get("/{book_id}")
def get_book(book_id: int):
    book = repository.get_by_id(book_id)

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return book


@router.put("/{book_id}")
def update(book_id: int, data: UpdateBookRequest):
    try:
        return update_book.execute(
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
def delete_book(book_id: int):
    try:
        delete_book.execute(book_id)

        return {
            "message": "Book deleted successfully",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
