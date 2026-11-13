"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { orderOf, ordersOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";

export function OrdersScreen() {
  const state = useSession();
  const orders = ordersOf(state);
  return (
    <div className="px-4 pt-4 pb-36">
      <h1 className="font-heading text-[28px] leading-[34px] font-extrabold">{t(state.language, "orders.title")}</h1>
      {orders.length === 0 ? (
        <div className="mt-8">
          <p className="font-heading text-[18px] font-bold">{t(state.language, "orders.empty")}</p>
          <p className="mt-1 text-ink-600">{t(state.language, "orders.emptyBody")}</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="block rounded-[12px] border border-line bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-[16px] font-bold tabular">{order.id}</p>
                    <p className="text-[13px] text-ink-600">{order.statusLabel} · {t(state.language, order.mode === "office" ? "mode.office" : "mode.school")}</p>
                  </div>
                  <p className="font-bold tabular">{formatMoney(state.language, order.total)}</p>
                </div>
                <div className="mt-3 flex">
                  {order.images.map((src, index) => (
                    <span key={`${src}-${index}`} className="-ms-2 h-10 w-10 overflow-hidden rounded-[8px] border-2 border-white bg-[#F6F3EC] first:ms-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-contain" />
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const order = orderOf(state, id);
  if (!order) {
    return <p className="p-6">{t(state.language, "orders.empty")}</p>;
  }
  return (
    <div className="px-4 pt-3 pb-36">
      <header className="mb-3 flex items-center gap-2">
        <Link href="/orders" aria-label={t(state.language, "common.back")} className="grid h-10 w-10 place-items-center">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="font-heading text-[22px] font-extrabold tabular">{order.id}</h1>
          <p className="text-[13px] text-ink-600">{order.statusLabel}</p>
        </div>
      </header>
      <ul className="grid gap-2">
        {order.lines.map((line) => (
          <li key={`${line.productId}-${line.packId}`} className="flex items-center gap-3 rounded-[12px] border border-line bg-surface p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={line.image} alt="" className="h-14 w-14 rounded-[8px] bg-[#F6F3EC] object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{line.name}</p>
              <p className="text-[12px] text-ink-600">{line.pack} · ×{line.qty}</p>
            </div>
            <p className="font-bold tabular">{formatMoney(state.language, line.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[14px] text-ink-600">{order.addressLines.join(" · ")}</p>
      <p className="text-[14px] text-ink-600">{order.paymentLabel} · {order.slotLabel}</p>
      {order.approvalRequested ? <p className="mt-1 text-[13px] font-semibold text-brand-green">{t(state.language, "cart.approval")}</p> : null}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="h-11 flex-1 rounded-[10px] bg-brand-green font-bold text-white"
          onClick={() => {
            dispatch({ type: "reorder", orderId: order.id });
            ui.openCart();
          }}
        >
          {t(state.language, "orders.reorder")}
        </button>
        {order.status !== "delivered" ? (
          <Link href={`/tracking/${order.id}`} className="grid h-11 flex-1 place-items-center rounded-[10px] border border-line font-bold">
            {t(state.language, "orders.track")}
          </Link>
        ) : null}
        <Link href={`/invoice/${order.id}`} className="grid h-11 flex-1 place-items-center rounded-[10px] border border-line font-bold">
          {t(state.language, "orders.invoice")}
        </Link>
      </div>
    </div>
  );
}
