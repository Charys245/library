import os

from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL n'est pas définie.")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# from sqlalchemy import text

# with engine.connect() as connection:
#     result = connection.execute(text("SELECT 1"))
#     print(result.scalar())

from app.database.models import Base

Base.metadata.create_all(bind=engine)
print("Tables créées avec succès.")
