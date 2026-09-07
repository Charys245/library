from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class Borrower:
    id: int
    name: str
    email: str
    phone: str | None = None

    membership_date: str | None = None
    status: str = "active"

    current_borrowings_count: int = 0
    total_borrowings_count: int = 0

    created_at: datetime = field(default_factory=datetime.now)
