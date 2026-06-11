import { API_BASE_URL } from "./apiClient";

/**
 * Resolve a stored image path to a loadable URL.
 *
 * The backend stores profile/laboratory images as relative paths like
 * `static/faculty-workers/abc.jpg` (unless PUBLIC_BASE_URL is configured, in
 * which case it's already an absolute URL). The admin runs on a different
 * origin than the API, so rendering the raw relative path 404s and the browser
 * shows only the alt text. Prefix the API host the same way the public site does.
 */
export function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;
  const base = (API_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
