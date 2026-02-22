import { normalizeToHost } from "../normalize.js";
import { evaluateSecurityHeaders } from "../header_checks.js";

const qs = new URLSearchParams(location.search);
const url = qs.get("u") ? decodeURIComponent(qs.get("u")) : "";
const mode = qs.get("mode") || "review";
const tabId = Number(qs.get("tabId") || "0") || 0;

const titleText = document.getElementById("titleText");
const titleIcon = document.getElementById("titleIcon");
const targetEl = document.getElementById("target");
const checksEl = document.getElementById("checks");
const badgeEl = document.getElementById("statusBadge");
const httpEl = document.getElementById("httpStatus");
const trustScoreEl = document.getElementById("trustScore");

const introText = document.getElementById("introText");
const introSub = document.getElementById("introSub");
const actionsRow = document.getElementById("actionsRow");
const scoreRow = document.getElementById("scoreRow");
const footText = document.getElementById("footText");

const btnNo = document.getElementById("btnNo");
const btnYes = document.getElementById("btnYes");

const isHttpUrl = (u) => typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://"));

const host = normalizeToHost(url);
targetEl.textContent = url ? `Target: ${url}` : "No target URL";

function setTrustScore(passed, total) {
  if (!total) { trustScoreEl.textContent = "-"; return; }
  const pct = Math.round((passed / total) * 100);
  trustScoreEl.textContent = `${pct}% (${passed}/${total} checks passed)`;
}

function render(items) {
  checksEl.innerHTML = "";
  for (const it of items) {
    const li = document.createElement("li");

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = it.passed ? "✅" : "⚠️";

    const box = document.createElement("div");

    const k = document.createElement("div");
    k.className = "k";
    k.textContent = it.key;

    const v = document.createElement("div");
    v.className = "v";
    v.textContent = it.value;

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = it.hint;

    box.appendChild(k);
    box.appendChild(v);
    box.appendChild(hint);

    li.appendChild(icon);
    li.appendChild(box);
    checksEl.appendChild(li);
  }
}

function setWarningMode() {
  document.title = "Warning";
  titleText.textContent = "Warning";
  titleIcon.style.display = "block";
  introText.innerHTML = "You marked this site as <b>untrusted</b>. It is recommended to exit as soon as possible.";
  introSub.textContent = "No actions are available here. You can close this tab using the × button.";
  actionsRow.style.display = "none";
  scoreRow.style.display = "none";
  badgeEl.textContent = "Blacklisted";
  httpEl.textContent = "";
  render([{ key: "Status", passed: false, value: "This host is in your blacklist", hint: "If you trust it again, remove it from the blacklist using the extension popup list controls." }]);
  footText.textContent = "";
}

async function runReview() {
  if (!url || !host) {
    badgeEl.textContent = "Invalid URL";
    btnYes.disabled = true;
    setTrustScore(0, 0);
    return;
  }

  if (!isHttpUrl(url)) {
    badgeEl.textContent = "Unsupported URL scheme";
    httpEl.textContent = "Only http/https can be checked.";
    btnYes.disabled = true;
    setTrustScore(0, 1);
    render([{ key: "Scheme", passed: false, value: url, hint: "Chrome internal pages cannot be fetched/checked by this extension." }]);
    return;
  }

  try {
    badgeEl.textContent = "Fetching headers...";
    const resp = await fetch(url, { method: "GET", cache: "no-store", redirect: "follow", credentials: "omit" });
    httpEl.textContent = `HTTP: ${resp.status}`;

    const results = evaluateSecurityHeaders(resp);
    const passedCount = results.filter(r => r.passed).length;

    badgeEl.textContent = `Checks passed: ${passedCount}/${results.length}`;
    setTrustScore(passedCount, results.length);
    render(results);
  } catch (e) {
    badgeEl.textContent = "Fetch failed";
    httpEl.textContent = String(e?.message || e);
    setTrustScore(0, 1);
    render([{ key: "Network", passed: false, value: "Could not fetch headers", hint: "Some sites block automated fetch." }]);
  }
}


btnNo.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "decision_block", tabId, url, host });
});

btnYes.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "decision_continue", tabId, url, host });
});

if (mode === "black") setWarningMode();
else runReview();
