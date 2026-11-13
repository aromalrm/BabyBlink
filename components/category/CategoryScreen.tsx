"use client";

import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogOf, type CatalogQuery, type PriceBand, type SortKey } from "@/lib/commerce";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useSession } from "@/store/session";
import { ProductCard } from "@/components/product/ProductCard";
import { useUi } from "@/components/shell/ui-context";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";

export function CategoryScreen({ slug }: { slug: string }) {
  const state = useSession();
  const ui = useUi();
  const [shownSlug, setShownSlug] = useState<string | null>(null);
  const ready = shownSlug === slug;
  const [sort, setSort] = useState<SortKey>("relevance");
  const [brands, setBrands] = useState<string[]>([]);
  const [priceBand, setPriceBand] = useState<PriceBand | null>(null);
  const [pack, setPack] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"sort" | "brand" | "price" | "pack" | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const query: CatalogQuery = { categorySlug: slug, sort, brands, priceBand, pack };
  const facets = catalogOf(state, { categorySlug: slug });
  const view = catalogOf(state, query);
  const groupKey = view.groups.map((group) => group.id).join("|");

  useEffect(() => {
    const timer = window.setTimeout(() => setShownSlug(slug), 400);
    return () => window.clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    if (!ready) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sub]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-sub");
        if (id) setActive(id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.15, 0.4] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ready, groupKey, slug]);

  return (
    <div className="pb-36">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-surface px-3 py-3 lg:top-[68px]">
        <Link href="/" aria-label={t(state.language, "common.back")} className="grid h-10 w-10 place-items-center">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <h1 className="flex-1 font-heading text-[18px] font-extrabold">{view.title}</h1>
        <button type="button" aria-label={t(state.language, "search.title")} onClick={ui.openSearch} className="grid h-10 w-10 place-items-center">
          <Search className="h-5 w-5" />
        </button>
      </header>
      {!ready ? <CategorySkeleton /> : (
        <>
          <div className="flex gap-2 overflow-x-auto px-3 py-2">
            <FilterChip label={t(state.language, "category.sort")} active={sort !== "relevance"} onClick={() => setSheet("sort")} />
            <FilterChip label={t(state.language, "category.brand")} active={brands.length > 0} onClick={() => setSheet("brand")} />
            <FilterChip label={t(state.language, "category.price")} active={Boolean(priceBand)} onClick={() => setSheet("price")} />
            <FilterChip label={t(state.language, "category.pack")} active={Boolean(pack)} onClick={() => setSheet("pack")} />
          </div>
          <div className="flex">
            <aside className="sticky top-[60px] h-[calc(100dvh-140px)] w-[72px] shrink-0 overflow-y-auto lg:top-[120px]">
              {view.groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => document.getElementById(`sub-${group.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={cn("relative grid w-full justify-items-center gap-1 px-1 py-2 text-center text-[10px] leading-3", active === group.id && "bg-brand-green-soft")}
                >
                  {active === group.id ? <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand-green" /> : null}
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-brand-yellow-soft">
                    <Icon name={group.icon} className="h-4 w-4" />
                  </span>
                  {group.name}
                </button>
              ))}
            </aside>
            <div className="min-w-0 flex-1 px-2">
              {view.groups.map((group) => (
                <section key={group.id} id={`sub-${group.id}`} data-sub={group.id} className="scroll-mt-28 pb-4">
                  <h2 className="mb-2 font-heading text-[16px] font-bold">{group.name}</h2>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {group.products.map((product) => (
                      <ProductCard key={product.id} card={product} />
                    ))}
                  </div>
                </section>
              ))}
              {view.count === 0 ? <p className="py-8 text-center text-ink-600">{t(state.language, "search.empty")}</p> : null}
            </div>
          </div>
        </>
      )}
      <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)} title={sheet ? t(state.language, sheet === "sort" ? "category.sort" : sheet === "brand" ? "category.brand" : sheet === "price" ? "category.price" : "category.pack") : ""}>
        {sheet === "sort" ? (
          <div className="grid gap-2">
            {(["relevance", "price-asc", "price-desc"] as const).map((key) => (
              <button key={key} type="button" className={cn("rounded-[12px] px-3 py-3 text-start", sort === key && "bg-brand-green-soft")} onClick={() => { setSort(key); setSheet(null); }}>
                {t(state.language, key === "relevance" ? "sort.relevance" : key === "price-asc" ? "sort.low" : "sort.high")}
              </button>
            ))}
          </div>
        ) : null}
        {sheet === "brand" ? (
          <div className="grid gap-2">
            {facets.brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={brands.includes(brand)}
                  onChange={() => setBrands((current) => (current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]))}
                />
                {brand}
              </label>
            ))}
          </div>
        ) : null}
        {sheet === "price" ? (
          <div className="grid gap-2">
            {([
              [null, "price.any"],
              ["under-20", "price.under"],
              ["20-50", "price.mid"],
              ["over-50", "price.over"],
            ] as const).map(([value, key]) => (
              <button key={key} type="button" className={cn("rounded-[12px] px-3 py-3 text-start", priceBand === value && "bg-brand-green-soft")} onClick={() => { setPriceBand(value); setSheet(null); }}>
                {t(state.language, key)}
              </button>
            ))}
          </div>
        ) : null}
        {sheet === "pack" ? (
          <div className="grid gap-2">
            <button type="button" className={cn("rounded-[12px] px-3 py-3 text-start", pack === null && "bg-brand-green-soft")} onClick={() => { setPack(null); setSheet(null); }}>
              {t(state.language, "price.any")}
            </button>
            {facets.packs.map((item) => (
              <button key={item} type="button" className={cn("rounded-[12px] px-3 py-3 text-start", pack === item && "bg-brand-green-soft")} onClick={() => { setPack(item); setSheet(null); }}>
                {item}
              </button>
            ))}
          </div>
        ) : null}
        {(brands.length > 0 || priceBand || pack) && sheet !== "sort" ? (
          <button type="button" className="mt-3 text-[13px] font-bold text-brand-green" onClick={() => { setBrands([]); setPriceBand(null); setPack(null); }}>
            {t(state.language, "filter.clear")}
          </button>
        ) : null}
      </Sheet>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold", active ? "border-brand-green bg-brand-green-soft text-brand-green-dark" : "border-line bg-surface")}>
      <SlidersHorizontal className="h-3 w-3" />
      {label}
    </button>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex">
      <div className="w-[72px] space-y-3 p-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="shimmer h-14 rounded-[12px]" />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 p-2 lg:grid-cols-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-[12px] border border-line">
            <div className="shimmer aspect-square" />
            <div className="space-y-2 p-2">
              <div className="shimmer h-3 w-4/5 rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
