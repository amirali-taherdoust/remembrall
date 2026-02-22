# Remembrall -> Security URL Gate (Browser Extension)
Submission for Hack London 2026

A lightweight security extension that checks a site against a trusted domain list and, when the site is not trusted, shows a Security Check screen with HTTP security header analysis before you continue.

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
