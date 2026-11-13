"use client";

import { useState } from "react";
import { bundleOf, bundlesOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";
import { Sheet } from "@/components/ui/Sheet";

export function BundlesScreen() {
  const state = useSession();
  const bundles = bundlesOf(state).filter((bundle) => bundle.mode === state.mode);
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="px-4 pt-4 pb-36">
      <h1 className="font-heading text-[28px] leading-[34px] font-extrabold">{t(state.language, "bundles.title")}</h1>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {bundles.map((bundle) => (
          <li key={bundle.id}>
            <button type="button" onClick={() => setOpenId(bundle.id)} className="w-full rounded-[12px] border border-line bg-surface p-3 text-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bundle.image} alt="" className="h-28 w-full rounded-[8px] bg-[#F6F3EC] object-contain" />
              <h2 className="mt-2 font-heading text-[16px] font-bold">{bundle.name}</h2>
              <p className="text-[13px] text-ink-600">{bundle.blurb}</p>
              <p className="mt-2 font-bold tabular">
                {formatMoney(state.language, bundle.bundlePrice)}
                <span className="ms-2 text-[12px] font-semibold text-ink-400 line-through">{formatMoney(state.language, bundle.separatePrice)}</span>
              </p>
            </button>
          </li>
        ))}
      </ul>
      {openId ? <BundleSheet id={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}

function BundleSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const bundle = bundleOf(state, id);
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries((bundle?.items ?? []).map((item) => [item.productId, item.qty])));
  if (!bundle) return null;
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()} title={bundle.name}>
      <p className="text-[14px] text-ink-600">{bundle.blurb}</p>
      <p className="mt-1 text-[13px] text-ink-400">
        {t(state.language, "bundles.separate")} {formatMoney(state.language, bundle.separatePrice)}
      </p>
      <h3 className="mt-3 font-semibold">{t(state.language, "bundles.includes")}</h3>
      <ul className="mt-2 grid gap-2">
        {bundle.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt="" className="h-12 w-12 rounded-[8px] bg-[#F6F3EC] object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{item.name}</p>
              <p className="text-[12px] text-ink-600">{item.pack}</p>
            </div>
            <input
              type="number"
              min={1}
              value={qty[item.productId] ?? item.qty}
              onChange={(event) => setQty({ ...qty, [item.productId]: Math.max(1, Number(event.target.value) || 1) })}
              className="h-9 w-14 rounded-[8px] border border-line text-center tabular"
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 h-11 w-full rounded-[10px] bg-brand-green font-bold text-white"
        onClick={() => {
          dispatch({ type: "addBundle", bundleId: id, quantities: qty });
          onClose();
          ui.openCart();
        }}
      >
        {t(state.language, "bundles.add")} · {formatMoney(state.language, bundle.bundlePrice)}
      </button>
    </Sheet>
  );
}
