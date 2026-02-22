import { domains as TRUSTED_DOMAINS } from "./trusted_list.js";
import { canonicalHost } from "./normalize.js";
import { getLists } from "./storage.js";

const TRUSTED_SET = new Set(TRUSTED_DOMAINS.map(d => canonicalHost(d)));

export async function classifyHost(host) {
  const h = canonicalHost(host);
  if (!h) return { decision: "invalid" };

  const { white, black } = await getLists();
  const whiteSet = new Set(white.map(canonicalHost));
  const blackSet = new Set(black.map(canonicalHost));

  if (TRUSTED_SET.has(h) || whiteSet.has(h)) return { decision: "allow", source: TRUSTED_SET.has(h) ? "trusted" : "white" };
  if (blackSet.has(h)) return { decision: "block", source: "black" };
  return { decision: "review", source: "unknown" };
}
