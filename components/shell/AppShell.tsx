"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  CircleUser,
  Clock,
  Home,
  LayoutGrid,
  ReceiptText,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo, Mark } from "@/components/brand/Logo";
import { CartSheet } from "@/components/cart/CartSheet";
import { useBill } from "@/components/product/ProductCard";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { UiProvider, type UiApi } from "@/components/shell/ui-context";
import { Sheet } from "@/components/ui/Sheet";
import { areasOf } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession, useSessionStore } from "@/store/session";

const NAV = [
  { href: "/", key: "nav.home" as const, icon: Home },
  { href: "/categories", key: "nav.categories" as const, icon: LayoutGrid },
  { href: "/lists", key: "nav.reorder" as const, icon: RotateCcw },
  { href: "/orders", key: "nav.orders" as const, icon: ReceiptText },
  { href: "/account", key: "nav.account" as const, icon: CircleUser },
];

type Fly = { id: number; src: string; from: DOMRect; to: DOMRect };
type ToastItem = { id: number; message: string };

export function AppShell({ children }: { children: React.ReactNode }) {
  const state = useSession();
  const dispatch = useDispatch();
  const bill = useBill();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [phase, setPhase] = useState<"splash" | "app">("splash");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [pulse, setPulse] = useState(0);
  const barRef = useRef<HTMLElement | null>(null);
  const hold = useRef<number | null>(null);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = state.language === "ar" ? "ar" : "en";
    document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.mode = state.mode;
  }, [state.language, state.mode]);

  useEffect(() => {
    const seen = sessionStorage.getItem("deskdash-splash") === "1";
    const started = (window as unknown as { __deskdashShown?: number }).__deskdashShown ?? Date.now();
    const short = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const budget = seen ? 0 : short ? 400 : 1600;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("deskdash-splash", "1");
      setPhase("app");
    }, Math.max(0, budget - (Date.now() - started)));
    return () => window.clearTimeout(timer);
  }, []);

  const toast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2500);
  }, []);

  const launch = useCallback(
    (src: string, from: DOMRect) => {
      const bar = barRef.current?.getBoundingClientRect();
      const to = bar ?? new DOMRect(window.innerWidth / 2 - 20, window.innerHeight - 96, 40, 40);
      const id = Date.now() + Math.random();
      setFlies((current) => [...current, { id, src, from, to }]);
    },
    [],
  );

  const api = useMemo<UiApi>(
    () => ({
      openSearch: () => setSearchOpen(true),
      openCart: () => setCartOpen(true),
      openArea: () => setAreaOpen(true),
      openDemo: () => setDemoOpen(true),
      toast,
      launch,
    }),
    [launch, toast],
  );

  const bare = pathname.startsWith("/checkout") || pathname.startsWith("/tracking") || pathname.startsWith("/invoice");
  const areas = areasOf(state);

  function pressStart() {
    hold.current = window.setTimeout(() => setDemoOpen(true), 600);
  }
  function pressEnd() {
    if (hold.current) window.clearTimeout(hold.current);
  }

  return (
    <UiProvider value={api}>
      <div className="print-sheet mx-auto min-h-dvh w-full max-w-[1200px] bg-bg">
        <header className="no-print sticky top-0 z-20 hidden items-center gap-4 bg-brand-yellow px-6 py-3 lg:flex">
          <Logo onPointerDown={pressStart} onPointerUp={pressEnd} onPointerLeave={pressEnd} />
          <button type="button" onClick={() => setAreaOpen(true)} className="text-start">
            <span className="block font-heading text-[16px] font-extrabold tabular">
              {t(state.language, "home.delivery")} {areas.find((area) => area.selected)?.etaMins} {t(state.language, "home.mins")}
            </span>
            <span className="inline-flex items-center gap-1 text-[13px]">
              {areas.find((area) => area.selected)?.name}, {t(state.language, "common.ajman")}
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </button>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-11 flex-1 items-center gap-2 rounded-full bg-surface px-4 text-ink-400">
            <Search className="h-4 w-4" />
            <RotatingPlaceholder language={state.language} />
          </button>
          <ModeSwitch />
          <Link href="/account" aria-label={t(state.language, "nav.account")} className="grid h-10 w-10 place-items-center rounded-full bg-surface">
            <UserRound className="h-5 w-5" />
          </Link>
        </header>
        {children}
        {bare || cartOpen ? null : (
          <nav className="no-print fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[1200px] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn("grid flex-1 justify-items-center py-2 text-[10px] leading-3", active ? "text-brand-green" : "text-ink-400")}>
                  <Icon className="mb-0.5 h-5 w-5" />
                  {t(state.language, item.key)}
                </Link>
              );
            })}
          </nav>
        )}
        {bill.count > 0 && !bare && !cartOpen ? (
          <div className="no-print pointer-events-none fixed inset-x-0 bottom-[64px] z-30 mx-auto w-full max-w-[1200px] px-3 pb-[env(safe-area-inset-bottom)] lg:bottom-4">
            <motion.button
              ref={(node) => {
                barRef.current = node;
              }}
              type="button"
              onClick={() => setCartOpen(true)}
              animate={reduce ? undefined : { scale: pulse ? [1, 1.03, 1] : 1 }}
              className="pointer-events-auto flex h-12 w-full items-center justify-between rounded-full bg-brand-green px-4 font-bold text-white shadow-sheet"
            >
              <span className="tabular">
                {bill.count} {t(state.language, bill.count === 1 ? "cart.item" : "cart.items")} · {formatMoney(state.language, bill.grand)}
              </span>
              <span className="inline-flex items-center gap-1">
                {t(state.language, "cart.view")}
                <ChevronRight className="nudge h-4 w-4 rtl:rotate-180" />
              </span>
            </motion.button>
          </div>
        ) : (
          <span ref={barRef} className="sr-only" />
        )}
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Sheet open={areaOpen} onOpenChange={setAreaOpen} title={t(state.language, "area.title")}>
        <ul className="grid gap-1">
          {areas.map((area) => (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "setArea", areaId: area.id });
                  setAreaOpen(false);
                }}
                className={cn("flex w-full items-center justify-between rounded-[12px] px-3 py-3 text-start", area.selected && "bg-brand-green-soft")}
              >
                <span className="font-semibold">{area.name}</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-green tabular">
                  <Clock className="h-3.5 w-3.5" />
                  {area.etaMins} {t(state.language, "home.mins")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
      <Sheet open={demoOpen} onOpenChange={setDemoOpen} title={t(state.language, "demo.title")}>
        <div className="grid gap-2">
          <DemoButton
            label={t(state.language, "demo.reset")}
            onClick={() => {
              dispatch({ type: "reset" });
              sessionStorage.removeItem("deskdash-splash");
              sessionStorage.removeItem("deskdash-confetti");
              setDemoOpen(false);
              router.push("/");
            }}
          />
          <DemoButton label={t(state.language, "demo.office")} onClick={() => dispatch({ type: "prefillCart", kind: "office" })} />
          <DemoButton label={t(state.language, "demo.school")} onClick={() => dispatch({ type: "prefillCart", kind: "school" })} />
          <DemoButton
            label={`${t(state.language, "demo.speed")} ${state.trackingSpeed === 1 ? "1×" : "2×"}`}
            onClick={() => dispatch({ type: "setTrackingSpeed", speed: state.trackingSpeed === 1 ? 2 : 1 })}
          />
          <DemoButton
            label={t(state.language, "demo.arabic")}
            onClick={() => dispatch({ type: "setLanguage", language: state.language === "ar" ? "en" : "ar" })}
          />
          <p className="pt-2 text-[12px] font-semibold text-ink-400">{t(state.language, "demo.jump")}</p>
          {[
            ["/", "Home"],
            ["/categories", "Categories"],
            ["/bundles", "Bundles"],
            ["/lists", "Reorder"],
            ["/checkout", "Checkout"],
            ["/orders", "Orders"],
            ["/orders/DD-1008", "Order"],
            ["/invoice/DD-1008", "Invoice"],
            ["/tracking/DD-1019", "Tracking"],
            ["/account", "Account"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setDemoOpen(false)} className="rounded-[10px] border border-line px-3 py-2 text-start font-semibold">
              {label}
            </Link>
          ))}
          <button type="button" className="rounded-[10px] border border-line px-3 py-2 text-start font-semibold" onClick={() => { setDemoOpen(false); setCartOpen(true); }}>
            Cart
          </button>
        </div>
      </Sheet>
      <Suspense fallback={null}>
        <DemoQuery onOpen={() => setDemoOpen(true)} />
      </Suspense>
      <div className="pointer-events-none fixed inset-0 z-[70]">
        {flies.map((fly) => (
          <motion.img
            key={fly.id}
            src={fly.src}
            alt=""
            className="absolute h-10 w-10 rounded-[8px] object-contain"
            initial={{ x: fly.from.left, y: fly.from.top, opacity: 1, scale: 1 }}
            animate={{ x: fly.to.left, y: fly.to.top, opacity: 0.3, scale: 0.35 }}
            transition={{ duration: reduce ? 0.01 : 0.55, ease: [0.23, 1, 0.32, 1] }}
            onAnimationComplete={() => {
              setFlies((current) => current.filter((item) => item.id !== fly.id));
              setPulse((value) => value + 1);
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[75] grid justify-items-center gap-2">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.p
              key={item.id}
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="rounded-full bg-ink-900 px-4 py-2 text-[13px] font-semibold text-white"
              role="status"
            >
              {item.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      {phase !== "app" ? (
        <div id="deskdash-splash" className="fixed inset-0 z-[80] grid content-center justify-items-center bg-brand-yellow">
          <motion.div
            initial={reduce ? false : { scale: 0.86 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            onPointerDown={pressStart}
            onPointerUp={pressEnd}
          >
            <span className="flex items-center gap-2 font-heading text-[40px] font-extrabold">
              <Mark className="h-12 w-12" />
              Desk<span className="text-brand-green">Dash</span>
            </span>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 max-w-[280px] text-center text-[14px]">
            {t(state.language, "splash.tagline")}
          </motion.p>
        </div>
      ) : null}
    </UiProvider>
  );
}

function DemoQuery({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || params.get("demo") !== "1") return;
    opened.current = true;
    onOpen();
  }, [onOpen, params]);
  return null;
}

function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[10px] bg-brand-yellow-soft px-3 py-2 text-start font-semibold">
      {label}
    </button>
  );
}

export function ModeSwitch() {
  const state = useSession();
  const dispatch = useDispatch();
  return (
    <div className="grid h-11 grid-cols-2 rounded-full bg-white/50 p-1">
      {(["office", "school"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => dispatch({ type: "setMode", mode })}
          className={cn(
            "rounded-full text-[14px] font-bold",
            state.mode === mode ? "bg-surface text-ink-900 shadow-card" : "text-ink-900/70",
          )}
        >
          {t(state.language, mode === "office" ? "mode.office" : "mode.school")}
        </button>
      ))}
    </div>
  );
}

const SEARCH_KEYS = ["search.a", "search.b", "search.c", "search.d"] as const;

export function RotatingPlaceholder({ language }: { language: "en" | "ar" }) {
  const keys = SEARCH_KEYS;
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % keys.length), 2500);
    return () => window.clearInterval(timer);
  }, [keys, reduce]);
  return (
    <span className="relative block h-5 flex-1 overflow-hidden text-start text-[14px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={keys[index]}
          initial={reduce ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-x-0"
        >
          {t(language, keys[index])}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
