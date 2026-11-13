"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { areasOf, checkoutOf, type PaymentMethod } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";
import { t, type CopyKey } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession } from "@/store/session";
import { Sheet } from "@/components/ui/Sheet";

const SLOTS = [
  { id: "express", key: "checkout.express" as const, detail: "checkout.expressDetail" as const },
  { id: "today-1", key: "slot.today1" as const },
  { id: "today-2", key: "slot.today2" as const },
  { id: "tom-1", key: "slot.tomorrow1" as const },
  { id: "tom-2", key: "slot.tomorrow2" as const },
];

const NOTES = ["note.call", "note.reception", "note.staff"] as const;
const PAYMENTS: { id: PaymentMethod; key: CopyKey }[] = [
  { id: "card", key: "pay.card" },
  { id: "apple", key: "pay.apple" },
  { id: "cod", key: "pay.cod" },
  { id: "credit", key: "pay.credit" },
];

export function CheckoutScreen() {
  const state = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const view = checkoutOf(state);
  const areas = areasOf(state);
  const [addressId, setAddressId] = useState(view.addresses[0]?.id ?? "");
  const [slot, setSlot] = useState("express");
  const [note, setNote] = useState<(typeof NOTES)[number]>("note.call");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState({ label: "", contact: "", phone: "", building: "", floor: "", areaId: state.areaId });

  function place() {
    if (!addressId) {
      setError(t(state.language, "checkout.needAddress"));
      return;
    }
    if (payment === "card") {
      const digits = card.number.replace(/\s/g, "");
      const expiryOk = /^\d{2}\/\d{2}$/.test(card.expiry);
      if (card.name.trim().length < 2 || digits.length < 12 || digits.length > 19 || !expiryOk || card.cvv.length < 3) {
        setError(t(state.language, "checkout.needCard"));
        return;
      }
    }
    setError("");
    setPending(true);
    const slotLabel = t(state.language, SLOTS.find((item) => item.id === slot)?.key ?? "checkout.express");
    const orderId = `DD-${state.nextOrderNumber}`;
    window.setTimeout(() => {
      dispatch({
        type: "placeOrder",
        addressId,
        paymentMethod: payment,
        instruction: t(state.language, note),
        slotLabel,
      });
      router.replace(`/tracking/${orderId}`);
    }, 700);
  }

  return (
    <div className="px-4 pt-3 pb-36">
      <header className="mb-4 flex items-center gap-2">
        <Link href="/" aria-label={t(state.language, "common.back")} className="grid h-10 w-10 place-items-center">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <h1 className="font-heading text-[24px] leading-[30px] font-extrabold">{t(state.language, "checkout.title")}</h1>
      </header>
      {view.bill.count === 0 ? (
        <p className="text-ink-600">{t(state.language, "cart.emptyBody")}</p>
      ) : (
        <div className="grid gap-6">
          <section>
            <h2 className="font-heading text-[16px] font-bold">{t(state.language, "checkout.address")}</h2>
            <div className="mt-2 grid gap-2">
              {view.addresses.map((address) => (
                <label key={address.id} className={cn("rounded-[12px] border p-3", addressId === address.id ? "border-brand-green bg-brand-green-soft" : "border-line bg-surface")}>
                  <input type="radio" name="address" className="me-2" checked={addressId === address.id} onChange={() => { setAddressId(address.id); setError(""); }} />
                  <span className="font-semibold">{state.language === "ar" ? address.labelAr : address.label}</span>
                  <span className="mt-1 block text-[13px] text-ink-600">
                    {state.language === "ar" ? address.buildingAr : address.building}
                    <br />
                    {state.language === "ar" ? address.floorAr : address.floor} · {address.areaName}
                    <br />
                    {address.contactName} · {address.phone}
                  </span>
                  <span className="mt-1 block text-[12px] font-bold text-brand-green tabular">
                    {address.selectedAreaEta} {t(state.language, "home.mins")}
                  </span>
                </label>
              ))}
              <button type="button" onClick={() => setAdding(true)} className="text-start text-[14px] font-bold text-brand-green">
                {t(state.language, "checkout.addAddress")}
              </button>
            </div>
          </section>
          <section>
            <h2 className="font-heading text-[16px] font-bold">{t(state.language, "checkout.slot")}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {SLOTS.map((item) => (
                <button key={item.id} type="button" onClick={() => setSlot(item.id)} className={cn("rounded-full border px-3 py-2 text-[13px] font-semibold", slot === item.id ? "border-brand-green bg-brand-green text-white" : "border-line bg-surface")}>
                  {t(state.language, item.key)}
                  {"detail" in item && item.detail ? ` · ${t(state.language, item.detail)}` : ""}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-heading text-[16px] font-bold">{t(state.language, "checkout.instructions")}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {NOTES.map((item) => (
                <button key={item} type="button" onClick={() => setNote(item)} className={cn("rounded-full border px-3 py-2 text-[13px] font-semibold", note === item ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-surface")}>
                  {t(state.language, item)}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-heading text-[16px] font-bold">{t(state.language, "checkout.payment")}</h2>
            <div className="mt-2 grid gap-2">
              {PAYMENTS.map((item) => (
                <label key={item.id} className={cn("rounded-[12px] border px-3 py-3", payment === item.id ? "border-brand-green" : "border-line")}>
                  <input type="radio" name="pay" className="me-2" checked={payment === item.id} onChange={() => { setPayment(item.id); setError(""); }} />
                  {t(state.language, item.key)}
                </label>
              ))}
            </div>
            {payment === "card" ? (
              <div className="mt-3 grid gap-2">
                <Field label={t(state.language, "checkout.cardName")} value={card.name} onChange={(name) => { setCard({ ...card, name }); setError(""); }} autoComplete="cc-name" />
                <Field label={t(state.language, "checkout.cardNumber")} value={card.number} onChange={(number) => { setCard({ ...card, number }); setError(""); }} inputMode="numeric" autoComplete="cc-number" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label={t(state.language, "checkout.expiry")} value={card.expiry} onChange={(expiry) => { setCard({ ...card, expiry }); setError(""); }} placeholder="MM/YY" autoComplete="cc-exp" />
                  <Field label={t(state.language, "checkout.cvv")} value={card.cvv} onChange={(cvv) => { setCard({ ...card, cvv }); setError(""); }} inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </div>
            ) : null}
            {payment === "credit" ? <p className="mt-2 text-[13px] text-ink-600">{t(state.language, "pay.credit")}</p> : null}
          </section>
          {error ? <p className="text-[13px] font-semibold text-danger" role="alert">{error}</p> : null}
          <button type="button" disabled={pending} onClick={place} className="h-12 rounded-[10px] bg-brand-green font-heading text-[16px] font-bold text-white disabled:opacity-60">
            {pending ? t(state.language, "checkout.placing") : `${t(state.language, "checkout.place")} · ${formatMoney(state.language, view.bill.grand)}`}
          </button>
        </div>
      )}
      <Sheet open={adding} onOpenChange={setAdding} title={t(state.language, "checkout.addAddress")}>
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.contact.trim() || !draft.building.trim()) {
              setError(t(state.language, "checkout.needAddress"));
              return;
            }
            const id = `addr-${state.addresses.length + 1}`;
            dispatch({
              type: "saveAddress",
              address: {
                id,
                label: draft.label || draft.contact,
                labelAr: draft.label || draft.contact,
                kind: state.mode,
                areaId: draft.areaId,
                building: draft.building,
                buildingAr: draft.building,
                floor: draft.floor,
                floorAr: draft.floor,
                contactName: draft.contact,
                phone: draft.phone,
              },
            });
            setAddressId(id);
            setAdding(false);
            setError("");
          }}
        >
          <Field label={t(state.language, "checkout.label")} value={draft.label} onChange={(label) => setDraft({ ...draft, label })} />
          <Field label={t(state.language, "checkout.contact")} value={draft.contact} onChange={(contact) => setDraft({ ...draft, contact })} />
          <Field label={t(state.language, "checkout.phone")} value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} inputMode="tel" />
          <Field label={t(state.language, "checkout.building")} value={draft.building} onChange={(building) => setDraft({ ...draft, building })} />
          <Field label={t(state.language, "checkout.floor")} value={draft.floor} onChange={(floor) => setDraft({ ...draft, floor })} />
          <label className="grid gap-1 text-[12px] text-ink-600">
            {t(state.language, "checkout.area")}
            <select value={draft.areaId} onChange={(event) => setDraft({ ...draft, areaId: event.target.value })} className="h-11 rounded-[10px] border border-line px-3 text-[14px] text-ink-900">
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="mt-2 h-11 rounded-[10px] bg-brand-green font-bold text-white">{t(state.language, "common.save")}</button>
        </form>
      </Sheet>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "numeric" | "tel";
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-[12px] text-ink-600">
      {label}
      <input value={value} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-[10px] border border-line px-3 text-[14px] text-ink-900" />
    </label>
  );
}
