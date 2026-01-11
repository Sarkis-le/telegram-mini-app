const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

function extractYouTubeVideoId(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
    }

    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    return null;
  }
}

app.get("/api/youtube-info", async (req, res) => {
  try {
    const url = String(req.query.url || "");
    if (!url) return res.status(400).json({ error: "Missing 'url' query param" });

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL or ID" });

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing YOUTUBE_API_KEY in .env" });

    const apiUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(key)}`;

    const r = await fetch(apiUrl);
    const data = await r.json();

    const item = data.items && data.items[0];
    if (!item) return res.status(404).json({ error: "Video not found" });

    res.json({
      videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnails: item.snippet.thumbnails,
      duration: item.contentDetails.duration,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      viewCount: item.statistics?.viewCount ?? null
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

app.get("/health", (req, res) => res.send("OK"));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
