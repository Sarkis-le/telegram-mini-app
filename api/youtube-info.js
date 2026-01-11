export default async function handler(req, res) {
  // ✅ CORS : autoriser GitHub Pages + Telegram WebView
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  // ✅ Préflight (Telegram envoie souvent OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ... le reste de ton code ici
}

export default async function handler(req, res) {
  const input = req.query.url;
  if (!input) return res.status(400).json({ error: "Missing url" });

  function getId(x) {
    try {
      const u = new URL(x);
      const host = u.hostname.replace("www.", "");
      if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || null;
      if (host.includes("youtube.com")) {
        if (u.pathname === "/watch") return u.searchParams.get("v");
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
        if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      }
      return null;
    } catch {
      return /^[a-zA-Z0-9_-]{11}$/.test(x) ? x : null;
    }
  }

  const videoId = getId(input);
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing YOUTUBE_API_KEY" });

  const apiUrl =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(key)}`;

  const r = await fetch(apiUrl);
  const data = await r.json();

  const item = data.items?.[0];
  if (!item) return res.status(404).json({ error: "Video not found" });

  res.json({
    videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnails: item.snippet.thumbnails,
    duration: item.contentDetails.duration,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`
  });
}
