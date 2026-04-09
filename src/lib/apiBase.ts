/** URL absoluta de ruta API respetando `base` de Vite (subcarpeta en deploy). */
export function resolveApiUrl(path: string): string {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}
