import { catsData } from "/data.js";

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

  // NEW: Save mood entry when user gets image
  saveMoodEntry(catObject);

  memeModalInner.innerHTML = `
        <img 
        class="cat-img" 
        src="./images/${catObject.image}"
        alt="${catObject.alt}"
        >
        <p class="affirmation">${catObject.affirmation}</p>
        <button class="save-note-btn" onclick="addNote()" class="save-note-btn">Add Note</button>
    `;
  memeModal.style.display = "flex";

  // NEW: Update stats after each entry
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

    // 2. Get the newly selected source (make sure these exist in your HTML!)
    const selectedSource = document.querySelector(
      'input[name="source"]:checked',
    ).value;

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

function getEmotionsArray(cats){
    const emotionsArray = []    
    for (let cat of cats){
        for (let emotion of cat.emotionTags){
            if (!emotionsArray.includes(emotion)){
                emotionsArray.push(emotion)
            }
        }
    }
    return emotionsArray
}

function renderEmotionsRadios(cats){
    let radioItems = ``
    const emotions = getEmotionsArray(cats)
    for (let emotion of emotions){
        radioItems += `
        <div class="radio">
            <label for="${emotion}">${emotion}</label>
            <input
            type="radio"
            id="${emotion}"
            value="${emotion}"
            name="emotions"
            >
        </div>`
    }
    emotionRadios.innerHTML = radioItems
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
function getMoodHistory() {
  return JSON.parse(localStorage.getItem("moodHistory")) || [];
}

// ========== NEW FUNCTION 3: Render Mood History ==========
function renderMoodHistory() {
  const history = getMoodHistory();

  if (history.length === 0) {
    moodHistoryContainer.innerHTML =
      '<p class="empty-state">No mood entries yet. Track your first emotion!</p>';
    return;
  }

  // Show last 7 entries
  const recentEntries = history.slice(-7).reverse();

  moodHistoryContainer.innerHTML = recentEntries
    .map(
      (entry, index) => `
        <div class="mood-card ${entry.severity}">
            <img src="./images/${entry.image}" class="mood-thumb" alt="${entry.emotion}">
            <div class="mood-info">
                <strong>${entry.emotion}</strong>
                <span class="mood-date">${entry.date} at ${entry.time}</span>
                ${entry.note ? `<p class="mood-note">${entry.note}</p>` : ""}
            </div>
            <button class="delete-entry" onclick="deleteEntry(${history.length - 1 - index})">✕</button>
        </div>
    `,
    )
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

