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

// Show set timer on clicking time
display.addEventListener("click", () => {
  if (!isRunning) modal.classList.remove("hidden");
});

// Fullscreen
fullscreenBtn.onclick = () => {
nction goFullscreen() {
  document.documentElement.requestFullscreen?.();
}

// Wake Lock
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) {
    alert(
      "Your browser does not support keeping the screen awake.\n\n" +
      "Please increase screen timeout in phone settings."
    );
  }
}

function releaseWakeLock() {
  wakeLock?.release();
  wakeLock = null;
}

// Timer helpers
function updateDisplay(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  display.textContent = `${h}:${m}:${s}`;
}

// Set timer
setTimerBtn.onclick = () => {
  const timeValue = document.getElementById("timeInput").value;
  const [h, m, s] = timeValue.split(":").map(Number);
  remainingSeconds = h * 3600 + m * 60 + s;
  updateDisplay(remainingSeconds);
  modal.classList.add("hidden");
};

// Start / Stop
startStopBtn.onclick = () => {
  if (isRunning) {
    clearInterval(timerInterval);
    releaseWakeLock();
    startStopBtn.textContent = "Start";
    isRunning = false;
    return;
  }

  if (remainingSeconds <= 0) return;

  if (document.getElementById("keepScreenOn").checked) {
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
      alert("Time’s up!");
    }
  }, 1000);
};

// Reset
resetBtn.onclick = () => {
  clearInterval(timerInterval);
  releaseWakeLock();
  remainingSeconds = 0;
  updateDisplay(0);
  isRunning = false;
  startStopBtn.textContent = "Start";
};

// Re-acquire wake lock on tab focus
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && wakeLock) {
    requestWakeLock();
  }
});
