// Top-right toast asking for trust after Continue.
// If user clicks No, we blacklist and then show a Warning toast (no buttons, only X).

function trustToast(host) {
  const root = document.createElement("div");
  root.id = "__secgate_toast__";
  root.attachShadow({ mode: "open" });

  root.shadowRoot.innerHTML = `
    <style>
      :host { all: initial; }
      .toast {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        width: min(360px, calc(100vw - 32px));
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e6e8f0;
        box-shadow: 0 10px 30px rgba(0,0,0,.16);
        padding: 12px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        color: #111;
      }
      h3 { margin: 0 0 6px; font-size: 14px; }
      p { margin: 0 0 10px; color: #444; font-size: 12.5px; line-height: 1.35; word-break: break-word; }
      .row { display: flex; gap: 8px; justify-content: flex-end; }
      button { border: 1px solid #d7d9e6; background: #fff; border-radius: 10px; padding: 7px 10px; cursor: pointer; font-weight: 700; font-size: 12.5px; }
      button:hover { background: #fafbff; }
      .danger { border-color: #f1b4b4; background: #fff5f5; }
      .danger:hover { background: #ffecec; }
      .x { position: absolute; top: 6px; right: 8px; border: 0; background: transparent; font-size: 16px; line-height: 1; cursor: pointer; color: #666; }
      .x:hover { color: #111; }
    </style>

    <div class="toast" role="dialog" aria-label="Trust decision">
      <button class="x" id="close" title="Close">×</button>
      <h3>Attention</h3>
      <p>You have chosen to continue.<br/>Would you like to add this site to your trusted sites list?</p>
      <div class="row">
        <button class="danger" id="no">No do not.</button>
        <button id="yes">Yes, add to list.</button>
      </div>
    </div>
  `;
  return root;
}

function warningToast(host) {
  const root = document.createElement("div");
  root.id = "__secgate_warning__";
  root.attachShadow({ mode: "open" });

  root.shadowRoot.innerHTML = `
    <style>
      :host { all: initial; }
      .toast {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        width: min(360px, calc(100vw - 32px));
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e6e8f0;
        box-shadow: 0 10px 30px rgba(0,0,0,.16);
        padding: 12px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        color: #111;
      }
      .hdr { display:flex; align-items:center; justify-content:space-between; gap: 10px; }
      h3 { margin: 0; font-size: 14px; display:flex; align-items:center; gap: 8px; }
      .icon { font-size: 16px; }
      p { margin: 8px 0 0; color: #444; font-size: 12.5px; line-height: 1.35; word-break: break-word; }
      .x { border: 0; background: transparent; font-size: 16px; line-height: 1; cursor: pointer; color: #666; }
      .x:hover { color: #111; }
    </style>

    <div class="toast" role="dialog" aria-label="Warning">
      <div class="hdr">
        <h3><span class="icon">❗</span>Warning</h3>
        <button class="x" id="close" title="Close">×</button>
      </div>
      <p>You are on an untrusted site. You are at risk while you are here. It is advised to leave as soon as possible.</p>
    </div>
  `;
  return root;
}

async function send(msg) {
  return await chrome.runtime.sendMessage(msg);
}

(async () => {
  const r = await send({ type: "should_prompt" });
  if (!r || !r.prompt) return;

  const host = r.host || location.hostname;

  if (document.getElementById("__secgate_toast__") || document.getElementById("__secgate_warning__")) return;

  const toast = trustToast(host);
  document.documentElement.appendChild(toast);

  toast.shadowRoot.getElementById("close").addEventListener("click", () => toast.remove());

  toast.shadowRoot.getElementById("yes").addEventListener("click", async () => {
    await send({ type: "final_trust_yes", host });
    toast.remove();
  });

  toast.shadowRoot.getElementById("no").addEventListener("click", async () => {
    await send({ type: "final_trust_no", host, url: location.href });
    toast.remove();

    const w = warningToast(host);
    document.documentElement.appendChild(w);
    w.shadowRoot.getElementById("close").addEventListener("click", () => w.remove());
  });
})();
