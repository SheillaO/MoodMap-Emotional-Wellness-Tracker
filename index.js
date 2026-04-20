import { catsData } from "./data.js";

const emotionRadios = document.getElementById("emotion-radios");
const getImageBtn = document.getElementById("get-image-btn");
const gifsOnlyOption = document.getElementById("gifs-only-option");
const memeModalInner = document.getElementById("meme-modal-inner");
const memeModal = document.getElementById("meme-modal");
const memeModalCloseBtn = document.getElementById("meme-modal-close-btn");
const moodHistoryContainer = document.getElementById("mood-history");
const statsContainer = document.getElementById("stats-container");

// ========== EXISTING FUNCTIONS (Your Original Code) ==========
emotionRadios.addEventListener("change", highlightCheckedOption);
memeModalCloseBtn.addEventListener("click", closeModal);
getImageBtn.addEventListener("click", renderCat);

function highlightCheckedOption(e) {
  const radios = document.getElementsByClassName("radio");
  for (let radio of radios) {
    radio.classList.remove("highlight");
  }
  document.getElementById(e.target.id).parentElement.classList.add("highlight");
}

function closeModal() {
  memeModal.style.display = "none";
}

function renderCat() {
  const catObject = getSingleCatObject();
  if (!catObject) return;

  saveMoodEntry(catObject);

  // --- ADD THE PATH LOGIC HERE ---
  const imagePath =
    catObject.source === "snl"
      ? `images/snl/${catObject.image}`
      : `images/${catObject.image}`;

  memeModalInner.innerHTML = `
        <img class="cat-img" src="${imagePath}" alt="${catObject.alt}">
        <p class="affirmation">${catObject.affirmation}</p>
        <button class="save-note-btn" id="add-note-btn">Add Note</button>
    `;

  memeModal.style.display = "flex";
  document.getElementById("add-note-btn").addEventListener("click", addNote);
  updateMoodStats();
}

function getSingleCatObject() {
  const catsArray = getMatchingCatsArray();

  if (catsArray.length === 1) {
    return catsArray[0];
  } else {
    const randomNumber = Math.floor(Math.random() * catsArray.length);
    return catsArray[randomNumber];
  }
}

function getMatchingCatsArray() {
  // 1. Check if an emotion is selected first to avoid errors
  const selectedEmotionEl = document.querySelector(
    'input[name="emotions"]:checked',
  );

  if (selectedEmotionEl) {
    const selectedEmotion = selectedEmotionEl.value;
    const isGif = gifsOnlyOption.checked;

    const selectedSourceEl = document.querySelector(
      'input[name="source"]:checked',
    );
    const selectedSource = selectedSourceEl ? selectedSourceEl.value : "both";

    // 3. Filter catsData using all three criteria
    const matchingCatsArray = catsData.filter(function (cat) {
      const emotionMatch = cat.emotionTags.includes(selectedEmotion);

      // If isGif is true, cat.isGif must be true. If isGif is false, return true.
      const gifMatch = isGif ? cat.isGif : true;

      let sourceMatch = true;
      if (selectedSource !== "both") {
        sourceMatch = cat.source === selectedSource;
      }

      return emotionMatch && gifMatch && sourceMatch;
    });

    return matchingCatsArray;
  }
}

function getEmotionsArray(cats) {
  const emotionsArray = [];
  for (let cat of cats) {
    for (let emotion of cat.emotionTags) {
      if (!emotionsArray.includes(emotion)) {
        emotionsArray.push(emotion);
      }
    }
  }
  return emotionsArray;
}

function renderEmotionsRadios(cats) {
  let radioItems = ``;
  const emotions = getEmotionsArray(cats);
  for (let emotion of emotions) {
    radioItems += `
        <div class="radio">
            <label for="${emotion}">${emotion}</label>
            <input
            type="radio"
            id="${emotion}"
            value="${emotion}"
            name="emotions"
            >
        </div>`;
  }
  emotionRadios.innerHTML = radioItems;
}

// ========== NEW FUNCTION 1: Save Mood Entry ==========
function saveMoodEntry(catObject) {
  const selectedEmotion = document.querySelector(
    'input[type="radio"]:checked',
  ).value;

  const entry = {
    emotion: selectedEmotion,
    severity: catObject.severity,
    image: catObject.image,
    source: catObject.source,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
    note: "", // User can add notes later
  };

  let moodHistory = getMoodHistory();
  moodHistory.push(entry);
  localStorage.setItem("moodHistory", JSON.stringify(moodHistory));

  renderMoodHistory();
}

// ========== NEW FUNCTION 2: Get Mood History ==========
function renderMoodHistory() {
  const history = getMoodHistory();
  if (history.length === 0) {
    moodHistoryContainer.innerHTML =
      '<p class="empty-state">No entries yet.</p>';
    return;
  }

  const recentEntries = history.slice(-7).reverse();

  moodHistoryContainer.innerHTML = recentEntries
    .map((entry, index) => {
      // --- ADD THE THUMBNAIL PATH LOGIC HERE ---
      const thumbPath =
        entry.source === "snl"
          ? `images/snl/${entry.image}`
          : `images/${entry.image}`;

      return `
                <div class="mood-card ${entry.severity}">
                    <img src="${thumbPath}" class="mood-thumb" alt="${entry.emotion}">
                    <div class="mood-info">
                        <strong>${entry.emotion}</strong>
                        <span class="mood-date">${entry.date} at ${entry.time}</span>
                        ${entry.note ? `<p class="mood-note">${entry.note}</p>` : ""}
                    </div>
                    <button class="delete-entry" onclick="deleteEntry(${history.length - 1 - index})">✕</button>
                </div>
            `;
    })
    .join("");
}

// ========== NEW FUNCTION 4: Delete Entry ==========
function deleteEntry(index) {
  let history = getMoodHistory();
  history.splice(index, 1);
  localStorage.setItem("moodHistory", JSON.stringify(history));
  renderMoodHistory();
  updateMoodStats();
}
// ========== NEW FUNCTION 5: Update Stats Dashboard ==========
function updateMoodStats() {
  const history = getMoodHistory();

  if (history.length === 0) {
    statsContainer.innerHTML =
      '<p class="empty-state">Start tracking to see your patterns.</p>';
    return;
  }

  const totalEntries = history.length;
  const emotionCounts = countEmotions(history);
  const mostCommonEmotion = getMostCommonEmotion(emotionCounts);
  const streak = getCurrentStreak(history);
  const concerningPattern = detectConcerningPattern(history);

  statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${totalEntries}</div>
            <div class="stat-label">Total Check-ins</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${mostCommonEmotion}</div>
            <div class="stat-label">Most Common</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${streak}</div>
            <div class="stat-label">Day Streak</div>
        </div>
        ${
          concerningPattern
            ? `
            <div class="stat-card warning">
                <div class="stat-icon">⚠️</div>
                <div class="stat-label">${concerningPattern}</div>
            </div>
        `
            : ""
        }
    `;
}

// ========== NEW FUNCTION 6: Count Emotions ==========
function countEmotions(history) {
  const counts = {};

  for (let entry of history) {
    if (counts[entry.emotion]) {
      counts[entry.emotion]++;
    } else {
      counts[entry.emotion] = 1;
    }
  }

  return counts;
}

// ========== NEW FUNCTION 7: Get Most Common Emotion ==========
function getMostCommonEmotion(emotionCounts) {
  let maxCount = 0;
  let mostCommon = "None";

  for (let emotion in emotionCounts) {
    if (emotionCounts[emotion] > maxCount) {
      maxCount = emotionCounts[emotion];
      mostCommon = emotion;
    }
  }

  return mostCommon;
}

// ========== NEW FUNCTION 8: Calculate Streak ==========
function getCurrentStreak(history) {
  if (history.length === 0) return 0;

  const today = new Date().toLocaleDateString();
  const lastEntry = history[history.length - 1].date;

  if (lastEntry !== today) return 0;

  let streak = 1;
  const uniqueDates = [...new Set(history.map((entry) => entry.date))];

  return uniqueDates.length;
}

// ========== NEW FUNCTION 9: Detect Concerning Patterns ==========
function detectConcerningPattern(history) {
  const last7 = history.slice(-7);

  // Check for 5+ sad/scared entries in last 7
  const negativeMoods = last7.filter(
    (entry) =>
      entry.emotion === "sad" ||
      entry.emotion === "scared" ||
      entry.emotion === "moody",
  );

  if (negativeMoods.length >= 5) {
    return "Consider talking to someone";
  }

  // Check for 3+ insomniac in last 5
  const last5 = history.slice(-5);
  const insomniaCount = last5.filter(
    (entry) => entry.emotion === "insomniac",
  ).length;

  if (insomniaCount >= 3) {
    return "Sleep pattern concerns detected";
  }

  return null;
}
// ========== NEW FUNCTION 10: Export Data as CSV ==========
function exportAsCSV() {
  const history = getMoodHistory();

  if (history.length === 0) {
    alert("No data to export!");
    return;
  }

  const headers = ["Date", "Time", "Emotion", "Severity", "Note"];
  const rows = history.map((entry) => [
    entry.date,
    entry.time,
    entry.emotion,
    entry.severity,
    entry.note || "No note",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `moodmap-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ========== NEW FUNCTION 11: Export as JSON ==========
function exportAsJSON() {
  const history = getMoodHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `moodmap-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
}

// ========== NEW FUNCTION 12: Clear All Data ==========
function clearAllData() {
  if (confirm("⚠️ This will delete all your mood history. Continue?")) {
    localStorage.removeItem("moodHistory");
    renderMoodHistory();
    updateMoodStats();
  }
}

// ========== NEW FUNCTION 13: Filter by Emotion ==========
function filterByEmotion(emotion) {
  const history = getMoodHistory();
  const filtered = history.filter((entry) => entry.emotion === emotion);

  // Render filtered results
  if (filtered.length === 0) {
    moodHistoryContainer.innerHTML = `<p class="empty-state">No "${emotion}" entries found.</p>`;
    return;
  }

  moodHistoryContainer.innerHTML = filtered
    .map(
      (entry) => `
        <div class="mood-card">
            <img src="./images/${entry.image}" class="mood-thumb">
            <div class="mood-info">
                <strong>${entry.emotion}</strong>
                <span>${entry.date}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

// ========== NEW FUNCTION 14: Get Weekly Summary ==========
function getWeeklySummary() {
  const history = getMoodHistory();
  const last7Days = history.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entryDate >= weekAgo;
  });

  const summary = {
    totalEntries: last7Days.length,
    emotions: countEmotions(last7Days),
    averageSeverity: calculateAverageSeverity(last7Days),
  };

  return summary;
}

// ========== NEW FUNCTION 15: Calculate Average Severity ==========
function calculateAverageSeverity(entries) {
  const severityScores = {
    positive: 1,
    low: 2,
    medium: 3,
    high: 4,
  };

  const total = entries.reduce((sum, entry) => {
    return sum + (severityScores[entry.severity] || 2);
  }, 0);

  return entries.length > 0 ? (total / entries.length).toFixed(1) : 0;
}

function getMoodHistory() {
  return JSON.parse(localStorage.getItem("moodHistory") || "[]");
}

function addNote() {
  const note = prompt("Add a note about how you're feeling:");
  if (note) {
    let history = getMoodHistory();
    history[history.length - 1].note = note;
    localStorage.setItem("moodHistory", JSON.stringify(history));
    renderMoodHistory();
  }
}

// ========== INITIALIZE ON LOAD ==========
renderEmotionsRadios(catsData);
renderMoodHistory();
updateMoodStats();

// Make functions globally available
// ========== INITIALIZE & GLOBAL ACCESS ==========

// 1. Make all functions public for the HTML buttons
window.exportAsCSV = exportAsCSV;
window.exportAsJSON = exportAsJSON;
window.clearAllData = clearAllData;
window.deleteEntry = deleteEntry;
window.addNote = addNote;

// 2. Wait for the page to load, THEN build the list and history
document.addEventListener("DOMContentLoaded", () => {
  if (catsData) {
    renderEmotionsRadios(catsData);
    renderMoodHistory();
    updateMoodStats();
  } else {
    console.error(
      "Data not found! Make sure your import at the top is correct.",
    );
  }
});
