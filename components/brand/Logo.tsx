import { cn } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0C831F" />
      <path d="M8 18.5h7.2L13 21l6.2-7.2L13 7.2l2.2 2.5H8v8.8z" fill="#F8CB46" />
    </svg>
  );
}

export function Logo({
  className,
  ink = "text-ink-900",
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}: {
  className?: string;
  ink?: string;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("inline-flex items-center gap-2 font-heading text-[22px] leading-none font-extrabold tracking-[-0.03em]", className)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      aria-label="DeskDash"
    >
      <Mark />
      <span className={ink}>
        Desk<span className="text-brand-green">Dash</span>
      </span>
    </button>
  );
}
