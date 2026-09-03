"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import ChatTrigger from "./ChatTrigger";
import ChatWindow from "./ChatWindow";

import {
  useChat,
} from "@/context/ChatContext";

import {
  detectIntent,
} from "@/lib/chatbot/intents";

import {
  getGuestAccessResponse,
  getInitialSuggestions,
  getResponseForIntent,
} from "@/lib/chatbot/responses";

import {
  getSession,
} from "@/lib/storage";

import type {
  ChatMessage,
  ChatUserRole,
} from "@/types/chatbot";

const HIDDEN_ROUTES = [
  "/login",
  "/signup",
  "/doctor/login",
  "/doctor/register",
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
  action?: ChatMessage["action"],
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    role,
    content,
    action,
  };
}

export default function Chatbot() {
  const pathname = usePathname();

  const {
    conversations,
    isOpen,
    openChat,
    closeChat,
    addMessage,
    clearConversation,
  } = useChat();

  const [
    userRole,
    setUserRole,
  ] =
    useState<ChatUserRole>("guest");

  useEffect(() => {
    Promise.resolve().then(() => {
      const session =
        getSession();

      if (!session) {
        setUserRole("guest");

        return;
      }

      if (
        session.role === "doctor"
      ) {
        setUserRole("doctor");

        return;
      }

      setUserRole("patient");
    });
  }, [pathname]);

  const isHidden =
    HIDDEN_ROUTES.includes(pathname);

  const messages =
    conversations[pathname] ?? [];

  const suggestions =
    useMemo(
      () =>
        getInitialSuggestions(
          pathname,
          userRole,
        ),
      [
        pathname,
        userRole,
      ],
    );

  function handleMessage(
    content: string,
  ) {
    const userMessage =
      createMessage(
        "user",
        content,
      );

    addMessage(
      pathname,
      userMessage,
    );

    const {
      intent,
    } = detectIntent(content);

    let response =
      getResponseForIntent(
        intent,
        userRole,
      );

    if (
      userRole === "guest"
    ) {
      response =
        getGuestAccessResponse(
          response,
          intent,
        );
    }

    const assistantMessage =
      createMessage(
        "assistant",
        response.content,
        response.action,
      );

    window.setTimeout(() => {
      addMessage(
        pathname,
        assistantMessage,
      );
    }, 120);
  }

  function handleNewChat() {
    clearConversation(pathname);
  }

  if (isHidden) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-5 right-4 z-[70] sm:right-6">
          <ChatTrigger
            onClick={openChat}
          />
        </div>
      )}

      {isOpen && (
        <ChatWindow
          pathname={pathname}
          messages={messages}
          suggestions={suggestions}
          onSend={handleMessage}
          onSuggestionClick={
            handleMessage
          }
          onClose={closeChat}
          onNewChat={
            handleNewChat
          }
        />
      )}
    </>
  );
}