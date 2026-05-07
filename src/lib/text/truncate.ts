/** Truncate to at most `max` Unicode code points (each CJK character counts as one). */
export function truncateCodePoints(text: string, max: number): string {
  let out = "";
  let n = 0;
  for (const ch of text) {
    if (n >= max) {
      return out.endsWith("…") ? out : `${out}…`;
    }
    out += ch;
    n += 1;
  }
  return out;
}
