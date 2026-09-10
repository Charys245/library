from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


from app.api.dependencies import (
    create_borrower_use_case,
    list_borrowers_use_case,
    get_borrower_use_case,
    update_borrower_use_case,
    delete_borrower_use_case,
)

router = APIRouter(prefix="/borrowers", tags=["Borrowers"])


class CreateBorrowerRequest(BaseModel):
    name: str
    email: str
    phone: str | None = None


class UpdateBorrowerRequest(BaseModel):
    name: str
    email: str
    phone: str | None = None


@router.post("")
def create_borrower(
    data: CreateBorrowerRequest, use_case=Depends(create_borrower_use_case)
):
    return use_case.execute(name=data.name, email=data.email, phone=data.phone)


@router.get("/")
def list_all(
    use_case=Depends(list_borrowers_use_case),
):
    return use_case.execute()


@router.get("/{borrower_id}")
def get_one(
    borrower_id: int,
    use_case=Depends(get_borrower_use_case),
):
    try:
        return use_case.execute(borrower_id)

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/{borrower_id}")
def update_borrower(
    borrower_id: int,
    data: UpdateBorrowerRequest,
    use_case=Depends(update_borrower_use_case),
):
    try:
        return use_case.execute(
            borrower_id=borrower_id, name=data.name, email=data.email, phone=data.phone
        )

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.delete("/{borrower_id}")
def delete_borrower(borrower_id: int, use_case=Depends(delete_borrower_use_case)):
    try:
        use_case.execute(borrower_id)

        return {"message": "Emprunteur supprimé avec succès"}

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
