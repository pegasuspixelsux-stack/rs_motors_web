const nf = new Intl.NumberFormat("es-UY");

export const fmtInt = (n: number) => nf.format(Math.round(n));
export const fmtUSD = (n: number) => `US$ ${fmtInt(n)}`;
export const fmtKm = (n: number) => `${fmtInt(n)} km`;

/** "2024-08-19" -> "19 ago" */
export function fmtIngreso(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const mes = d
    .toLocaleDateString("es-UY", { month: "short" })
    .replace(".", "");
  return `${d.getDate()} ${mes}`;
}
