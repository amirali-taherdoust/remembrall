import { getLists, setLists } from "../storage.js";

const wCount = document.getElementById("wCount");
const bCount = document.getElementById("bCount");
const wList = document.getElementById("wList");
const bList = document.getElementById("bList");

const btnClearWhite = document.getElementById("btnClearWhite");
const btnClearBlack = document.getElementById("btnClearBlack");

function renderList(el, arr) {
  el.textContent = (arr && arr.length) ? arr.join("\n") : "(empty)";
}

async function refresh() {
  const { white, black } = await getLists();
  wCount.textContent = String(white.length);
  bCount.textContent = String(black.length);
  renderList(wList, white);
  renderList(bList, black);
}

btnClearWhite.addEventListener("click", async () => {
  const { black } = await getLists();
  await setLists({ white: [], black });
  await refresh();
});

btnClearBlack.addEventListener("click", async () => {
  const { white } = await getLists();
  await setLists({ white, black: [] });
  await refresh();
});

refresh();
