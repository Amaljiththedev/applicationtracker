class ApplicationRepository:
    def __init__(self, supabase_client) -> None:
        self.supabase = supabase_client

    def create(self, payload: dict) -> dict:
        response = self.supabase.table("applications").insert(payload).execute()
        return response.data[0]

    def list_all(self, user_id: str) -> list[dict]:
        response = (
            self.supabase.table("applications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    def update(self, application_id: str, user_id: str, payload: dict):
        response = (
            self.supabase.table("applications")
            .update(payload)
            .eq("id", application_id)
            .eq("user_id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def delete(self, application_id: str, user_id: str) -> bool:
        response = (
            self.supabase.table("applications")
            .delete()
            .eq("id", application_id)
            .eq("user_id", user_id)
            .execute()
        )
        return bool(response.data)
