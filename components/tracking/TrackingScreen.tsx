"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Phone, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackingOf, type OrderStatus } from "@/lib/commerce";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";
import { Sheet } from "@/components/ui/Sheet";

const DELAY: Record<Exclude<OrderStatus, "delivered">, number> = {
  placed: 6000,
  packing: 10000,
  out: 12000,
};

const PATH = [
  { x: 48, y: 168 },
  { x: 92, y: 150 },
  { x: 140, y: 128 },
  { x: 188, y: 96 },
  { x: 236, y: 72 },
  { x: 278, y: 48 },
];

export function TrackingScreen({ id }: { id: string }) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const reduce = useReducedMotion();
  const view = trackingOf(state, id);
  const [showSuccess, setShowSuccess] = useState(view?.status === "placed");
  const [ratedFor, setRatedFor] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [chips, setChips] = useState<string[]>([]);
  const rateOpen = Boolean(view?.delivered && view.rating === null && ratedFor !== view.id);

  const status = view?.status;
  useEffect(() => {
    if (!status || status === "delivered") return;
    const wait = DELAY[status] / state.trackingSpeed;
    const timer = window.setTimeout(() => dispatch({ type: "advanceOrder", orderId: id }), reduce ? 400 : wait);
    return () => window.clearTimeout(timer);
  }, [dispatch, id, reduce, state.trackingSpeed, status]);

  if (!view) {
    return (
      <div className="p-6">
        <p>{t(state.language, "orders.empty")}</p>
        <Link href="/orders" className="mt-3 inline-block font-bold text-brand-green">{t(state.language, "orders.title")}</Link>
      </div>
    );
  }

  const progress = view.status === "placed" ? 0 : view.status === "packing" ? 0.18 : view.status === "out" ? 0.62 : 1;
  const rider = pointAt(progress);

  return (
    <div className="pb-28">
      <div className="relative h-[280px] overflow-hidden bg-[#E7F2E4]">
        <svg viewBox="0 0 320 220" className="h-full w-full" role="img" aria-label={view.areaName}>
          <path d="M0 180 C40 150 70 190 120 160 C170 130 190 170 250 140 C290 120 310 150 320 130 L320 220 L0 220 Z" fill="#D7E8C8" />
          <path d="M0 40 C50 70 80 20 140 48 C190 72 220 30 320 58 L320 0 L0 0 Z" fill="#C5DDF0" />
          <path d={PATH.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ")} fill="none" stroke="#0C831F" strokeWidth="3" strokeDasharray="6 6" />
          <circle cx={PATH[0].x} cy={PATH[0].y} r="7" fill="#F8CB46" stroke="#1A1A1A" />
          <circle cx={PATH[PATH.length - 1].x} cy={PATH[PATH.length - 1].y} r="7" fill="#0C831F" />
        </svg>
        <motion.div
          className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-white"
          animate={{ left: `${(rider.x / 320) * 100}%`, top: `${(rider.y / 220) * 100}%` }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.23, 1, 0.32, 1] }}
        >
          DD
        </motion.div>
        <p className="absolute start-4 top-4 rounded-full bg-surface px-3 py-1 text-[12px] font-bold">{view.areaName}</p>
      </div>
      <div className="px-4 py-4">
        <h1 className="font-heading text-[24px] leading-[30px] font-extrabold">
          {view.delivered ? t(state.language, "track.delivered") : `${t(state.language, "track.onTheWay")} ${view.areaName}`}
        </h1>
        {view.delivered ? null : (
          <p className="mt-1 text-[14px] font-semibold text-brand-green tabular">
            {t(state.language, "track.arriving")} {view.etaMins} {t(state.language, "home.mins")}
          </p>
        )}
        <ol className="mt-4 grid gap-3">
          {view.steps.map((step) => (
            <li key={step.id} className="flex items-center gap-3">
              <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold", step.state === "upcoming" ? "bg-line text-ink-400" : "bg-brand-green text-white")}>
                {step.state === "done" || step.state === "current" ? <Check className="h-3.5 w-3.5" /> : ""}
              </span>
              <span className={cn("text-[14px]", step.state === "current" && "font-bold")}>{step.label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-center justify-between rounded-[12px] border border-line bg-surface p-3">
          <div>
            <p className="font-semibold">{view.riderName}</p>
            <p className="text-[12px] text-ink-600 tabular">{view.riderBike} · {view.riderRating}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => ui.toast(t(state.language, "track.unavailable"))} className="inline-flex items-center gap-1 rounded-full bg-brand-yellow-soft px-3 py-2 text-[13px] font-bold">
              <Phone className="h-3.5 w-3.5" />
              {t(state.language, "track.call")}
            </button>
            <button type="button" onClick={() => ui.toast(t(state.language, "track.unavailable"))} className="rounded-full border border-line px-3 py-2 text-[13px] font-bold">
              {t(state.language, "track.chat")}
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-3 text-[14px] font-bold">
          <Link href={`/orders/${view.id}`} className="text-brand-green">{view.id}</Link>
          <Link href={`/invoice/${view.id}`} className="text-ink-600">{t(state.language, "orders.invoice")}</Link>
        </div>
      </div>
      {showSuccess && view.status === "placed" ? (
        <div className="fixed inset-0 z-40 grid content-center justify-items-center bg-brand-green px-6 text-center text-white">
          <motion.span
            initial={reduce ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-white text-brand-green"
          >
            <Check className="h-10 w-10" />
          </motion.span>
          <h2 className="mt-4 font-heading text-[28px] font-extrabold">{t(state.language, "track.placed")}</h2>
          <p className="mt-1 tabular">{view.id}</p>
          <button type="button" onClick={() => setShowSuccess(false)} className="mt-6 h-12 rounded-full bg-white px-6 font-bold text-brand-green">
            {t(state.language, "track.skip")}
          </button>
        </div>
      ) : null}
      <Sheet open={rateOpen} onOpenChange={(open) => { if (!open) setRatedFor(view.id); }} title={t(state.language, "track.rate")}>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" aria-label={`${value}`} onClick={() => setStars(value)} className={cn("grid h-10 w-10 place-items-center rounded-full", value <= stars ? "bg-brand-yellow text-ink-900" : "bg-line text-ink-400")}>
              <Star className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["rate.onTime", "rate.packed", "rate.friendly"] as const).map((key) => {
            const label = t(state.language, key);
            const on = chips.includes(label);
            return (
              <button key={key} type="button" onClick={() => setChips((current) => (on ? current.filter((item) => item !== label) : [...current, label]))} className={cn("rounded-full border px-3 py-1.5 text-[13px] font-semibold", on ? "border-brand-green bg-brand-green-soft" : "border-line")}>
                {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-4 h-11 w-full rounded-[10px] bg-brand-green font-bold text-white"
          onClick={() => {
            dispatch({ type: "rateOrder", orderId: id, stars, chips });
            setRatedFor(id);
            ui.toast(t(state.language, "track.rated"));
          }}
        >
          {t(state.language, "track.rateSave")}
        </button>
      </Sheet>
    </div>
  );
}

function pointAt(progress: number) {
  const scaled = progress * (PATH.length - 1);
  const index = Math.min(PATH.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const from = PATH[index];
  const to = PATH[index + 1];
  return { x: from.x + (to.x - from.x) * local, y: from.y + (to.y - from.y) * local };
}
