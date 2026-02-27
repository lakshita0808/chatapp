import { cn } from "@/lib/utils";

export function OnlineDot({
  online,
  className
}: {
  online?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-label={online ? "online" : "offline"}
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        online ? "bg-emerald-500" : "bg-slate-300",
        className
      )}
      title={online ? "Online" : "Offline"}
    />
  );
}
