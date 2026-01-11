// ✅ URL de ton backend Vercel
const API_BASE = "https://telegram-mini-app-three-dun.vercel.app";

// Elements
const ytUrl = document.getElementById("ytUrl");
const btnAnalyze = document.getElementById("btnAnalyze");

const result = document.getElementById("result");
const thumb = document.getElementById("thumb");
const titleEl = document.getElementById("title");
const channelEl = document.getElementById("channel");
const durationEl = document.getElementById("duration");

const btnOpen = document.getElementById("btnOpen");
const btnShare = document.getElementById("btnShare");
const btnDownload = document.getElementById("btnDownload");

const errorEl = document.getElementById("error");

let lastWatchUrl = "";

// Helpers UI
function showError(msg) {
  errorEl.textContent = msg || "";
}

function hideResult() {
  result.classList.add("hidden");
}

function showResult() {
  result.classList.remove("hidden");
}

function setLoading(isLoading) {
  btnAnalyze.disabled = isLoading;
  btnAnalyze.textContent = isLoading ? "Analyse..." : "Analyser";
}

// Telegram WebApp (si ouvert dans Telegram)
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  // optionnel : adapter thème / bouton back etc.
}

// Analyse
btnAnalyze.addEventListener("click", async () => {
  const url = (ytUrl.value || "").trim();

  showError("");
  hideResult();

  if (!url) {
    showError("Colle un lien YouTube.");
    return;
  }

  setLoading(true);

  try {
    // ✅ IMPORTANT : encodeURIComponent pour éviter que &list=... casse le fetch
    const apiUrl = `${API_BASE}/api/youtube-info?url=${encodeURIComponent(url)}`;

    const res = await fetch(apiUrl, { method: "GET" });

    if (!res.ok) {
      // on lit le texte pour afficher une erreur claire
      const text = await res.text();
      throw new Error(text || `Erreur API (${res.status})`);
    }

    const data = await res.json();

    // Remplir l'UI
    titleEl.textContent = data.title || "";
    channelEl.textContent = data.channelTitle ? `Chaîne : ${data.channelTitle}` : "";
    durationEl.textContent = data.duration ? `Durée : ${data.duration}` : "";

    // miniature (high si possible)
    const img =
      data.thumbnails?.maxres?.url ||
      data.thumbnails?.standard?.url ||
      data.thumbnails?.high?.url ||
      data.thumbnails?.medium?.url ||
      data.thumbnails?.default?.url ||
      "";

    thumb.src = img;
    thumb.style.display = img ? "block" : "none";

    lastWatchUrl = data.watchUrl || "";

    // Bouton ouvrir
    btnOpen.onclick = () => {
      if (!lastWatchUrl) return;

      // Dans Telegram, ouvre via WebApp.openLink si dispo
      if (tg?.openLink) tg.openLink(lastWatchUrl);
      else window.open(lastWatchUrl, "_blank");
    };

    // Bouton partager
    btnShare.onclick = () => {
      if (!lastWatchUrl) return;

      // Si dans Telegram : partager via lien t.me/share/url (simple et fiable)
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(lastWatchUrl)}&text=${encodeURIComponent(data.title || "YouTube")}`;
      if (tg?.openLink) tg.openLink(shareUrl);
      else window.open(shareUrl, "_blank");
    };

    // Téléchargement : caché par défaut (pas de MP4 fourni)
    btnDownload.classList.add("hidden");
    btnDownload.removeAttribute("href");

    showResult();
  } catch (e) {
    console.error(e);
    showError("Failed to fetch : " + (e?.message || "Erreur inconnue"));
  } finally {
    setLoading(false);
  }
});
