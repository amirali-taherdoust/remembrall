function getHeader(headers, name) {
  try { return headers.get(name) || headers.get(name.toLowerCase()) || ""; } catch { return ""; }
}
function ok(val) { return !!String(val || "").trim(); }

export function evaluateSecurityHeaders(resp) {
  const h = resp.headers;

  const hsts = getHeader(h, "strict-transport-security");
  const csp  = getHeader(h, "content-security-policy");
  const xcto = getHeader(h, "x-content-type-options");
  const xfo  = getHeader(h, "x-frame-options");
  const rp   = getHeader(h, "referrer-policy");
  const pp   = getHeader(h, "permissions-policy");
  const xxp  = getHeader(h, "x-xss-protection");

  return [
    { key: "HTTP Strict-Transport-Security (HSTS)", passed: ok(hsts) && /max-age=\d+/i.test(hsts), value: hsts || "(missing)", hint: "This lets a website tell a browser that it should only be accessed using HTTPS. If this is not set then this is not being enforced." },
    { key: "Content-Security-Policy (CSP)",   passed: ok(csp), value: csp || "(missing)", hint: "This specifies the origin of content that is allowed to be loaded onto the website. If this is not set then the website is vulnerable to attacks." },
    { key: "X-Content-Type-Options",    passed: String(xcto).toLowerCase().trim() === "nosniff", value: xcto || "(missing)", hint: "This is used by the server to indicate to a browser that the specified MIME types are to be followed. This should be set to 'nosniff'." },
    { key: "X-Frame-Options",           passed: ok(xfo) && /^(deny|sameorigin)$/i.test(xfo.trim()), value: xfo || "(missing)", hint: "This is used to indicate whether or not a browser should be allowed to render an embeded page. This should be set to 'DENY'." },
    { key: "Referrer-Policy",           passed: ok(rp), value: rp || "(missing)", hint: "This controls how much referrer information should be included with requests. This should be set to 'strict-origin-when-cross-origin'." },
    { key: "Permissions-Policy",        passed: ok(pp), value: pp || "(missing)", hint: "This controls which origins can use which browser features. If this is not set then the website is vulnerable to injection attacks." },
    { key: "X-XSS-Protection", passed: ok(xxp), value: xxp || "(missing)", hint: "This is a feature of some browsers that stops pages from loading when a reflected cross site scripting (XSS) attack is detected. This should be set to '0'." },
  ];
}
