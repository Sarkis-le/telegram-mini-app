// ===== CONFIG =====
const API_BASE = "https://telegram-mini-app-three-dun.vercel.app";

// Telegram WebApp (sécurité + UX)
if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

// ===== ELEMENTS =====
const ytInput = document.getElementById("ytUrl");
const btnAnalyze = document.getElementById("btnAnalyze");
const result = document.getElementById("result");
const errorEl = document.getElementById("error");

const thumb = document.getElementById("thumb");
const titleEl = document.getElementById("title");
const channelEl = document.getElementById("channel");
const durationEl = document.getElementById("duration");

const btnOpen = document.getElementById("btnOpen");
const btnShare = document.getElementById("btnShare");
const btnDownload = document.getElementById("btnDownload");

// ===== HELPERS =====
function showError(msg) {
  errorEl.textContent = msg;
  result.classList.add("hidden");
}

function clearError() {
  errorEl.textContent = "";
}

// ===== ACTION =====
btnAnalyze.addEventListener("click", async () => {
  const url = ytInput.value.trim();
  clearError();

  if (!url) {
    showError("Veuillez coller un lien YouTube.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/youtube-info?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error("Erreur API");
    }

    const data = await response.json();

    // ===== UI =====
    thumb.src = data.thumbnails.high.url;
    titleEl.textContent = data.title;
    channelEl.textContent = "Chaîne : " + data.channelTitle;
    durationEl.textContent = "Durée : " + data.duration;

    btnOpen.onclick = () => {
      window.open(data.watchUrl, "_blank");
    };

    btnShare.onclick = () => {
      if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.openTelegramLink(
          `https://t.me/share/url?url=${encodeURIComponent(data.watchUrl)}&text=${encodeURIComponent(data.title)}`
        );
      } else {
        navigator.share({
          title: data.title,
          url: data.watchUrl
        });
      }
    };

    // Pas de téléchargement réel (respect YouTube)
    btnDownload.classList.add("hidden");

    result.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    showError("Failed to fetch");
  }
});
