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
  console.log("=== Incoming Tama webhook ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // 1. Secret check
  const secret = req.header("X-Secret") || req.header("x-secret");
  if (secret !== SHARED_SECRET) {
    console.log("❌ Invalid secret:", secret);
    return res.status(403).json({ error: "Invalid secret" });
  }

  // 2. Haal action uit de body
  const { action } = req.body;
  console.log("Received action:", action);

  if (!action) {
    return res.status(400).json({ error: "Missing 'action' in body" });
  }

  // 3. Koppel Jira actions direct aan scenes
  // Eating rule in Jira stuurt: { "action": "toDone" }
  if (action === "toDone") {
    // ← jouw eating rule
    status.currentScene = "eating";
  } else if (action === "toActive") {
    // bv. weer terug naar default of spelen, kies zelf:
    status.currentScene = "playing"; // of "default"
  } else {
    console.log("❌ Onbekende action:", action);
    return res.status(400).json({ error: "Unknown action value" });
  }

  status.lastUpdated = new Date().toISOString();
  console.log("✅ New status:", status);

  return res.status(200).json({ ok: true });
});

// ⬇️ KIES HIERAFHANKELIJK VAN WAAR JE DRAAIT:

// 1) OP VERCEL  👉 GEEN app.listen, WEL export default:
export default app;

// 2) LOKAAL / RASPBERRY PI 👉 gebruik dit i.p.v. export default:
// app.listen(8080, () => {
//   console.log("Status server running on port 8080");
// });
 