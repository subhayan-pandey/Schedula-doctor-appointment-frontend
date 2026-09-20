import Link from "next/link";

import type {
  ChatMessage as ChatMessageType,
} from "@/types/chatbot";

type ChatMessageProps = {
  message: ChatMessageType;
};

function AssistantIcon() {
  return (
    <span
      className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]"
      aria-hidden="true"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v2" />
        <path d="M8 5h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" />
        <path d="M9 11h.01" />
        <path d="M15 11h.01" />
        <path d="M9 15c1 .8 2 .9 3 .9s2-.1 3-.9" />
        <path d="M8 19v2" />
        <path d="M16 19v2" />
      </svg>
    </span>
  );
}

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser =
    message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-[var(--brand)] px-3.5 py-2.5 text-sm leading-6 text-white shadow-sm">
          <p className="whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <AssistantIcon />

      <div className="min-w-0 max-w-[88%] pt-0.5">
        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">
          {message.content}
        </p>

        {message.action && (
          <Link
            href={message.action.href}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--brand-deep)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            {message.action.label}

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h13" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}