from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


from app.api.dependencies import (
    create_borrower_use_case,
    list_borrowers_use_case,
    get_borrower_use_case,
    update_borrower_use_case,
    delete_borrower_use_case,
)

# from app.adapters.repositories.in_memory_borrower_repository import (
#     InMemoryBorrowerRepository,
# )

# from app.application.use_cases.borrower import CreateBorrower
# from app.application.use_cases.borrower import ListBorrowers
# from app.application.use_cases.borrower import GetBorrower
# from app.application.use_cases.borrower import UpdateBorrower
# from app.application.use_cases.borrower import DeleteBorrower

router = APIRouter(prefix="/borrowers", tags=["Borrowers"])


# Infrastructure
# repository = InMemoryBorrowerRepository()


# create_borrower_use_case = CreateBorrower(repository)
# list_borrowers_use_case = ListBorrowers(repository)
# get_borrower_use_case = GetBorrower(repository)
# update_borrower_use_case = UpdateBorrower(repository)
# delete_borrower_use_case = DeleteBorrower(repository)


class CreateBorrowerRequest(BaseModel):
    name: str
    email: str
    phone: str | None = None


class UpdateBorrowerRequest(BaseModel):
    name: str
    email: str
    phone: str | None = None


@router.post("")
def create_borrower(data: CreateBorrowerRequest):
    return create_borrower_use_case.execute(
        name=data.name, email=data.email, phone=data.phone
    )


@router.get("/")
def list_all():
    return list_borrowers_use_case.execute()


@router.get("/{borrowing_id}")
def get_one(borrower_id: int):
    try:
        return get_borrower_use_case.execute(borrower_id)

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/{borrower_id}")
def update_borrower(borrower_id: int, data: UpdateBorrowerRequest):
    try:
        return update_borrower_use_case.execute(
            borrower_id=borrower_id, name=data.name, email=data.email, phone=data.phone
        )

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.delete("/{borrower_id}")
def delete_borrower(borrower_id: int):
    try:
        delete_borrower_use_case.execute(borrower_id)

        return {"message": "Emprunteur supprimé avec succès"}

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
