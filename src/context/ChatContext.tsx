"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import type {
  ChatConversationMap,
  ChatMessage,
} from "@/types/chatbot";

type ChatContextValue = {
  conversations: ChatConversationMap;
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (
    pathname: string,
    message: ChatMessage,
  ) => void;
  clearConversation: (
    pathname: string,
  ) => void;
};

const ChatContext =
  createContext<ChatContextValue | null>(
    null,
  );

export function ChatProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    conversations,
    setConversations,
  ] = useState<ChatConversationMap>({});

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addMessage = useCallback(
    (
      pathname: string,
      message: ChatMessage,
    ) => {
      setConversations((current) => ({
        ...current,
        [pathname]: [
          ...(current[pathname] ?? []),
          message,
        ],
      }));
    },
    [],
  );

  const clearConversation = useCallback(
    (pathname: string) => {
      setConversations((current) => {
        const next = {
          ...current,
        };

        delete next[pathname];

        return next;
      });
    },
    [],
  );

  const value =
    useMemo<ChatContextValue>(
      () => ({
        conversations,
        isOpen,
        openChat,
        closeChat,
        addMessage,
        clearConversation,
      }),
      [
        conversations,
        isOpen,
        openChat,
        closeChat,
        addMessage,
        clearConversation,
      ],
    );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context =
    useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat must be used inside ChatProvider.",
    );
  }

  return context;
}