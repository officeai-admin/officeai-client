import { useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  return <ChatLayout />;
}