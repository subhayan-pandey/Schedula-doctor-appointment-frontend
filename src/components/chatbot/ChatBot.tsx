"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import ChatTrigger from "./ChatTrigger";
import ChatWindow from "./ChatWindow";

import { useChat } from "@/context/ChatContext";

import { detectIntent } from "@/lib/chatbot/intents";

import {
  getGuestAccessResponse,
  getInitialSuggestions,
  getResponseForIntent,
} from "@/lib/chatbot/responses";

import { getSession } from "@/lib/storage";

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

function getCurrentUserRole(): ChatUserRole {
  /*
   * Avoid accessing browser-only storage during SSR.
   * Guests are the safe default until the client can
   * read the existing Schedula session.
   */
  if (typeof window === "undefined") {
    return "guest";
  }

  const session = getSession();

  if (!session) {
    return "guest";
  }

  if (session.role === "doctor") {
    return "doctor";
  }

  return "patient";
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

  const [isTyping, setIsTyping] =
    useState(false);

  const responseTimerRef =
    useRef<number | null>(null);

  /*
   * Resolve the current role from the existing
   * application session.
   *
   * There is intentionally no setState inside
   * an effect here, which avoids the React warning
   * about cascading renders.
   */
  const userRole =
    getCurrentUserRole();

  const isHidden =
    HIDDEN_ROUTES.includes(pathname);

  const messages =
    conversations[pathname] ?? [];

  /*
   * These suggestions are lightweight derived data.
   * useMemo is unnecessary here and would only add
   * dependency-management overhead.
   */
  const suggestions =
    getInitialSuggestions(
      pathname,
      userRole,
    );

  /*
   * Clear a pending assistant response when the
   * component is unmounted.
   */
  useEffect(() => {
    return () => {
      if (
        responseTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          responseTimerRef.current,
        );

        responseTimerRef.current =
          null;
      }
    };
  }, []);

  function cancelPendingResponse() {
    if (
      responseTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        responseTimerRef.current,
      );

      responseTimerRef.current =
        null;
    }

    setIsTyping(false);
  }

  function handleMessage(
    content: string,
  ) {
    /*
     * Prevent duplicate messages while an
     * assistant response is being prepared.
     */
    if (
      responseTimerRef.current !==
      null
    ) {
      return;
    }

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    const userMessage =
      createMessage(
        "user",
        trimmedContent,
      );

    addMessage(
      pathname,
      userMessage,
    );

    const {
      intent,
    } = detectIntent(
      trimmedContent,
    );

    let response =
      getResponseForIntent(
        intent,
        userRole,
      );

    /*
     * Apply guest-specific access rules after
     * normal intent resolution.
     */
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

    setIsTyping(true);

    responseTimerRef.current =
      window.setTimeout(() => {
        responseTimerRef.current =
          null;

        setIsTyping(false);

        addMessage(
          pathname,
          assistantMessage,
        );
      }, 420);
  }

  function handleNewChat() {
    cancelPendingResponse();

    clearConversation(pathname);
  }

  function handleClose() {
    cancelPendingResponse();

    closeChat();
  }

  /*
   * Hide the chatbot only on authentication pages.
   * Every other page keeps the existing "Need help?"
   * trigger available.
   */
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
          isTyping={isTyping}
          onSend={handleMessage}
          onSuggestionClick={
            handleMessage
          }
          onClose={handleClose}
          onNewChat={
            handleNewChat
          }
        />
      )}
    </>
  );
}