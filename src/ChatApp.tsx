import { useEffect, useRef } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useChatStore } from "@/store/chatStore";
import { ROUTES, navigate } from "@/routing/router";

export default function ChatApp() {
  const status = useAuthStatus();
  const hasLoadedConversations = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") navigate(ROUTES.landing, { replace: true });
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && !hasLoadedConversations.current) {
      hasLoadedConversations.current = true;
      void useChatStore.getState().loadConversationsFromServer();
    }
  }, [status]);

  if (status !== "authenticated") return null;

  return <ChatLayout />;
}