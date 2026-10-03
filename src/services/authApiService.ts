import { useAuthStore } from "@/store/authStore";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL;

export interface CurrentUser {
  authenticated: boolean;
  auth_mode: string;
  user: {
    id: string;
    email: string;
    role: string;
    provider: string;
  };
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const token = await useAuthStore.getState().getAccessToken();
  if (!token) return null; // not logged in, no point calling

  try {
    const response = await fetch(`${RAG_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("auth/me failed:", response.status, await response.text());
      return null;
    }

    return (await response.json()) as CurrentUser;
  } catch (err) {
    console.error("auth/me network error:", err);
    return null;
  }
}