from dataclasses import dataclass


@dataclass
class ApplicationModel:
    id: int
    company: str
    role: str
    status: str
