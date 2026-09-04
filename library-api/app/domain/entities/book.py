from dataclasses import dataclass, field
from typing import Optional, Literal
from datetime import datetime

BookStatus = Literal["available", "borrowed"]


@dataclass
class Book:
    id: int
    title: str
    author: str

    isbn: Optional[str] = None
    published_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    
    status: str = "available"
    created_at: datetime = field(default_factory=datetime.now)

    def borrow(self):
        if self.status == "borrowed":
            raise ValueError("Ce livre n'est pas disponible")

        self.status = "borrowed"

    def make_available(self):
        self.status = "available"
