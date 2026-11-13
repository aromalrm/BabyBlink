"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { searchCatalog } from "@/lib/commerce";
import { t } from "@/lib/i18n";
import { useDispatch, useSession } from "@/store/session";
import { Icon } from "@/components/ui/Icon";
import { ProductCard } from "@/components/product/ProductCard";
import { useUi } from "@/components/shell/ui-context";

const TRENDING = ["A4 paper", "markers", "sanitizer"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCatalog(state, query), [state, query]);

  function close() {
    setQuery("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-label={t(state.language, "search.title")}>
      <div className="flex items-center gap-2 bg-brand-yellow px-3 py-3">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-surface px-3">
          <Search className="h-4 w-4 text-ink-400" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") dispatch({ type: "noteSearch", query });
            }}
            placeholder={t(state.language, "search.a")}
            className="h-full w-full bg-transparent text-[14px] outline-none"
          />
        </label>
        <button type="button" onClick={close} className="grid h-11 w-11 place-items-center" aria-label={t(state.language, "common.close")}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {query.trim().length === 0 ? (
          <div className="grid gap-5">
            {state.recentSearches.length > 0 ? (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-heading text-[16px] font-bold">{t(state.language, "search.recent")}</h2>
                  <button type="button" className="text-[13px] font-semibold text-brand-green" onClick={() => dispatch({ type: "clearRecentSearches" })}>
                    {t(state.language, "search.clear")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.recentSearches.map((item) => (
                    <button key={item} type="button" onClick={() => setQuery(item)} className="rounded-full bg-surface px-3 py-1.5 text-[13px] shadow-card">
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            <section>
              <h2 className="mb-2 font-heading text-[16px] font-bold">{t(state.language, "search.trending")}</h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((item) => (
                  <button key={item} type="button" onClick={() => setQuery(item)} className="rounded-full bg-brand-yellow-soft px-3 py-1.5 text-[13px] font-semibold">
                    {item}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : results.products.length === 0 && results.categories.length === 0 ? (
          <div className="grid justify-items-center gap-3 py-12 text-center">
            <svg viewBox="0 0 160 100" className="h-20 w-32" aria-hidden>
              <circle cx="70" cy="46" r="28" fill="#FFF6D6" />
              <circle cx="70" cy="46" r="16" fill="none" stroke="#1F1F1F" strokeWidth="4" />
              <path d="M82 58 l18 16" stroke="#0C831F" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <p className="font-semibold">{t(state.language, "search.empty")}</p>
            <button
              type="button"
              className="rounded-[10px] border border-brand-green px-3 py-2 font-bold text-brand-green"
              onClick={() => ui.toast(t(state.language, "search.requested"))}
            >
              {t(state.language, "search.request")}
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {results.categories.length > 0 ? (
              <section>
                <h2 className="mb-2 font-heading text-[16px] font-bold">{t(state.language, "search.categories")}</h2>
                <div className="grid gap-2">
                  {results.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      onClick={() => {
                        dispatch({ type: "noteSearch", query });
                        close();
                      }}
                      className="flex items-center gap-3 rounded-[12px] bg-surface p-2 shadow-card"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-[12px]" style={{ background: category.tint }}>
                        <Icon name={category.icon} className="h-5 w-5" />
                      </span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
            {results.products.length > 0 ? (
              <section>
                <h2 className="mb-2 font-heading text-[16px] font-bold">{t(state.language, "search.products")}</h2>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {results.products.map((product) => (
                    <div key={product.id} onClick={() => dispatch({ type: "noteSearch", query })}>
                      <ProductCard card={product} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
