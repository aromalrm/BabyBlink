"use client";

import Link from "next/link";
import { homeOf } from "@/lib/commerce";
import { t } from "@/lib/i18n";
import { useSession } from "@/store/session";
import { ModeSwitch } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";

export function CategoriesScreen() {
  const state = useSession();
  const home = homeOf(state);
  return (
    <div className="px-4 pt-4 pb-36">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-[28px] leading-[34px] font-extrabold">{t(state.language, "nav.categories")}</h1>
        <div className="w-40"><ModeSwitch /></div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {home.categories.map((category) => (
          <li key={category.id}>
            <Link href={`/category/${category.slug}`} className="grid justify-items-center gap-2 rounded-[12px] p-3 text-center text-[13px] font-semibold" style={{ background: category.tint }}>
              <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-surface">
                <Icon name={category.icon} className="h-5 w-5" />
              </span>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/bundles" className="mt-6 inline-block font-bold text-brand-green">{t(state.language, "bundles.title")}</Link>
    </div>
  );
}
