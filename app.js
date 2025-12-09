import express from "express";

const app = express();
app.use(express.json());

const SHARED_SECRET = "mijnSuperGeheimeWoord"; //Jira Value

let status = {
  foodLevel: 24,
  sleepLevel: 24,
  playLevel: 24,
  currentScene: "default",
  creationTime: new Date().toISOString(),
  isDead: false,
  lastUpdated: new Date().toISOString()
};

// helper to keep the  levels between 0–24 
function clamp(value, min = 0, max = 24) {
  return Math.max(min, Math.min(max, value));
}

// implement commando's
function applyCommand(command) {
  if (status.isDead && command !== "revive") {
    // if he is dead, only "revive" works
    return;
  }
  switch (command) {
    case "feed":
      status.foodLevel = clamp(status.foodLevel + 1);
      status.currentScene = "feeding";
      break;

    case "sleep":
      status.sleepLevel = clamp(status.sleepLevel + 1);
      status.currentScene = "sleeping";
      break;

    case "play":
      status.playLevel = clamp(status.playLevel + 4);
      status.currentScene = "playing";
      break;

    case "kill":
      status.isDead = true;
      status.currentScene = "dead";
      break;

    case "revive":
      status = {
        foodLevel: 24,
        sleepLevel: 24,
        playLevel: 24,
        currentScene: "default",
        creationTime: new Date().toISOString(),
        isDead: false,
        lastUpdated: new Date().toISOString()
      };
      return;

    default:
      // Unknown commando → do nothing
      return;
  }
  
  // Update timestamp
  status.lastUpdated = new Date().toISOString();
}

// Map Jira "action" field to internal commands
function mapActionToCommand(action) {
  // You can change these mappings to whatever makes sense
  switch (action) {
    case "toActive":
      // Todo → Active
      return "play";
    case "toDone":
      // Active → Done
      return "feed";
    default:
      return null;
  }
}

// Generic webhook endpoint for Jira (and optionally Slack)
app.post("/webhook/tama", (req, res) => {
  console.log("=== Incoming Tama webhook ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Incoming Tama webhook:", req.body);

  // Basic shared-secret check
  const secret = req.header("X-Secret") || req.header("x-secret");
  if (secret !== SHARED_SECRET) {
    return res.status(403).json({ error: "Invalid secret" });
  }

  const { command, action } = req.body;

  let finalCommand = command || null;

  // If no 'command' is provided but 'action' is, map it
  if (!finalCommand && action) {
    finalCommand = mapActionToCommand(action);
  }

  if (!finalCommand) {
    return res
      .status(400)
      .json({ error: "Missing 'command' or unmapped 'action' value" });
  }

  applyCommand(finalCommand);
  return res.status(200).json({ ok: true });
});

// The Raspberry Pi reads this to update animations
app.get("/status", (req, res) => {
  res.json(status);
});

// Start server
app.listen(8080, () => {
  console.log("Status server running on port 8080");
});