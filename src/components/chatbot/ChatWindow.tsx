"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import ChatMessage from "./ChatMessage";

import {
  getInitialSuggestions,
} from "@/lib/chatbot/responses";

import type {
  ChatMessage as ChatMessageType,
  ChatSuggestion,
} from "@/types/chatbot";

type ChatWindowProps = {
  pathname: string;
  messages: ChatMessageType[];
  suggestions: ChatSuggestion[];
  onSend: (message: string) => void;
  onSuggestionClick: (
    message: string,
  ) => void;
  onClose: () => void;
  onNewChat: () => void;
};

export default function ChatWindow({
  messages,
  onSend,
  onSuggestionClick,
  onClose,
  onNewChat,
  suggestions,
}: ChatWindowProps) {
  const [input, setInput] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message =
      input.trim();

    if (!message) {
      return;
    }

    onSend(message);
    setInput("");
  }

  const showSuggestions =
    messages.length === 0;

  return (
    <section
      role="dialog"
      aria-label="Schedula Guide"
      className="fixed bottom-5 right-4 z-[70] flex h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[390px] origin-bottom-right flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(18,36,43,0.18)] animate-in fade-in zoom-in-95 duration-150 sm:right-6"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Schedula Guide
          </h2>

          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Help understanding and navigating Schedula
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewChat}
            className="rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--brand-deep)] transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            + New
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Schedula Guide"
            className="grid size-8 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {showSuggestions ? (
          <div>
            <div className="max-w-[300px]">
              <p className="text-sm leading-6 text-[var(--ink)]">
                Ask me anything about how
                Schedula works.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {suggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() =>
                      onSuggestionClick(
                        suggestion.message,
                      )
                    }
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-left text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                  >
                    {suggestion.label}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map(
              (message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ),
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--line)] p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 transition focus-within:border-[var(--brand)] focus-within:bg-[var(--surface)]">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            type="text"
            placeholder="Ask about Schedula..."
            className="min-w-0 flex-1 bg-transparent px-0.5 py-1 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand)] text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}