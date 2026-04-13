import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

async function request(path: string, method = "GET", body?: unknown) {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL");
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }

  return response.status === 204 ? null : response.json();
}

export const apiClient = {
  listApplications: () => request("/applications"),
  createApplication: (payload: unknown) => request("/applications/", "POST", payload),
  updateApplication: (id: string, payload: unknown) =>
    request(`/applications/${id}`, "PUT", payload),
  deleteApplication: (id: string) => request(`/applications/${id}`, "DELETE"),
};
