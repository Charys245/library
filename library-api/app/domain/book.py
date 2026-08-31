from dataclasses import dataclass


@dataclass
class Book:
    id: int
    title: str
    author: str
    available: bool = True

    def borrow(self):
        if not self.available:
            raise ValueError("Ce livre n'est pas disponible")

        self.available = False