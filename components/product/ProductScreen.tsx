"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ArrowLeft, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { productViewOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useSession } from "@/store/session";
import { AddControl, ProductCard, ProductImage } from "@/components/product/ProductCard";

export function ProductScreen({ id }: { id: string }) {
  const state = useSession();
  const [packId, setPackId] = useState<string | undefined>(undefined);
  const [zoom, setZoom] = useState(false);
  const [frame, setFrame] = useState(0);
  const view = productViewOf(state, id, packId);
  if (!view) {
    return <p className="p-6">{t(state.language, "search.empty")}</p>;
  }
  return (
    <div className="pb-36 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-6 lg:pt-6">
      <div>
        <div className="relative bg-[#F6F3EC]">
          <Link href={`/category/${view.categorySlug}`} aria-label={t(state.language, "common.back")} className="absolute start-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-surface lg:hidden">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Link>
          <button type="button" className="block w-full overflow-hidden" onClick={() => setZoom((value) => !value)} aria-label={view.name}>
            <span className={cn("block transition-transform duration-200", zoom ? "scale-150" : "scale-100")}>
              <ProductImage src={view.images[frame] ?? view.images[0]} alt={view.name} />
            </span>
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {view.images.map((image, index) => (
              <button key={image} type="button" aria-label={`${index + 1}`} onClick={() => setFrame(index)} className={cn("h-1.5 rounded-full", frame === index ? "w-4 bg-ink-900" : "w-1.5 bg-ink-900/30")} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 lg:px-0">
        <p className="text-[13px] text-ink-600">{view.brand}</p>
        <h1 className="font-heading text-[24px] leading-[30px] font-extrabold">{view.name}</h1>
        <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-brand-green tabular">
          <Clock className="h-3.5 w-3.5" />
          {view.etaMins} {t(state.language, "product.mins")}
        </p>
        <p className="mt-3 font-heading text-[20px] font-extrabold tabular">
          {formatMoney(state.language, view.price)}{" "}
          {view.mrp > view.price ? <span className="text-[14px] font-semibold text-ink-400 line-through">{formatMoney(state.language, view.mrp)}</span> : null}
        </p>
        {view.packs.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {view.packs.map((pack) => (
              <button key={pack.id} type="button" onClick={() => setPackId(pack.id)} className={cn("rounded-full border px-3 py-1.5 text-[13px] font-semibold", pack.id === view.selectedPackId ? "border-brand-green bg-brand-green-soft" : "border-line")}>
                {pack.label}
              </button>
            ))}
          </div>
        ) : null}
        <h2 className="mt-5 font-heading text-[16px] font-bold">{t(state.language, "product.bulk")}</h2>
        <table className="mt-2 w-full text-[13px]">
          <tbody>
            {view.bulkRows.map((row) => (
              <tr key={row.range} className="border-t border-line">
                <td className="py-2 tabular">{row.range}</td>
                <td className="py-2 font-bold tabular">{formatMoney(state.language, row.unitPrice)}</td>
                <td className="py-2 text-end text-brand-green">{row.saveLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-5 font-heading text-[16px] font-bold">{t(state.language, "product.why")}</h2>
        <ul className="mt-2 grid gap-1 text-[14px]">
          {view.highlights.map((item) => (
            <li key={item} className="ps-3 before:text-brand-green before:content-['•']">{item}</li>
          ))}
        </ul>
        <Accordion.Root type="single" collapsible className="mt-4 border-t border-line">
          <Accordion.Item value="details">
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between py-3 font-semibold">
                {t(state.language, "product.details")}
                <ChevronDown className="h-4 w-4" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-3 text-[14px] text-ink-600">
              <p>{view.description}</p>
              <dl className="mt-2 grid gap-1">
                {view.details.map((detail) => (
                  <div key={detail.label} className="flex justify-between gap-3">
                    <dt>{detail.label}</dt>
                    <dd className="text-ink-900">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
        {view.also.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-2 font-heading text-[16px] font-bold">{t(state.language, "product.also")}</h2>
            <div className="flex gap-3 overflow-x-auto">
              {view.also.map((product) => (
                <div key={product.id} className="w-[148px] shrink-0">
                  <ProductCard card={product} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 lg:bottom-0">
        <div>
          <p className="font-heading text-[16px] font-extrabold tabular">{formatMoney(state.language, view.price)}</p>
          <p className="text-[12px] text-ink-400">{view.stock === "low" && view.lowCount ? t(state.language, "product.mins") : view.brand}</p>
        </div>
        <AddControl productId={view.id} packId={view.selectedPackId} qty={view.qty} image={view.images[0]} stock={view.stock} />
      </div>
    </div>
  );
}
