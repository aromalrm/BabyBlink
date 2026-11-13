"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { accountOf } from "@/lib/commerce";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useDispatch, useSession } from "@/store/session";
import { useUi } from "@/components/shell/ui-context";

export function AccountScreen() {
  const state = useSession();
  const dispatch = useDispatch();
  const ui = useUi();
  const account = accountOf(state);
  const [trn, setTrn] = useState(account.company.trn);
  const [email, setEmail] = useState(account.company.billingEmail);
  return (
    <div className="px-4 pt-4 pb-36">
      <h1 className="font-heading text-[28px] leading-[34px] font-extrabold">{t(state.language, "account.title")}</h1>
      <p className="mt-1 font-semibold">{account.profile.name}</p>
      <p className="text-[14px] text-ink-600">
        {state.language === "ar" ? account.profile.roleAr : account.profile.role} · {state.language === "ar" ? account.profile.organisationAr : account.profile.organisation}
      </p>
      <p className="text-[13px] text-ink-400">{account.areaName}</p>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.mode")}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["office", "school"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => dispatch({ type: "setDefaultMode", mode })} className={cn("h-11 rounded-[10px] border font-bold", account.defaultMode === mode ? "border-brand-green bg-brand-green-soft" : "border-line bg-surface")}>
              {t(state.language, mode === "office" ? "mode.office" : "mode.school")}
            </button>
          ))}
        </div>
      </section>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.language")}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => dispatch({ type: "setLanguage", language: "en" })} className={cn("h-11 rounded-[10px] border font-bold", account.language === "en" ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-surface")}>{t(state.language, "account.english")}</button>
          <button type="button" onClick={() => dispatch({ type: "setLanguage", language: "ar" })} className={cn("h-11 rounded-[10px] border font-bold", account.language === "ar" ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-surface")}>{t(state.language, "account.arabic")}</button>
        </div>
      </section>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.addresses")}</h2>
        <ul className="mt-2 grid gap-2">
          {account.addresses.map((address) => (
            <li key={address.id} className="rounded-[12px] border border-line bg-surface p-3 text-[14px]">
              <p className="font-semibold">{state.language === "ar" ? address.labelAr : address.label}</p>
              <p className="text-ink-600">{state.language === "ar" ? address.buildingAr : address.building} · {address.areaName}</p>
              <p className="text-ink-600">{address.contactName} · {address.phone}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.company")}</h2>
        <form
          className="mt-2 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "setCompany", trn, billingEmail: email });
            ui.toast(t(state.language, "account.saved"));
          }}
        >
          <label className="grid gap-1 text-[12px] text-ink-600">
            {t(state.language, "cart.trn")}
            <input value={trn} onChange={(event) => setTrn(event.target.value)} className="h-11 rounded-[10px] border border-line px-3 text-[14px] text-ink-900" />
          </label>
          <label className="grid gap-1 text-[12px] text-ink-600">
            {t(state.language, "cart.email")}
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-[10px] border border-line px-3 text-[14px] text-ink-900" />
          </label>
          <button type="submit" className="h-11 rounded-[10px] bg-brand-green font-bold text-white">{t(state.language, "account.save")}</button>
        </form>
      </section>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.payments")}</h2>
        <ul className="mt-2 grid gap-2">
          {account.payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between rounded-[12px] border border-line bg-surface px-3 py-3">
              <span className="font-semibold">{payment.label}</span>
              <span className="text-[13px] text-ink-600">{payment.detail}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-5">
        <h2 className="font-heading text-[16px] font-bold">{t(state.language, "account.help")}</h2>
        <Accordion.Root type="single" collapsible className="mt-2">
          {(["faq.1", "faq.2", "faq.3"] as const).map((key) => (
            <Accordion.Item key={key} value={key} className="border-b border-line">
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-3 text-start font-semibold">
                  {t(state.language, `${key}.q`)}
                  <ChevronDown className="h-4 w-4" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-3 text-[14px] text-ink-600">{t(state.language, `${key}.a`)}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </div>
  );
}
