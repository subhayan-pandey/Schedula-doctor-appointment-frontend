import Link from "next/link";

import type {
  ChatMessage as ChatMessageType,
} from "@/types/chatbot";

type ChatMessageProps = {
  message: ChatMessageType;
};

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-2xl rounded-br-md bg-[var(--brand)] px-3.5 py-2.5 text-sm leading-6 text-white"
            : "max-w-[90%] text-sm leading-6 text-[var(--ink)]"
        }
      >
        <p className="whitespace-pre-wrap">
          {message.content}
        </p>

        {!isUser &&
          message.action && (
            <Link
              href={
                message.action.href
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--brand-deep)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              {message.action.label}

              <span
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          )}
      </div>
    </div>
  );
}