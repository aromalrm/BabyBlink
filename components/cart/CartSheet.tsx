"use client";

import * as Switch from "@radix-ui/react-switch";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { homeOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useDispatch, useSession } from "@/store/session";
import { ProductCard, useBill } from "@/components/product/ProductCard";
import { Sheet } from "@/components/ui/Sheet";

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const state = useSession();
  const dispatch = useDispatch();
  const bill = useBill();
  const reduce = useReducedMotion();
  const celebrated = useRef(false);
  const home = homeOf(state);
  const suggestions = home.rails
    .flatMap((rail) => rail.products)
    .filter((product) => product.qty === 0)
    .slice(0, 6);

  useEffect(() => {
    if (!open || bill.bulkDiscount <= 0 || celebrated.current || reduce) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("deskdash-confetti")) return;
    celebrated.current = true;
    sessionStorage.setItem("deskdash-confetti", "1");
    void confetti({
      particleCount: 70,
      spread: 55,
      origin: { y: 0.72 },
      colors: ["#F8CB46", "#0C831F", "#FFF6D6"],
      disableForReducedMotion: true,
    });
  }, [open, bill.bulkDiscount, reduce]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t(state.language, "cart.title")}
      variant="cart"
      footer={
        bill.lines.length === 0 ? null : (
          <Link
            href="/checkout"
            onClick={() => onOpenChange(false)}
            className="grid h-12 place-items-center rounded-[10px] bg-brand-green font-heading text-[16px] font-bold text-white"
          >
            {t(state.language, "cart.checkout")} · {formatMoney(state.language, bill.grand)}
          </Link>
        )
      }
    >
      <p className="-mt-1 mb-3 text-[13px] text-ink-600 tabular">
        {t(state.language, "home.delivery")} {bill.etaMins} {t(state.language, "home.mins")} · {bill.count}{" "}
        {t(state.language, bill.count === 1 ? "cart.item" : "cart.items")}
      </p>
      {bill.lines.length === 0 ? (
        <div className="grid justify-items-center gap-3 py-8 text-center">
          <EmptyCart />
          <p className="font-heading text-[18px] font-bold">{t(state.language, "cart.empty")}</p>
          <p className="max-w-[240px] text-ink-600">{t(state.language, "cart.emptyBody")}</p>
          <Link href="/categories" onClick={() => onOpenChange(false)} className="rounded-[10px] bg-brand-green px-4 py-2 font-bold text-white">
            {t(state.language, "cart.shop")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bill.bulkDiscount > 0 ? (
            <p className="rounded-[12px] bg-brand-green-soft px-3 py-2 text-[13px] font-semibold text-brand-green-dark">
              {t(state.language, "cart.saving")} {formatMoney(state.language, bill.bulkDiscount)} {t(state.language, "cart.savingTail")}
            </p>
          ) : null}
          <div>
            <div className="mb-1 flex justify-between text-[12px] text-ink-600">
              <span>
                {bill.freeDeliveryGap <= 0
                  ? t(state.language, "cart.freeDone")
                  : `${t(state.language, "cart.freeLeft")} ${formatMoney(state.language, bill.freeDeliveryGap)} ${t(state.language, "cart.freeRight")}`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-green-soft">
              <motion.div
                className="h-full rounded-full bg-brand-green"
                initial={false}
                animate={{ width: `${Math.round(bill.freeDeliveryProgress * 100)}%` }}
                transition={{ duration: reduce ? 0 : 0.35, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>
          <ul className="grid gap-3">
            {bill.lines.map((line) => (
              <li key={`${line.productId}-${line.packId}`} className="flex gap-3">
                <Link href={`/product/${line.productId}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-[#F6F3EC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.image} alt="" className="h-full w-full object-contain p-1" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-semibold">{line.name}</p>
                  <p className="text-[12px] text-ink-400">{line.pack}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold tabular">{formatMoney(state.language, line.lineTotal)}</span>
                    <Qty
                      qty={line.qty}
                      onChange={(qty) => dispatch({ type: "setLineQty", productId: line.productId, packId: line.packId, qty })}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {suggestions.length > 0 ? (
            <div>
              <h3 className="mb-2 font-heading text-[16px] font-bold">{t(state.language, "cart.more")}</h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {suggestions.map((product) => (
                  <div key={product.id} className="w-[148px] shrink-0">
                    <ProductCard card={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <dl className="grid gap-1.5 text-[14px]">
            <Row label={t(state.language, "cart.itemsTotal")} value={formatMoney(state.language, bill.itemsTotal)} />
            <Row label={t(state.language, "cart.bulk")} value={`−${formatMoney(state.language, bill.bulkDiscount)}`} />
            <Row
              label={t(state.language, "cart.delivery")}
              value={bill.deliveryFee === 0 ? t(state.language, "cart.free") : formatMoney(state.language, bill.deliveryFee)}
            />
            <Row label={t(state.language, "cart.handling")} value={formatMoney(state.language, bill.handlingFee)} />
            <Row label={t(state.language, "cart.vat")} value={formatMoney(state.language, bill.vat)} />
            <Row label={t(state.language, "cart.total")} value={formatMoney(state.language, bill.grand)} strong />
          </dl>
          <div className="grid gap-2 rounded-[12px] border border-line p-3">
            <p className="font-semibold">{t(state.language, "cart.company")}</p>
            <label className="grid gap-1 text-[12px] text-ink-600">
              {t(state.language, "cart.trn")}
              <input
                defaultValue={state.company.trn}
                onBlur={(event) => dispatch({ type: "setCompany", trn: event.target.value, billingEmail: state.company.billingEmail })}
                className="h-10 rounded-[10px] border border-line px-3 text-[14px] text-ink-900"
                inputMode="numeric"
              />
            </label>
            <label className="grid gap-1 text-[12px] text-ink-600">
              {t(state.language, "cart.email")}
              <input
                defaultValue={state.company.billingEmail}
                onBlur={(event) => dispatch({ type: "setCompany", trn: state.company.trn, billingEmail: event.target.value })}
                className="h-10 rounded-[10px] border border-line px-3 text-[14px] text-ink-900"
                type="email"
              />
            </label>
            {state.mode === "office" ? (
              <label className="flex items-center justify-between gap-3 pt-1">
                <span>
                  <span className="block font-semibold">{t(state.language, "cart.approval")}</span>
                  <span className="block text-[12px] text-ink-600">{t(state.language, "cart.approvalHint")}</span>
                </span>
                <Switch.Root
                  checked={state.approvalNeeded}
                  onCheckedChange={(needed) => dispatch({ type: "setApproval", needed })}
                  className="h-6 w-11 rounded-full bg-line data-[state=checked]:bg-brand-green"
                >
                  <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
                </Switch.Root>
              </label>
            ) : null}
          </div>
          </div>
      )}
    </Sheet>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "mt-1 flex justify-between font-heading text-[16px] font-extrabold" : "flex justify-between text-ink-600"}>
      <dt>{label}</dt>
      <dd className="tabular text-ink-900">{value}</dd>
    </div>
  );
}

function Qty({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="inline-flex h-8 items-center rounded-[10px] bg-brand-green text-white">
      <button type="button" className="h-8 w-8" onClick={() => onChange(qty - 1)} aria-label="-">
        −
      </button>
      <span className="w-5 text-center text-[14px] font-bold tabular">{qty}</span>
      <button type="button" className="h-8 w-8" onClick={() => onChange(qty + 1)} aria-label="+">
        +
      </button>
    </div>
  );
}

function EmptyCart() {
  return (
    <svg viewBox="0 0 160 120" className="h-24 w-32" aria-hidden>
      <rect x="18" y="28" width="124" height="72" rx="12" fill="#FFF6D6" />
      <rect x="34" y="44" width="46" height="36" rx="6" fill="#F8CB46" />
      <rect x="88" y="50" width="36" height="8" rx="4" fill="#0C831F" />
      <rect x="88" y="66" width="24" height="8" rx="4" fill="#1F1F1F" opacity="0.2" />
    </svg>
  );
}
