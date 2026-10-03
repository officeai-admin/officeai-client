import { useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().init();
    return unsubscribe;
  }, []);

  return <ChatLayout />;
}