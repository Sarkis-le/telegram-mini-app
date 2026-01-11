const API_BASE = "https://telegram-mini-app-three-dun.vercel.app";

const form = document.getElementById("form");
const input = document.getElementById("youtubeUrl");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = input.value.trim();
  result.innerHTML = "Analyse en cours...";

  try {
    const apiUrl =
      `${API_BASE}/api/youtube-info?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Erreur API");
    }

    const data = await response.json();

    result.innerHTML = `
      <h3>${data.title}</h3>
      <p><strong>Chaîne :</strong> ${data.channelTitle}</p>
      <img src="${data.thumbnails.high.url}" width="100%" />
      <p><strong>Durée :</strong> ${data.duration}</p>
      <p>
        <a href="${data.watchUrl}" target="_blank">
          Ouvrir sur YouTube
        </a>
      </p>
    `;
  } catch (err) {
    console.error(err);
    result.innerHTML = `<p style="color:red">Erreur : ${err.message}</p>`;
  }
});
