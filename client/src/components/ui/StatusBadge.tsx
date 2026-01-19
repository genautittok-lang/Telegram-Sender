import { cn } from "@/lib/utils";

type Status = "idle" | "waiting" | "sending" | "error" | "re-auth-needed" | string;

export function StatusBadge({ status }: { status: Status }) {
  const variants: Record<string, string> = {
    idle: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    waiting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    sending: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    "re-auth-needed": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  const defaultStyle = "bg-primary/10 text-primary border-primary/20";
  const selectedStyle = variants[status] || defaultStyle;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider font-mono",
        selectedStyle
      )}
    >
      {status === "re-auth-needed" ? "RE-AUTH" : status}
    </span>
  );
}
