from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.books import router as books_router
from app.api.borrowers import router as borrowers_router
from app.api.borrowings import router as borrowings_router

app = FastAPI(
    title="Library API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(books_router)
app.include_router(borrowers_router)
app.include_router(borrowings_router)
