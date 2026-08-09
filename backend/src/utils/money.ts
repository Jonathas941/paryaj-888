/**
 * Money helpers.
 *
 * Postgres returns NUMERIC as a string precisely so precision is not lost to
 * a float. We keep it that way: values are parsed only for comparison and
 * display, and every actual balance mutation is performed in SQL. Rounding
 * here is half-up to 2dp, matching NUMERIC(18,2).
 */

export function toCents(value: string | number): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) throw new Error(`Not a number: ${value}`);
  return Math.round(n * 100);
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Round to 2dp and return a string safe to hand to NUMERIC(18,2). */
export function money(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Not a number: ${value}`);
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}

/** Multiply decimal odds without accumulating float drift. */
export function combineOdds(oddsList: Array<string | number>): number {
  const product = oddsList.reduce<number>((acc, o) => {
    const n = typeof o === "string" ? parseFloat(o) : o;
    return acc * n;
  }, 1);
  return Math.round(product * 1000) / 1000;
}
