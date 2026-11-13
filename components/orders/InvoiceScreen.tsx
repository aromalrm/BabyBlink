"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { invoiceOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { BRAND } from "@/styles/tokens";
import { useSession } from "@/store/session";

export function InvoiceScreen({ id }: { id: string }) {
  const state = useSession();
  const invoice = invoiceOf(state, id);
  if (!invoice) return <p className="p-6">{t(state.language, "orders.empty")}</p>;
  const rows = [
    [t(state.language, "cart.itemsTotal"), formatMoney(state.language, invoice.itemsTotal)],
    [t(state.language, "cart.bulk"), formatMoney(state.language, invoice.bulkDiscount)],
    [t(state.language, "cart.delivery"), formatMoney(state.language, invoice.deliveryFee)],
    [t(state.language, "cart.handling"), formatMoney(state.language, invoice.handlingFee)],
    [t(state.language, "cart.vat"), formatMoney(state.language, invoice.vat)],
  ];
  return (
    <article className="bg-surface px-4 py-4 text-ink-900">
      <header className="no-print mb-4 flex items-center justify-between">
        <Link href={`/orders/${invoice.id}`} aria-label={t(state.language, "common.back")} className="grid h-10 w-10 place-items-center">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <button type="button" onClick={() => window.print()} className="h-10 rounded-[10px] bg-brand-green px-4 font-bold text-white">
          {t(state.language, "invoice.download")}
        </button>
      </header>
      <p className="text-[12px] font-bold tracking-wide text-ink-400">{t(state.language, "invoice.title")}</p>
      <h1 className="font-heading text-[28px] leading-[34px] font-extrabold tabular">{invoice.invoiceNumber}</h1>
      <p className="text-[13px] text-ink-600">{t(state.language, "invoice.issued")} {invoice.issued} · {invoice.id}</p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
        <div>
          <p className="font-bold">{t(state.language, "invoice.seller")}</p>
          <p>{invoice.seller}</p>
          <p>{BRAND.city}</p>
          <p className="tabular">{t(state.language, "invoice.trn")} {invoice.sellerTrn}</p>
        </div>
        <div>
          <p className="font-bold">{t(state.language, "invoice.buyer")}</p>
          <p>{invoice.buyer}</p>
          <p className="tabular">{t(state.language, "invoice.trn")} {invoice.buyerTrn}</p>
        </div>
      </div>
      <table className="mt-4 w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-start text-ink-400">
            <th className="py-2 font-semibold">{t(state.language, "invoice.item")}</th>
            <th className="py-2 font-semibold">{t(state.language, "invoice.qty")}</th>
            <th className="py-2 font-semibold">{t(state.language, "invoice.unit")}</th>
            <th className="py-2 text-end font-semibold">{t(state.language, "invoice.amount")}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.name} className="border-b border-line">
              <td className="py-2">{line.name}</td>
              <td className="py-2 tabular">{line.qty}</td>
              <td className="py-2 tabular">{formatMoney(state.language, line.unit)}</td>
              <td className="py-2 text-end tabular">{formatMoney(state.language, line.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-3 grid gap-1 text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt>{label}</dt>
            <dd className="tabular">{value}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between font-heading text-[18px] font-extrabold">
          <dt>{t(state.language, "cart.total")}</dt>
          <dd className="tabular">{formatMoney(state.language, invoice.grand)}</dd>
        </div>
      </dl>
      <div className="mt-6 grid h-24 w-24 place-items-center border border-ink-900 text-center text-[11px] font-bold">
        {t(state.language, "invoice.qr")}
      </div>
    </article>
  );
}
