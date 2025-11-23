// ===== CONFIG =====
const API_URL = "/api/chat";

// ===== DOM ELEMENTS =====
const chatDiv = document.getElementById("chat");
const startBtn = document.getElementById("start-voice");
const stopBtn = document.getElementById("stop-voice");
const resetBtn = document.getElementById("reset-chat");
const textInput = document.getElementById("text-input");
const sendBtn = document.getElementById("send-text");

const taskListEl = document.getElementById("task-list");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const clearTasksBtn = document.getElementById("clear-tasks");

const timerDisplay = document.getElementById("timer-display");
const startTimerBtn = document.getElementById("start-timer");
const stopTimerBtn = document.getElementById("stop-timer");

const planOutput = document.getElementById("plan-output");
const askPlanBtn = document.getElementById("ask-plan");

const speakingIndicator = document.getElementById("speaking-indicator");
const voiceSelect = document.getElementById("voice-select");

// ===== STATE =====
let recognition = null;
let isRecognizing = false;
let conversation = [];

let honeyVoice = null;
let allVoices = [];

// Tasks
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// Timer
let timerInterval = null;
let remainingSeconds = 25 * 60;

// ===== UI HELPERS =====
function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  div.textContent = text;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// ===== STT (Speech-to-Text) =====
function initSTT() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(
      "SpeechRecognition not supported in this browser. Use Chrome for best results.",
    );
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    handleUserText(text);
  };

  recognition.onend = () => {
    isRecognizing = false;
  };

  recognition.onerror = (e) => {
    console.error("STT error:", e);
    isRecognizing = false;
  };
}

function startRecognition() {
  if (!recognition) initSTT();
  if (recognition && !isRecognizing) {
    isRecognizing = true;
    recognition.start();
  }
}

function stopRecognition() {
  if (recognition && isRecognizing) {
    recognition.stop();
    isRecognizing = false;
  }
}

// ===== TTS (Text-to-Speech) & Voice Selection =====
function chooseDefaultVoice() {
  if (!allVoices.length) return null;

  let v =
    allVoices.find(
      (v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female"),
    ) ||
    allVoices.find((v) => v.lang === "en-IN") ||
    allVoices.find((v) => v.name.toLowerCase().includes("india")) ||
    allVoices.find((v) =>
      /zira|heera|meera|neerja|sara|sonia/.test(v.name.toLowerCase()),
    ) ||
    allVoices[0];

  return v || null;
}

function populateVoiceList() {
  if (!("speechSynthesis" in window)) {
    voiceSelect.innerHTML = "<option>No speechSynthesis support</option>";
    return;
  }

  allVoices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  if (!allVoices.length) {
    const opt = document.createElement("option");
    opt.textContent = "No voices available yet";
    voiceSelect.appendChild(opt);
    return;
  }

  allVoices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });

  const preferred = chooseDefaultVoice();
  if (preferred) {
    honeyVoice = preferred;
    const idx = allVoices.indexOf(preferred);
    if (idx >= 0) {
      voiceSelect.value = String(idx);
    }
  }
}

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
  setTimeout(populateVoiceList, 200);
}

voiceSelect.addEventListener("change", () => {
  const idx = parseInt(voiceSelect.value, 10);
  if (!isNaN(idx) && allVoices[idx]) {
    honeyVoice = allVoices[idx];
  }
});

function speakText(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  if (honeyVoice) utterance.voice = honeyVoice;
  utterance.rate = 1.0;
  utterance.pitch = 1.25;

  speakingIndicator.textContent = `Honey is speaking…`;
  speakingIndicator.style.display = "block";

  utterance.onend = () => {
    speakingIndicator.style.display = "none";
  };
  speechSynthesis.speak(utterance);
}

// ===== TASKS =====
function renderTasks() {
  taskListEl.innerHTML = "";
  tasks.forEach((t, idx) => {
    const li = document.createElement("li");
    li.textContent = t.text;
    if (t.done) li.classList.add("done");
    li.onclick = () => toggleTask(idx);
    taskListEl.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask(text) {
  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  renderTasks();
}

function clearAllTasks() {
  tasks = [];
  saveTasks();
  renderTasks();
}

function tryHandleTaskCommand(text) {
  const lower = text.toLowerCase();

  if (lower.startsWith("add task") || lower.startsWith("add a task")) {
    let taskText = text.replace(/add( a)? task/i, "").trim();
    if (!taskText) taskText = "Unnamed task";
    addTask(taskText);
    const reply = `Done, I added: "${taskText}". Anything else, yaar?`;
    appendMessage("honey", reply);
    speakText(reply);
    return true;
  }

  if (
    lower.includes("show my tasks") ||
    lower.includes("list tasks") ||
    lower.includes("my tasks")
  ) {
    if (!tasks.length) {
      const reply = "You don't have any tasks yet. Want to add one?";
      appendMessage("honey", reply);
      speakText(reply);
      return true;
    }
    const list = tasks
      .map((t, i) => `${i + 1}. ${t.text}${t.done ? " (done)" : ""}`)
      .join("\n");
    const reply = "Here are your tasks:\n" + list;
    appendMessage("honey", reply);
    speakText(reply);
    return true;
  }

  if (
    lower.includes("clear tasks") ||
    lower.includes("delete all tasks") ||
    lower.includes("clear my tasks")
  ) {
    if (!tasks.length) {
      const reply = "You don't have any tasks to clear, overachiever.";
      appendMessage("honey", reply);
      speakText(reply);
      return true;
    }
    clearAllTasks();
    const reply =
      "All tasks cleared. Now don't use that as an excuse to be lazy, okay?";
    appendMessage("honey", reply);
    speakText(reply);
    return true;
  }

  return false;
}

// ===== TIMER =====
function updateTimerDisplay() {
  const m = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const s = String(remainingSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

function startFocusTimer(minutes = 25) {
  remainingSeconds = minutes * 60;
  updateTimerDisplay();
  if (timerInterval) clearInterval(timerInterval);

  const startMsg = `Alright, focus mode for ${minutes} minutes. No excuses now.`;
  appendMessage("honey", startMsg);
  speakText(startMsg);

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      const doneMsg = "Time's up! Take a short break, you earned it.";
      appendMessage("honey", doneMsg);
      speakText(doneMsg);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const msg =
    "Okay, timer stopped. Don't run away from your work too much, haan.";
  appendMessage("honey", msg);
  speakText(msg);
}

function tryHandleTimerCommand(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("start timer") ||
    lower.includes("focus mode") ||
    lower.includes("start focus")
  ) {
    startFocusTimer(25);
    return true;
  }
  if (lower.includes("stop timer")) {
    stopTimer();
    return true;
  }
  return false;
}

// ===== LLM / BACKEND =====
async function sendToHoney(text) {
  conversation.push({ role: "user", content: text });

  const trimmed = conversation.slice(-10);

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: trimmed }),
    });

    const data = await resp.json();

    if (data.error) {
      const reply = `My brain server failed: ${data.error}.`;
      appendMessage("honey", reply);
      speakText(reply);
      console.error("Honey backend error:", data);
      return;
    }

    const reply = data.reply || "Hmm, I'm not sure what happened there.";

    conversation.push({ role: "assistant", content: reply });

    appendMessage("honey", reply);
    speakText(reply);

    if (/day\s*1/i.test(reply)) {
      planOutput.value = reply;
      localStorage.setItem("lastPlan", reply);
    }
  } catch (err) {
    console.error("Error talking to Honey:", err);
    const msg = "Arre, something broke on the server. Try again in a bit.";
    appendMessage("honey", msg);
    speakText(msg);
  }
}

// ===== MAIN HANDLER =====
function handleUserText(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  appendMessage("user", trimmed);

  if (tryHandleTaskCommand(trimmed)) return;
  if (tryHandleTimerCommand(trimmed)) return;

  sendToHoney(trimmed);
}

// ===== EVENT LISTENERS =====
startBtn.onclick = () => startRecognition();
stopBtn.onclick = () => stopRecognition();

resetBtn.onclick = () => {
  conversation = [];
  chatDiv.innerHTML = "";
  const msg = "Chat cleared. Fresh start, yaar.";
  appendMessage("honey", msg);
  speakText(msg);
};

sendBtn.onclick = () => {
  const text = textInput.value;
  textInput.value = "";
  handleUserText(text);
};

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = textInput.value;
    textInput.value = "";
    handleUserText(text);
  }
});

addTaskBtn.onclick = () => {
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = "";
};

clearTasksBtn.onclick = () => {
  clearAllTasks();
  const reply = "Cleared all your tasks. Fresh slate, yaar.";
  appendMessage("honey", reply);
  speakText(reply);
};

startTimerBtn.onclick = () => startFocusTimer(25);
stopTimerBtn.onclick = () => stopTimer();

askPlanBtn.onclick = () => {
  const text =
    "Honey, I have exams and need a study plan. Ask me for details and then create a clear day-by-day plan.";
  handleUserText(text);
};

// ===== INIT ON LOAD =====
window.addEventListener("load", () => {
  initSTT();
  if ("speechSynthesis" in window) {
    setTimeout(populateVoiceList, 200);
  }
  renderTasks();
  updateTimerDisplay();

  const lastPlan = localStorage.getItem("lastPlan");
  if (lastPlan) {
    planOutput.value = lastPlan;
  }

  const welcome =
    "Hey, I'm Honey. Your slightly savage but supportive study buddy. What’s up?";
  appendMessage("honey", welcome);
  speakText(welcome);
});
