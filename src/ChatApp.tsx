import { useEffect, useLayoutEffect, useRef } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useChatStore } from "@/store/chatStore";
import { ROUTES, navigate } from "@/routing/router";
import { selectIsGuest, useAuthStore } from "@/store/authStore";

export default function ChatApp() {
  const status = useAuthStatus();
  const isGuest = useAuthStore(selectIsGuest);
  const hasLoadedConversations = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") navigate(ROUTES.landing, { replace: true });
  }, [status]);

  // Guests keep no history: start empty instead of loading anything. Runs before paint so
  // cached or sample chats never flash by.
  useLayoutEffect(() => {
    if (status === "authenticated" && isGuest) useChatStore.getState().startGuestSession();
  }, [status, isGuest]);

  useEffect(() => {
    if (status === "authenticated" && !hasLoadedConversations.current) {
      hasLoadedConversations.current = true;
      void useChatStore.getState().loadConversationsFromServer();
    }
  }, [status]);

  if (status !== "authenticated") return null;

  return <ChatLayout />;
}