"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${px}px)`);
    const apply = () => setMatches(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [px]);
  return matches;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  variant = "picker",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "picker" | "cart";
}) {
  const reduce = useReducedMotion();
  const tablet = useMinWidth(640);
  const desktop = useMinWidth(1024);
  const presentation = variant === "cart" && desktop ? "drawer" : tablet ? "center" : "sheet";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed z-50 bg-surface shadow-sheet outline-none",
            presentation === "sheet" && "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[20px]",
            presentation === "sheet" && footer && "h-[88dvh]",
            presentation === "center" && "top-1/2 left-1/2 max-h-[80dvh] w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[12px]",
            presentation === "drawer" && "inset-y-0 end-0 w-[min(420px,100%)]",
          )}
        >
          <motion.div
            className="flex max-h-[inherit] flex-col"
            drag={presentation === "sheet" && !reduce ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 700) onOpenChange(false);
            }}
            initial={reduce ? false : { opacity: 0, y: presentation === "sheet" ? 24 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : presentation === "sheet"
                  ? { type: "spring", stiffness: 420, damping: 34 }
                  : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
            }
          >
            {presentation === "sheet" ? <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" /> : null}
            <Dialog.Title className="px-4 pt-3 pb-2 font-heading text-[20px] leading-[26px] font-extrabold">{title}</Dialog.Title>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-4">{children}</div>
            {footer ? <div className="border-t border-line px-4 py-3">{footer}</div> : null}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
