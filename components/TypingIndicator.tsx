export function TypingIndicator({ names }: { names: string[] }) {
  if (!names.length) return null;

  const label = names.length === 1 ? `${names[0]} is typing...` : `${names.slice(0, 2).join(", ")} are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:100ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:200ms]" />
      </div>
      <p>{label}</p>
    </div>
  );
}
