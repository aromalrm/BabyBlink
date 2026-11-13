"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgePercent, ChevronDown, ChevronRight, Clock, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homeOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t, type CopyKey } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession } from "@/store/session";
import { ModeSwitch, RotatingPlaceholder } from "@/components/shell/AppShell";
import { useUi } from "@/components/shell/ui-context";
import { Icon } from "@/components/ui/Icon";
import { ProductCard, ProductImage } from "@/components/product/ProductCard";

const OFFICE = [
  { title: "hero.office1.title", sub: "hero.office1.sub", cta: "hero.office1.cta", href: "/category/paper-printing", art: "paper" },
  { title: "hero.office2.title", sub: "hero.office2.sub", cta: "hero.office2.cta", href: "/category/pantry", art: "pantry" },
  { title: "hero.office3.title", sub: "hero.office3.sub", cta: "hero.office3.cta", href: "/bundles", art: "bulk" },
] as const;

const SCHOOL = [
  { title: "hero.school1.title", sub: "hero.school1.sub", cta: "hero.school1.cta", href: "/bundles", art: "school" },
  { title: "hero.school2.title", sub: "hero.school2.sub", cta: "hero.school2.cta", href: "/category/art-craft", art: "art" },
  { title: "hero.school3.title", sub: "hero.school3.sub", cta: "hero.school3.cta", href: "/bundles", art: "kit" },
] as const;

export function HomeScreen() {
  const state = useSession();
  const home = homeOf(state);
  const ui = useUi();
  const reduce = useReducedMotion();
  const hold = useRefTimer();

  return (
    <div className="pb-36">
      <header className="bg-brand-yellow px-4 pt-[max(16px,env(safe-area-inset-top))] pb-4 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={ui.openArea} onPointerDown={hold.start} onPointerUp={hold.end} onPointerLeave={hold.end} className="text-start">
            <span className="block font-heading text-[22px] leading-7 font-extrabold tabular">
              {t(state.language, "home.delivery")} {home.etaMins} {t(state.language, "home.mins")}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[14px] leading-5">
              {home.areaName}, {t(state.language, "common.ajman")}
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </button>
          <Link href="/account" aria-label={t(state.language, "nav.account")} className="grid h-10 w-10 place-items-center rounded-full bg-surface" onPointerDown={hold.start} onPointerUp={hold.end} onPointerLeave={hold.end}>
            <UserRound className="h-5 w-5" />
          </Link>
        </div>
        <button type="button" onClick={ui.openSearch} className="mt-3 flex h-11 w-full items-center gap-2 rounded-full bg-surface px-3 text-ink-400">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16 l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <RotatingPlaceholder language={state.language} />
        </button>
        <div className="mt-3">
          <ModeSwitch />
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          key={state.mode}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="px-4 pt-3 lg:px-6"
        >
          <Hero language={state.language} mode={state.mode} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Chip icon={<Clock className="h-3.5 w-3.5" />} label={t(state.language, "promise.speed")} />
            <Chip icon={<ReceiptText className="h-3.5 w-3.5" />} label={t(state.language, "promise.vat")} />
            <Chip icon={<BadgePercent className="h-3.5 w-3.5" />} label={t(state.language, "promise.bulk")} />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-3 lg:grid-cols-8">
            {home.categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="grid justify-items-center gap-1.5 active:scale-[0.96]">
                <span className="grid h-14 w-full place-items-center rounded-[12px]" style={{ background: category.tint }}>
                  <Icon name={category.icon} className="h-6 w-6" />
                </span>
                <span className="line-clamp-2 text-center text-[12px] leading-4">{category.name}</span>
              </Link>
            ))}
          </div>
          {home.rails.map((rail) => (
            <section key={rail.id} className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-heading text-[20px] leading-[26px] font-extrabold">{rail.title}</h2>
                <Link href={`/category/${home.categories[0]?.slug ?? "paper-printing"}`} className="inline-flex items-center gap-0.5 text-[13px] font-bold text-brand-green">
                  {t(state.language, "home.seeAll")}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {rail.products.map((product, index) => (
                  <div key={product.id} className="w-[148px] shrink-0">
                    <ProductCard card={product} priority={rail.id === home.rails[0]?.id && index < 2} />
                  </div>
                ))}
              </div>
            </section>
          ))}
          <section className="mt-6 grid gap-3">
            {home.bundles.map((bundle) => (
              <Link key={bundle.id} href="/bundles" className="grid grid-cols-[1fr_96px] items-center gap-3 overflow-hidden rounded-[12px] border border-line bg-surface p-3 shadow-card">
                <div>
                  <h3 className="font-heading text-[16px] leading-[22px] font-bold">{bundle.name}</h3>
                  <p className="mt-1 text-[13px] text-ink-600">{bundle.blurb}</p>
                  <p className="mt-2 font-heading text-[16px] font-extrabold tabular">
                    {formatMoney(state.language, bundle.bundlePrice)}{" "}
                    <span className="text-[12px] font-semibold text-ink-400 line-through">{formatMoney(state.language, bundle.separatePrice)}</span>
                  </p>
                </div>
                <ProductImage src={bundle.image} alt="" className="rounded-[12px]" />
              </Link>
            ))}
          </section>
          <section className="mt-4 overflow-hidden rounded-[12px] bg-ink-900 px-4 py-4 text-white">
            <p className="font-heading text-[20px] leading-[26px] font-extrabold">{t(state.language, "bulk.banner")}</p>
            <p className="mt-1 text-[13px] text-white/80">{t(state.language, "bulk.bannerBody")}</p>
            <div className="mt-3 flex gap-2">
              {["1–4", "5–9", "10+"].map((tier, index) => (
                <span key={tier} className={cn("rounded-full px-3 py-1 text-[12px] font-bold tabular", index === 2 ? "animate-pulse bg-brand-yellow text-ink-900" : "bg-white/10")}>
                  {tier}
                </span>
              ))}
            </div>
          </section>
          <ReorderStrip orderId={home.reorder?.orderId} images={home.reorder?.images ?? []} />
          <footer className="mt-8 grid gap-3 pb-4 text-[12px] text-ink-600">
            <div className="grid grid-cols-3 gap-2">
              <Trust icon={<ShieldCheck className="h-4 w-4" />} label={t(state.language, "trust.rider")} />
              <Trust icon={<ReceiptText className="h-4 w-4" />} label={t(state.language, "trust.seal")} />
              <Trust icon={<BadgePercent className="h-4 w-4" />} label={t(state.language, "trust.returns")} />
            </div>
            <p>{t(state.language, "trust.legal")}</p>
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReorderStrip({ orderId, images }: { orderId?: string; images: string[] }) {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  if (!orderId) return null;
  return (
    <section className="mt-4 flex items-center justify-between gap-3 rounded-[12px] border border-line bg-surface p-3">
      <div>
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "reorder.title")}</h2>
        <div className="mt-2 flex">
          {images.map((src, index) => (
            <span key={`${src}-${index}`} className="-ms-2 h-10 w-10 overflow-hidden rounded-[8px] border-2 border-white bg-[#F6F3EC] first:ms-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="rounded-[10px] bg-brand-green px-3 py-2 text-[13px] font-bold text-white"
        onClick={() => {
          dispatch({ type: "reorder", orderId });
          ui.openCart();
        }}
      >
        {t(state.language, "reorder.add")}
      </button>
    </section>
  );
}

function useRefTimer() {
  const ui = useUi();
  const timer = useRef<number | null>(null);
  return {
    start() {
      timer.current = window.setTimeout(() => ui.openDemo(), 600);
    },
    end() {
      if (timer.current) window.clearTimeout(timer.current);
    },
  };
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center justify-center gap-1 rounded-full border border-line bg-surface px-1.5 py-2 text-center text-[11px] leading-[14px] font-semibold">
      {icon}
      <span>{label}</span>
    </span>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="grid justify-items-center gap-1 text-center">
      {icon}
      {label}
    </span>
  );
}

function Hero({ language, mode }: { language: "en" | "ar"; mode: "office" | "school" }) {
  const reduce = useReducedMotion();
  const slides = mode === "office" ? OFFICE : SCHOOL;
  const [ref, api] = useEmblaCarousel({ loop: true, direction: language === "ar" ? "rtl" : "ltr" }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const select = () => setIndex(api.selectedScrollSnap());
    api.on("select", select);
    select();
    return () => {
      api.off("select", select);
    };
  }, [api]);
  useEffect(() => {
    if (reduce) api?.plugins()?.autoplay?.stop();
  }, [api, reduce]);

  return (
    <div>
      <div className="overflow-hidden rounded-[12px]" ref={ref}>
        <div className="flex">
          {slides.map((slide) => (
            <article
              key={slide.title}
              className={cn(
                "relative min-w-0 shrink-0 grow-0 basis-full overflow-hidden p-4",
                mode === "office" ? "bg-gradient-to-br from-brand-yellow to-brand-yellow-soft" : "bg-gradient-to-br from-[#FFE1E1] to-[#E7F0FF]",
              )}
            >
              {mode === "school" ? (
                <>
                  <span className="absolute end-6 top-4 h-10 w-10 rounded-full bg-school-coral/40" />
                  <span className="absolute end-16 bottom-6 h-6 w-6 rounded-full bg-school-blue/50" />
                </>
              ) : null}
              <div className="relative grid grid-cols-[1.1fr_0.9fr] items-center gap-2">
                <div>
                  <h2 className="font-heading text-[22px] leading-[26px] font-extrabold tracking-[-0.03em]">
                    {t(language, slide.title as CopyKey)}
                  </h2>
                  <p className="mt-1 text-[14px] leading-5">{t(language, slide.sub as CopyKey)}</p>
                  <Link href={slide.href} className="mt-3 inline-flex h-10 items-center rounded-[10px] bg-brand-green px-4 font-bold text-white">
                    {t(language, slide.cta as CopyKey)}
                  </Link>
                </div>
                <HeroArt kind={slide.art} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {slides.map((slide, dot) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Slide ${dot + 1}`}
            onClick={() => api?.scrollTo(dot)}
            className={cn("h-1.5 rounded-full", dot === index ? "w-4 bg-ink-900" : "w-1.5 bg-ink-400/50")}
          />
        ))}
      </div>
    </div>
  );
}

function HeroArt({ kind }: { kind: string }) {
  return (
    <div className="relative h-[96px]">
      <svg viewBox="0 0 160 130" className="floaty absolute inset-0 h-full w-full" aria-hidden>
        {kind === "paper" ? <PaperArt /> : null}
        {kind === "pantry" ? <PantryArt /> : null}
        {kind === "bulk" ? <BulkArt /> : null}
        {kind === "school" ? <SchoolArt /> : null}
        {kind === "art" ? <ArtSupply /> : null}
        {kind === "kit" ? <KitArt /> : null}
      </svg>
    </div>
  );
}

function PaperArt() {
  return (
    <>
      <g className="floaty-slow">
        <rect x="28" y="48" width="78" height="58" rx="3" fill="#F7F4EE" />
        <rect x="34" y="42" width="78" height="58" rx="3" fill="#fff" />
        <rect x="40" y="36" width="78" height="58" rx="3" fill="#FBF9F4" stroke="#E7E0D2" />
      </g>
      <g>
        <rect x="78" y="22" width="46" height="28" rx="6" fill="#1F1F1F" />
        <rect x="86" y="30" width="22" height="10" rx="2" fill="#F8CB46" />
      </g>
    </>
  );
}

function PantryArt() {
  return (
    <>
      <rect x="18" y="58" width="28" height="40" rx="8" fill="#6B3E2E" />
      <rect x="52" y="40" width="34" height="58" rx="8" fill="#F8CB46" />
      <rect x="94" y="62" width="40" height="36" rx="8" fill="#fff" />
      <circle cx="114" cy="48" r="10" fill="#0C831F" />
    </>
  );
}

function BulkArt() {
  return (
    <>
      <rect x="24" y="70" width="36" height="28" rx="8" fill="#fff" />
      <rect x="66" y="52" width="36" height="46" rx="8" fill="#F8CB46" />
      <rect x="108" y="34" width="36" height="64" rx="8" fill="#0C831F" />
    </>
  );
}

function SchoolArt() {
  return (
    <>
      <rect x="30" y="36" width="52" height="70" rx="6" fill="#fff" />
      <rect x="30" y="36" width="10" height="70" fill="#FF6B6B" />
      <rect x="92" y="48" width="40" height="54" rx="8" fill="#4D96FF" />
      <rect x="70" y="78" width="28" height="8" rx="4" fill="#F8CB46" />
    </>
  );
}

function ArtSupply() {
  return (
    <>
      <rect x="24" y="40" width="16" height="64" rx="6" fill="#FF6B6B" />
      <rect x="48" y="32" width="16" height="72" rx="6" fill="#F8CB46" />
      <rect x="72" y="46" width="16" height="58" rx="6" fill="#4D96FF" />
      <rect x="100" y="58" width="36" height="36" rx="8" fill="#fff" />
    </>
  );
}

function KitArt() {
  return (
    <>
      <path d="M30 58 L80 34 L130 58 L80 82 Z" fill="#F8CB46" />
      <path d="M30 58 L80 82 L80 112 L30 88 Z" fill="#E7C99A" />
      <path d="M80 82 L130 58 L130 88 L80 112 Z" fill="#C4A574" />
    </>
  );
}
