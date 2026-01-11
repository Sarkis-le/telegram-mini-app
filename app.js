const API_BASE = "https://telegram-mini-app-three-dun.vercel.app";

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

function setError(msg) {
  errorEl.textContent = msg || "";
}

function hideResult() {
  result.classList.add("hidden");
}
function showResult() {
  result.classList.remove("hidden");
}

function inTg() {
  return !!(window.Telegram && Telegram.WebApp);
}

if (inTg()) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

// ✅ Test réseau au chargement (important)
(async () => {
  try {
    const pingUrl = `${API_BASE}/api/youtube-info?url=${encodeURIComponent("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}`;
    const r = await fetch(pingUrl, { method: "GET" });
    // On ne remplit pas l’UI ici, juste pour vérifier que la requête passe dans Telegram
    console.log("PING STATUS:", r.status);
  } catch (e) {
    console.error("PING FAIL:", e);
  }
})();

btnAnalyze.addEventListener("click", async () => {
  const url = (ytInput.value || "").trim();
  hideResult();
  setError("");

  if (!url) {
    setError("Colle un lien YouTube.");
    return;
  }

  const apiUrl = `${API_BASE}/api/youtube-info?url=${encodeURIComponent(url)}`;
  console.log("API URL =>", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      // headers simples (évite préflight CORS inutile)
      headers: { "Accept": "application/json" }
    });

    console.log("RES OK?", res.ok, "STATUS:", res.status);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }

    const data = await res.json();
    console.log("DATA:", data);

    const img =
      data.thumbnails?.high?.url ||
      data.thumbnails?.medium?.url ||
      data.thumbnails?.default?.url ||
      "";

    thumb.src = img;
    titleEl.textContent = data.title || "";
    channelEl.textContent = "Chaîne : " + (data.channelTitle || "");
    durationEl.textContent = "Durée : " + (data.duration || "");

    btnOpen.onclick = () => {
      const link = data.watchUrl;
      if (!link) return;
      if (inTg()) Telegram.WebApp.openLink(link);
      else window.open(link, "_blank");
    };

    btnShare.onclick = () => {
      const link = data.watchUrl;
      if (!link) return;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(data.title || "YouTube")}`;
      if (inTg()) Telegram.WebApp.openTelegramLink(shareUrl);
      else window.open(shareUrl, "_blank");
    };

    btnDownload.classList.add("hidden");
    showResult();
  } catch (err) {
    console.error("FETCH ERROR:", err);

    // ✅ on affiche le vrai message
    setError("Erreur : " + (err?.message || "Failed to fetch"));
  }
});
