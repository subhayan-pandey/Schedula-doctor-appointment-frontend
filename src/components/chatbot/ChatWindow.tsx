"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
  KeyboardEvent,
} from "react";

import ChatMessage from "./ChatMessage";

import type {
  ChatMessage as ChatMessageType,
  ChatSuggestion,
} from "@/types/chatbot";

type ChatWindowProps = {
  pathname: string;
  messages: ChatMessageType[];
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onSuggestionClick: (
    message: string,
  ) => void;
  onClose: () => void;
  onNewChat: () => void;
};

function AssistantIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v2" />
      <path d="M8 5h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" />
      <path d="M9 11h.01" />
      <path d="M15 11h.01" />
      <path d="M9 15c1 .8 2 .9 3 .9s2-.1 3-.9" />
      <path d="M8 19v2" />
      <path d="M16 19v2" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]"
        aria-hidden="true"
      >
        <AssistantIcon size={14} />
      </span>

      <div
        className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-3"
        aria-label="Schedula Guide is typing"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--muted)]" />
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:120ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:240ms]" />
      </div>
    </div>
  );
}

export default function ChatWindow({
  messages,
  suggestions,
  isTyping,
  onSend,
  onSuggestionClick,
  onClose,
  onNewChat,
}: ChatWindowProps) {
  const [input, setInput] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const dialogRef =
    useRef<HTMLElement | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isTyping) {
      return;
    }

    const message =
      input.trim();

    if (!message) {
      return;
    }

    onSend(message);
    setInput("");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLElement>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog =
      dialogRef.current;

    if (!dialog) {
      return;
    }

    const focusable =
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href]',
        ),
      );

    if (!focusable.length) {
      return;
    }

    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
      ];

    if (
      event.shiftKey &&
      document.activeElement ===
        first
    ) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement ===
        last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  const showSuggestions =
    messages.length === 0;

  return (
    <section
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedula-guide-title"
      aria-describedby="schedula-guide-description"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed bottom-3 left-3 right-3 z-[70] flex h-[min(680px,calc(100dvh-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(18,36,43,0.18)] animate-in fade-in zoom-in-95 duration-150 sm:bottom-5 sm:left-auto sm:right-6 sm:h-[min(620px,calc(100vh-6rem))] sm:w-[390px]"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <AssistantIcon size={18} />
          </span>

          <div className="min-w-0">
            <h2
              id="schedula-guide-title"
              className="text-sm font-semibold text-[var(--ink)]"
            >
              Schedula Guide
            </h2>

            <p
              id="schedula-guide-description"
              className="mt-0.5 truncate text-xs text-[var(--muted)]"
            >
              Help understanding and navigating Schedula
            </p>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onNewChat}
            disabled={
              messages.length === 0 &&
              !isTyping
            }
            className="rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--brand-deep)] transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            New
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

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Schedula Guide conversation"
        aria-busy={isTyping}
      >
        {showSuggestions ? (
          <div className="flex min-h-full flex-col">
            <div className="flex items-start gap-2.5">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                aria-hidden="true"
              >
                <AssistantIcon size={14} />
              </span>

              <div className="max-w-[290px] pt-0.5">
                <p className="text-sm font-medium text-[var(--ink)]">
                  Hi. I’m the Schedula Guide.
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Ask me how a feature works or where to find something in the app.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Suggested questions
              </p>

              <div className="flex flex-col gap-2">
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
                      className="group rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-left text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          {suggestion.label}
                        </span>

                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--brand-deep)]"
                        >
                          <path d="M5 12h13" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </span>
                    </button>
                  ),
                )}
              </div>
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

            {isTyping && (
              <TypingIndicator />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        aria-label="Send a message to Schedula Guide"
        className="shrink-0 border-t border-[var(--line)] p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 transition focus-within:border-[var(--brand)] focus-within:bg-[var(--surface)]">
          <label
            htmlFor="schedula-guide-input"
            className="sr-only"
          >
            Ask Schedula Guide a question
          </label>

          <input
            ref={inputRef}
            id="schedula-guide-input"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            type="text"
            disabled={isTyping}
            autoComplete="off"
            placeholder={
              isTyping
                ? "Schedula Guide is replying..."
                : "Ask about Schedula..."
            }
            className="min-w-0 flex-1 bg-transparent px-0.5 py-1 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] disabled:cursor-wait disabled:opacity-70"
          />

          <button
            type="submit"
            disabled={
              !input.trim() ||
              isTyping
            }
            aria-label="Send message"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand)] text-white transition hover:bg-[var(--brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
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