from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    location: str = ""
    salary: str = ""
    job_link: str = ""
    notes: str = ""


class ApplicationUpdate(BaseModel):
    company: str
    role: str
    status: str
    location: str
    salary: str
    job_link: str
    notes: str
