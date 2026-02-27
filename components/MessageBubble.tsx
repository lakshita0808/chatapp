import { formatTimestamp } from "@/lib/formatTimestamp";
import { emojiToReactionKey } from "@/lib/reactions";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  _id: string;
  text: string;
  senderId: string;
  createdAt: number;
  deleted?: boolean;
  reactions?: Record<string, string[]>;
  pending?: boolean;
  failed?: boolean;
};

const REACTION_OPTIONS = ["👍", "❤️", "😂", "😮", "😢"] as const;

export function MessageBubble({
  message,
  isMine,
  senderLabel,
  currentUserId,
  onDelete,
  onToggleReaction,
  onRetry
}: {
  message: ChatMessage;
  isMine: boolean;
  senderLabel: string;
  currentUserId: string;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onRetry: (messageId: string) => void;
}) {
  const isPersisted = !message._id.startsWith("local-");

  return (
    <div className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
          isMine ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground shadow-sm"
        )}
      >
        {!isMine ? <p className="mb-1 text-xs text-muted-foreground">{senderLabel}</p> : null}
        <p className={cn(message.deleted && "italic opacity-80")}>
          {message.deleted ? "This message was deleted" : message.text}
        </p>
        {message.failed ? (
          <button
            className={cn(
              "mt-1 text-left text-xs underline",
              isMine ? "text-primary-foreground" : "text-red-600"
            )}
            onClick={() => onRetry(message._id)}
            type="button"
          >
            Failed to send. Retry
          </button>
        ) : null}
        {message.pending ? (
          <p className={cn("mt-1 text-xs", isMine ? "text-primary-foreground/80" : "text-muted-foreground")}>
            Sending...
          </p>
        ) : null}
        {!message.deleted && isPersisted ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {REACTION_OPTIONS.map((emoji) => {
              const users = message.reactions?.[emojiToReactionKey(emoji)] || [];
              const active = users.includes(currentUserId);
              return (
                <button
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border"
                  )}
                  key={emoji}
                  onClick={() => onToggleReaction(message._id, emoji)}
                  type="button"
                >
                  {emoji} {users.length > 0 ? users.length : ""}
                </button>
              );
            })}
          </div>
        ) : null}
        {isMine && !message.deleted && isPersisted ? (
          <button
            className={cn("mt-1 text-xs underline", isMine ? "text-primary-foreground/85" : "text-red-600")}
            onClick={() => onDelete(message._id)}
            type="button"
          >
            Delete
          </button>
        ) : null}
        <p className={cn("mt-1 text-[11px]", isMine ? "text-primary-foreground/85" : "text-muted-foreground")}>
          {formatTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
