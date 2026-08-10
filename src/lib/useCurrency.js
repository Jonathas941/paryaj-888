import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";

// Reactive currency bound to the active language.
// Haitian Creole (ht) -> HTG, English/Spanish -> USD.
// Any component using this re-renders when the language changes, so every
// money display stays in sync with the selected locale.
export function useCurrency() {
  const { lang } = useI18n();
  const currency = lang === "ht" ? "HTG" : "USD";
  const symbol = currency === "HTG" ? "HTG" : "$";
  const format = (value) => formatCurrency(value, currency);
  return { currency, symbol, format };
}