// app.js
import express from "express";

const app = express();
app.use(express.json());

// Moet hetzelfde zijn als in je Jira-header X-Secret
const SHARED_SECRET = "mijnSuperGeheimeWoord";

// Dit is de status die je Pi / flipboard straks ophaalt
let status = {
  foodLevel: 24,
  sleepLevel: 44,
  playLevel: 24,
  currentScene: "Hello_from_New_code",
  creationTime: new Date().toISOString(),
  isDead: false,
  lastUpdated: new Date().toISOString(),
  lastWebhookAction: null,
  lastWebhookAt: null,
  webhookHitCount: 0
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
  status.lastWebhookAt = new Date(lastUpdated).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });

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


// ⬇️ KIES HIERAFHANKELIJK VAN WAAR JE DRAAIT:

// 1) OP VERCEL  👉 GEEN app.listen, WEL export default:
export default app;

// 2) LOKAAL / RASPBERRY PI 👉 gebruik dit i.p.v. export default:
// app.listen(8080, () => {
//   console.log("Status server running on port 8080");
// });
 