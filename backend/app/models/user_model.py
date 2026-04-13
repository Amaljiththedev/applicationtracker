from dataclasses import dataclass


@dataclass
class UserModel:
    id: int
    email: str
    password: str
