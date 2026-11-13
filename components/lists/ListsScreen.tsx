"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { listsOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";

export function ListsScreen() {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const lists = listsOf(state);
  const [name, setName] = useState("");

  return (
    <div className="px-4 pt-4 pb-36">
      <h1 className="font-heading text-[28px] leading-[34px] font-extrabold">{t(state.language, "lists.title")}</h1>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || state.lines.length === 0) {
            ui.toast(t(state.language, "lists.empty"));
            return;
          }
          dispatch({ type: "createList", name });
          setName("");
          ui.toast(t(state.language, "lists.saved"));
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t(state.language, "lists.name")}
          className="h-11 flex-1 rounded-[10px] border border-line bg-surface px-3"
        />
        <button type="submit" className="h-11 rounded-[10px] bg-brand-green px-4 font-bold text-white">
          {t(state.language, "lists.save")}
        </button>
      </form>
      <ul className="mt-4 grid gap-4">
        {lists.map((list) => (
          <li key={list.id} className="rounded-[12px] border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-[16px] font-bold">{list.name}</h2>
              <span className="text-[12px] text-ink-600 tabular">{list.count} {t(state.language, "bundles.count")}</span>
            </div>
            {list.lines.length === 0 ? <p className="mt-2 text-[13px] text-ink-600">{t(state.language, "lists.empty")}</p> : (
              <ul className="mt-3 grid gap-2">
                {list.lines.map((line) => (
                  <li key={`${line.productId}-${line.packId}`} className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.image} alt="" className="h-12 w-12 rounded-[8px] bg-[#F6F3EC] object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{line.name}</p>
                      <p className="text-[12px] text-ink-600 tabular">{formatMoney(state.language, line.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="-" className="grid h-8 w-8 place-items-center rounded-full border border-line" onClick={() => dispatch({ type: "setListQty", listId: list.id, productId: line.productId, packId: line.packId, qty: line.qty - 1 })}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center tabular">{line.qty}</span>
                      <button type="button" aria-label="+" className="grid h-8 w-8 place-items-center rounded-full bg-brand-green text-white" onClick={() => dispatch({ type: "setListQty", listId: list.id, productId: line.productId, packId: line.packId, qty: line.qty + 1 })}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="mt-3 h-10 w-full rounded-[10px] bg-brand-green font-bold text-white"
              onClick={() => {
                dispatch({ type: "addList", listId: list.id });
                ui.openCart();
              }}
            >
              {t(state.language, "lists.addAll")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
