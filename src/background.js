import { normalizeToHost } from "./normalize.js";
import { classifyHost } from "./policy_engine.js";
import { addToBlack, addToWhite, getLists } from "./storage.js";

const isHttp = (u) => typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://"));
const extUrl = (p) => chrome.runtime.getURL(p);

const allowKey = (tabId) => `allow_once_${tabId}`;
async function allowOnce(tabId, url) { await chrome.storage.session.set({ [allowKey(tabId)]: url }); }
async function consumeAllowOnce(tabId, url) {
  const out = await chrome.storage.session.get(allowKey(tabId));
  if (out[allowKey(tabId)] === url) {
    await chrome.storage.session.remove(allowKey(tabId));
    return true;
  }
  return false;
}

const promptKey = (tabId) => `prompt_${tabId}`;
async function setPrompt(tabId, host) { await chrome.storage.session.set({ [promptKey(tabId)]: host }); }
async function consumePrompt(tabId) {
  const out = await chrome.storage.session.get(promptKey(tabId));
  const host = out[promptKey(tabId)] || "";
  if (host) await chrome.storage.session.remove(promptKey(tabId));
  return host;
}

async function go(tabId, url) {
  try { await chrome.tabs.update(tabId, { url }); } catch {}
}


function reviewUrl(targetUrl, tabId) {
  return extUrl("src/ui/interstitial.html")
    + "?u=" + encodeURIComponent(targetUrl)
    + "&tabId=" + encodeURIComponent(tabId);
}

chrome.webNavigation.onBeforeNavigate.addListener(async (d) => {
  if (d.frameId !== 0) return;
  if (d.url.startsWith("chrome-extension://")) return;
  if (!isHttp(d.url)) return;

  if (await consumeAllowOnce(d.tabId, d.url)) return;

  const host = normalizeToHost(d.url);
  if (!host) return;

  const res = await classifyHost(host);

  if (res.decision === "allow") return;

  if (res.decision === "block") {
    return;
  }

  await go(d.tabId, reviewUrl(d.url, d.tabId));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const tabId = msg?.tabId || sender?.tab?.id || 0;

    if (msg?.type === "close_tab") {
      if (sender?.tab?.id) { try { await chrome.tabs.remove(sender.tab.id); } catch {} }
      sendResponse({ ok: true }); return;
    }

    if (msg?.type === "decision_block") {
      if (msg.host) await addToBlack(msg.host);
      if (tabId) {
        try {
          await chrome.tabs.goBack(tabId);
        } catch {
          try { await chrome.tabs.remove(tabId); } catch {}
        }
      }
      sendResponse({ ok: true }); return;
    }

    if (msg?.type === "decision_continue") {
      if (tabId) {
        await allowOnce(tabId, msg.url);
        await setPrompt(tabId, msg.host || "");
        await go(tabId, msg.url);
      }
      sendResponse({ ok: true }); return;
    }

    if (msg?.type === "is_blacklisted") {
  const h = normalizeToHost(msg.url || msg.host || "");
  const { black } = await getLists();
  sendResponse({ blacklisted: !!h && black.includes(h) });
  return;
}

if (msg?.type === "should_prompt") {
      const id = sender?.tab?.id || 0;
      const host = id ? await consumePrompt(id) : "";
      sendResponse({ prompt: !!host, host }); return;
    }

    if (msg?.type === "final_trust_yes") {
      if (msg.host) await addToWhite(msg.host);
      sendResponse({ ok: true }); return;
    }

    if (msg?.type === "final_trust_no") {
      if (msg.host) await addToBlack(msg.host);
      sendResponse({ ok: true }); return;
    }

    sendResponse({ ok: false });
  })();
  return true;
});
