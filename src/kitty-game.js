const game = document.getElementById("game"),
  closed = document.getElementById("closed"),
  board = document.getElementById("playfield"),
  kitty = document.getElementById("kitty"),
  resting = document.getElementById("resting"),
  scoreLabel = document.getElementById("score"),
  timeLabel = document.getElementById("time"),
  status = document.getElementById("game-status"),
  start = document.getElementById("start"),
  pause = document.getElementById("pause"),
  reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const duration = 15000, goal = 8;
let state = "ready", score = 0, remaining = duration, deadline = 0,
  timer, position = 4;

function setState(next) {
  state = next;
  game.dataset.state = next;
}

function placeKitty(animate = false) {
  const column = position % 3, row = Math.floor(position / 3);
  const x = 10 + (board.clientWidth - kitty.offsetWidth - 20) * column / 2;
  const y = 10 + (board.clientHeight - kitty.offsetHeight - 20) * row / 2;
  kitty.classList.toggle("scurry", animate && !reducedMotion.matches);
  kitty.style.transform = `translate(${x}px, ${y}px)`;
}

function finish() {
  clearInterval(timer);
  setState("finished");
  kitty.hidden = true;
  resting.hidden = false;
  pause.hidden = true;
  start.hidden = false;
  start.textContent = "Play again";
  status.textContent = `${score} of ${goal} kitties caught. ${score === goal ? "The cardboard-box revolution can wait. Well played." : "The rest have formed a nap committee."}`;
  start.focus({ preventScroll: true });
}

function tick() {
  remaining = Math.max(0, deadline - performance.now());
  timeLabel.textContent = Math.ceil(remaining / 1000);
  if (!remaining) finish();
}

function run() {
  setState("playing");
  deadline = performance.now() + remaining;
  kitty.disabled = false;
  pause.textContent = "Pause game";
  status.textContent = "Kitty on duty. Catch away.";
  timer = setInterval(tick, 100);
  kitty.focus({ preventScroll: true });
}

function pauseGame() {
  if (state !== "playing") return;
  tick();
  if (state === "finished") return;
  clearInterval(timer);
  setState("paused");
  kitty.disabled = true;
  kitty.classList.remove("scurry");
  pause.textContent = "Resume game";
  status.textContent = "Paused. Your kitties and time are waiting.";
  if (!document.hidden) pause.focus({ preventScroll: true });
}

function startGame() {
  clearInterval(timer);
  score = 0;
  remaining = duration;
  position = 4;
  scoreLabel.textContent = "0";
  timeLabel.textContent = "15";
  start.hidden = true;
  pause.hidden = false;
  resting.hidden = true;
  kitty.hidden = false;
  placeKitty();
  run();
  if (document.hidden) pauseGame();
}

function closeGame() {
  clearInterval(timer);
  setState("closed");
  game.hidden = true;
  closed.hidden = false;
  document.getElementById("closed-title").focus();
  if (window.opener) window.close();
}

start.addEventListener("click", startGame);
pause.addEventListener("click", () => {
  if (state === "playing") pauseGame();
  else if (state === "paused" && !document.hidden) run();
});
kitty.addEventListener("click", (event) => {
  if (state !== "playing" || document.hidden) return;
  tick();
  if (state !== "playing") return;
  scoreLabel.textContent = ++score;
  status.textContent = `${score} of ${goal} kitties caught.`;
  if (score === goal) return finish();
  if (!reducedMotion.matches) {
    // A different box each catch; keyboard focus stays on the same button.
    position = (position + 1 + Math.floor(Math.random() * 8)) % 9;
    placeKitty(event.detail > 0);
  }
});
document.getElementById("close").addEventListener("click", closeGame);
document.getElementById("reopen").addEventListener("click", () => {
  closed.hidden = true;
  game.hidden = false;
  kitty.hidden = true;
  resting.hidden = false;
  pause.hidden = true;
  start.hidden = false;
  start.textContent = "Start game";
  scoreLabel.textContent = "0";
  timeLabel.textContent = "15";
  status.textContent = "Your feed can wait for 15 seconds.";
  setState("ready");
  start.focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state !== "closed") closeGame();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseGame();
});
window.addEventListener("resize", () => {
  if (!kitty.hidden) placeKitty();
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) position = 4;
  if (!kitty.hidden) placeKitty();
});
