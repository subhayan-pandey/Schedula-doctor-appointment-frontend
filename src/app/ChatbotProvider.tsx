"use client";

import Chatbot from "@/components/chatbot/ChatBot";

import {
  ChatProvider,
} from "@/context/ChatContext";

export default function ChatbotProvider() {
  return (
    <ChatProvider>
      <Chatbot />
    </ChatProvider>
  );
}