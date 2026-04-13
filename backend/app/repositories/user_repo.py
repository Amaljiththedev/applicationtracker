class UserRepository:
    def __init__(self, supabase_client) -> None:
        self.supabase = supabase_client

    def upsert(self, user_id: str, email: str) -> None:
        self.supabase.table("users").upsert(
            {"id": user_id, "email": email or ""},
            on_conflict="id",
        ).execute()
