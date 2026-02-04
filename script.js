let timerInterval = null;
let remainingSeconds = 0;
let wakeLock = null;
let isRunning = false;

// Elements
const display = document.getElementById("timeDisplay");
const modal = document.getElementById("setTimerModal");
const startStopBtn = document.getElementById("startStopBtn");
const resetBtn = document.getElementById("resetBtn");
const setTimerBtn = document.getElementById("setTimerBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const keepScreenCheckbox = document.getElementById("keepScreenOn");

// ---------- FULLSCREEN ----------
function goFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

fullscreenBtn.addEventListener("click", goFullscreen);

// ---------- WAKE LOCK ----------
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    alert(
      "Your browser does not support keeping the screen awake.\n\n" +
      "Please increase screen timeout in phone settings."
    );
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// ---------- DISPLAY ----------
function updateDisplay(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  display.textContent = `${h}:${m}:${s}`;
}

// ---------- OPEN SET TIMER SCREEN ----------
display.addEventListener("click", () => {
  if (!isRunning) modal.classList.remove("hidden");
});

// ---------- START TIMER CORE ----------
function startTimer() {
  if (remainingSeconds <= 0 || isRunning) return;

  if (keepScreenCheckbox.checked) {
    requestWakeLock();
  }

  goFullscreen();
  isRunning = true;
  startStopBtn.textContent = "Stop";

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateDisplay(remainingSeconds);

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      releaseWakeLock();
      isRunning = false;
      startStopBtn.textContent = "Start";
      alert("Time’s up!");
    }
  }, 1000);
}

// ---------- SET & AUTO START ----------
setTimerBtn.addEventListener("click", () => {
  const timeValue = document.getElementById("timeInput").value;
  if (!timeValue) return;

  const [h, m, s] = timeValue.split(":").map(Number);
  remainingSeconds = h * 3600 + m * 60 + s;

  if (remainingSeconds <= 0) return;

  updateDisplay(remainingSeconds);
  modal.classList.add("hidden");

  startTimer(); // 🔥 AUTO START
});

// ---------- START / STOP ----------
startStopBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timerInterval);
    releaseWakeLock();
    isRunning = false;
    startStopBtn.textContent = "Start";
  } else {
    startTimer();
  }
});

// ---------- RESET ----------
resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  releaseWakeLock();
  remainingSeconds = 0;
  updateDisplay(0);
  isRunning = false;
  startStopBtn.textContent = "Start";
});

// ---------- VISIBILITY ----------
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && wakeLock) {
    requestWakeLock();
  }
});
