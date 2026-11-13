"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, Minus, Plus } from "lucide-react";
import { billOf, type ProductCard as Card } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

export function ProductImage({ src, alt, className, priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-[#F6F3EC]", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-contain p-2" placeholder="blur" blurDataURL={BLUR} priority={priority} />
    </div>
  );
}

export function AddControl({
  productId,
  packId,
  qty,
  image,
  stock,
  compact = false,
}: {
  productId: string;
  packId: string;
  qty: number;
  image: string;
  stock: Card["stock"];
  compact?: boolean;
}) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const reduce = useReducedMotion();
  const out = stock === "out";

  function change(next: number, event: React.MouseEvent<HTMLButtonElement>) {
    if (out) return;
    if (next > qty && !reduce) ui.launch(image, event.currentTarget.getBoundingClientRect());
    if (next > qty && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
    dispatch({ type: "setLineQty", productId, packId, qty: next });
  }

  if (out) {
    return (
      <span className="inline-flex h-8 items-center rounded-[10px] border border-line px-2 text-[12px] font-semibold text-ink-400">
        {t(state.language, "product.out")}
      </span>
    );
  }

  if (qty <= 0) {
    return (
      <motion.button
        type="button"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={(event) => change(1, event)}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-[10px] border border-brand-green bg-surface font-heading text-[13px] font-extrabold tracking-wide text-brand-green",
          compact ? "px-2.5" : "px-3",
        )}
      >
        {t(state.language, "product.add")}
      </motion.button>
    );
  }

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-flex h-8 items-center rounded-[10px] bg-brand-green text-white"
    >
      <button type="button" className="grid h-8 w-8 place-items-center" aria-label="-" onClick={(event) => change(qty - 1, event)}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="relative block h-5 w-5 overflow-hidden text-center text-[14px] font-bold tabular">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={qty}
            initial={reduce ? false : { y: 8, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: [1.15, 1] }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0"
          >
            {qty}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" className="grid h-8 w-8 place-items-center" aria-label="+" onClick={(event) => change(qty + 1, event)}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function ProductCard({ card, href, priority = false }: { card: Card; href?: string; priority?: boolean }) {
  const state = useSession();
  const link = href ?? `/product/${card.id}`;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface shadow-card">
      <Link href={link} className="relative block">
        <ProductImage src={card.image} alt={card.name} priority={priority} />
        <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
          {card.badges.map((badge) => (
            <span
              key={badge.kind}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] leading-3 font-bold",
                badge.kind === "discount" && "bg-offer text-white",
                badge.kind === "bulk" && "border border-offer bg-surface text-offer",
                badge.kind === "low" && "bg-danger text-white",
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link href={link} className="line-clamp-2 font-heading text-[13px] leading-[18px] font-semibold text-ink-900">
          {card.name}
        </Link>
        <p className="text-[12px] leading-4 text-ink-400">{card.pack}</p>
        <p className="inline-flex items-center gap-1 text-[10px] leading-3 font-bold tracking-wide text-brand-green tabular">
          <Clock className="h-3 w-3" aria-hidden />
          {card.etaMins} {t(state.language, "product.mins")}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="font-heading text-[16px] leading-5 font-extrabold tabular">{formatMoney(state.language, card.price)}</p>
            {card.mrp > card.price ? (
              <p className="text-[12px] leading-4 text-ink-400 line-through tabular">{formatMoney(state.language, card.mrp)}</p>
            ) : null}
          </div>
          <AddControl productId={card.id} packId={card.packId} qty={card.qty} image={card.image} stock={card.stock} compact />
        </div>
      </div>
    </article>
  );
}

export function useBill() {
  const state = useSession();
  return billOf(state);
}
