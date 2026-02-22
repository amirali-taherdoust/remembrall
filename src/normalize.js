export function normalizeToHost(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  const withScheme = hasScheme ? raw : `https://${raw}`;

  try {
    const u = new URL(withScheme);
    return (u.hostname || "").toLowerCase();
  } catch {
    return "";
  }
}

export function canonicalHost(hostname) {
  return String(hostname ?? "").toLowerCase().trim();
}
