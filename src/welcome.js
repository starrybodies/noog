document.getElementById("version").textContent =
  "NOOG " + chrome.runtime.getManifest().version;

const mascot = document.getElementById("kitty-mascot"),
  hint = document.getElementById("kitty-hint"),
  gameLink = document.getElementById("kitty-game-link");
let pets = 0;
gameLink.href = chrome.runtime.getURL("kitty-game.html");
mascot.addEventListener("click", () => {
  pets = Math.min(3, pets + 1);
  mascot.dataset.pets = pets;
  hint.textContent = pets < 3 ? `${3 - pets} more pets. A tiny break awaits.` : "";
  gameLink.hidden = pets < 3;
});
