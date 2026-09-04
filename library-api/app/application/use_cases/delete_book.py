
from app.application.ports.book_repository import BookRepository

class DeleteBook:
    def __init__(self, repository:BookRepository):
        self.repository = repository
        
    def execute(self, book_id: int) -> bool:
        book = self.repository.get_by_id(book_id)

        if book is None:
            raise ValueError("Book not found")
        
        if book == "borrowed":
            raise ValueError(
                "Impossible de supprimer un livre actuellement emprunté"
            ) 

        return self.repository.delete(book_id)