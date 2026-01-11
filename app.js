const tg = window.Telegram?.WebApp;
if (tg) tg.ready();

const API_BASE = "https://telegram-mini-app-three-dun.vercel.app";


const ytUrl = document.getElementById("ytUrl");
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

function formatIsoDuration(iso) {
  // PT4M13S -> 4:13 ; PT1H2M -> 1:02:00
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return iso;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

btnAnalyze.addEventListener("click", async () => {
  errorEl.textContent = "";
  result.classList.add("hidden");
  btnDownload.classList.add("hidden");
  btnDownload.removeAttribute("href");

  const url = ytUrl.value.trim();
  if (!url) {
    errorEl.textContent = "Colle un lien YouTube.";
    return;
  }

  try {
    btnAnalyze.disabled = true;
    btnAnalyze.textContent = "Analyse...";
    const res = await fetch(`${API_BASE}/api/youtube-info?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur API");

    const bestThumb =
      data.thumbnails?.maxres?.url ||
      data.thumbnails?.high?.url ||
      data.thumbnails?.medium?.url ||
      data.thumbnails?.default?.url;

    thumb.src = bestThumb || "";
    titleEl.textContent = data.title;
    channelEl.textContent = `Chaîne: ${data.channelTitle}`;
    durationEl.textContent = `Durée: ${formatIsoDuration(data.duration)}`;

    btnOpen.onclick = () => {
      if (tg) tg.openLink(data.watchUrl);
      else window.open(data.watchUrl, "_blank");
    };

    btnShare.onclick = () => {
      const txt = `${data.title}\n${data.watchUrl}`;
      if (tg) tg.shareText(txt);
      else navigator.clipboard?.writeText(txt);
    };

    // Si TU as un MP4 à toi pour cette vidéo, tu peux mettre un lien direct ici
    // Exemple: btnDownload.href = `https://ton-site.com/files/${data.videoId}.mp4`;
    // btnDownload.classList.remove("hidden");

    result.classList.remove("hidden");
  } catch (e) {
    errorEl.textContent = e.message || "Erreur";
  } finally {
    btnAnalyze.disabled = false;
    btnAnalyze.textContent = "Analyser";
  }
});
