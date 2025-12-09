// app.js
import express from "express";

const app = express();
app.use(express.json());

// Moet hetzelfde zijn als in je Jira-header X-Secret
const SHARED_SECRET = "mijnSuperGeheimeWoord";

// Dit is de status die je Pi / flipboard straks ophaalt
let status = {
  foodLevel: 40,
  sleepLevel: 40,
  playLevel: 40,
  currentScene: "default",
  isDead: false,
  lastUpdated: new Date().toISOString(),
};

console.log("test");


// Helper om waardes tussen 0–24 te houden
function clamp(value, min = 0, max = 24) {
  return Math.max(min, Math.min(max, value));
}


// Kleine check-route om te zien of de server leeft
app.get("/", (req, res) => {
  res.send("Tama server is running");
});

// Hier leest je Pi / flipboard de status uit
app.get("/status", (req, res) => {
  res.json(status);
});

// 👉 Dit is de webhook waar Jira naartoe POST
// URL in Jira: https://tamaserver.vercel.app/webhook/tama
app.post("/webhook/tama", (req, res) => {
  // 1. Secret check
  const secret = req.header("X-Secret") || req.header("x-secret");
  if (secret !== SHARED_SECRET) {
    return res.status(403).json({ error: "Invalid secret" });
  }

  const { action } = req.body;

  // Log in status zodat jij het via /status kunt zien
  status.webhookHitCount += 1;
  status.lastWebhookAction = action || null;
  status.lastWebhookAt = new Date().toISOString();

  if (!action) {
    return res.status(400).json({ error: "Missing 'action' in body" });
  }

  if (action === "toDone") {
    status.currentScene = "eating";
  } else if (action === "toActive") {
    status.currentScene = "playing";
  } else {
    return res.status(400).json({ error: "Unknown action value" });
  }

  status.lastUpdated = new Date().toISOString();
  return res.status(200).json({ ok: true });
});


//monitor so the /status wil update
app.get("/monitor", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="nl">
      <head>
        <meta charset="UTF-8" />
        <title>Tama Monitor</title>
        <style>
          body { font-family: sans-serif; padding: 20px; font-size: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Tama Monitor (Live)</h1>
        <p><span class="label">Current scene:</span> <span id="scene">...</span></p>
        <p><span class="label">Webhook hits:</span> <span id="hits">0</span></p>
        <p><span class="label">Last action:</span> <span id="action">-</span></p>
        <p><span class="label">Last updated:</span> <span id="updated">-</span></p>

        <script>
          async function refreshStatus() {
            const res = await fetch("/status");
            const data = await res.json();

            document.getElementById("scene").textContent = data.currentScene;
            document.getElementById("hits").textContent = data.webhookHitCount;
            document.getElementById("action").textContent = data.lastWebhookAction || "-";

            if (data.lastUpdated) {
              const time = new Date(data.lastUpdated).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
              document.getElementById("updated").textContent = time;
            }
          }

          refreshStatus();                 // 1x meteen ophalen
          setInterval(refreshStatus, 2000); // elke 2 seconden vernieuwen
        </script>
      </body>
    </html>
  `);
});

export default app;