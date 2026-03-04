# Remembrall -> Security URL Gate (Browser Extension)
Submission for Hack London 2026

Remembrall is a human-centred security training tool built as a lightweight browser extension. It helps users make safer browsing decisions by checking whether a site is recognised as trusted, and when it is not, showing a Security Check report of recommended HTTP security headers with an overall trust score before the user continues.

What it does

Trusted / Whitelisted domains: opens normally with no warnings.
Unknown domains: shows a Security Check page with:
  - header checks
  - a trust score (percentage of checks passed)
Blacklisted domains: shows a Warning toast (top-right) while the page is still usable.
User decisions build your lists: blacklist/whitelist start empty and grow based on your choices.

Install (Chrome)
Download the ZIP and extract it.
Open chrome://extensions in a new tab.
Enable Developer mode (top-right).
Click Load unpacked and select the extracted folder that contains manifest.json.

Install (Microsoft Edge)
Download the ZIP and extract it.
Open edge://extensions.
Enable Developer mode.
Click Load unpacked and select the extracted folder that contains manifest.json.
