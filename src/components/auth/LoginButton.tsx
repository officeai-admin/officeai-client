import { useAuthStore } from "@/store/authStore";

export function LoginButton() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  if (status === "loading") {
    return (
      <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
        …
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <button
        onClick={() => signOut()}
        title={`Signed in as ${user.email} — click to sign out`}
        className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.email ?? "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs">{user.email?.[0]?.toUpperCase()}</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => signInWithGoogle()}
      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
    >
      Sign in
    </button>
  );
}