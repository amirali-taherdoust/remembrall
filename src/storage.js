const KEY_WHITE = "user_white";
const KEY_BLACK = "user_black";

const norm = (x) => String(x).toLowerCase().trim();
const uniq = (arr) => Array.from(new Set((arr || []).map(norm).filter(Boolean)));

export async function getLists() {
  const out = await chrome.storage.local.get([KEY_WHITE, KEY_BLACK]);
  return { white: uniq(out[KEY_WHITE] || []), black: uniq(out[KEY_BLACK] || []) };
}

export async function setLists({ white, black }) {
  await chrome.storage.local.set({ [KEY_WHITE]: uniq(white), [KEY_BLACK]: uniq(black) });
}

export async function addToWhite(host) {
  const { white, black } = await getLists();
  const h = norm(host);
  const nextWhite = uniq([...white, h]);
  const nextBlack = uniq(black.filter(x => x !== h));
  await chrome.storage.local.set({ [KEY_WHITE]: nextWhite, [KEY_BLACK]: nextBlack });
  return { white: nextWhite, black: nextBlack };
}

export async function addToBlack(host) {
  const { white, black } = await getLists();
  const h = norm(host);
  const nextBlack = uniq([...black, h]);
  const nextWhite = uniq(white.filter(x => x !== h));
  await chrome.storage.local.set({ [KEY_WHITE]: nextWhite, [KEY_BLACK]: nextBlack });
  return { white: nextWhite, black: nextBlack };
}

export async function removeFromBlack(host) {
  const { white, black } = await getLists();
  const h = norm(host);
  const nextBlack = uniq(black.filter(x => x !== h));
  await chrome.storage.local.set({ [KEY_BLACK]: nextBlack });
  return { white, black: nextBlack };
}
