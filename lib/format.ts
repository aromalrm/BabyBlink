import type { Language } from "@/lib/commerce";

export function formatMoney(language: Language, amount: number, digits: "auto" | "invoice" = "auto") {
  const cents = Math.round(amount * 100);
  const showDecimals = digits === "invoice" || cents % 100 !== 0;
  const formatted = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
  return language === "ar" ? `${formatted} AED` : `AED ${formatted}`;
}
