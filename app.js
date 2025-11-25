import express from "express";

const app = express();
app.use(express.json());

let status = {
  foodLevel: 24,
  sleepLevel: 24,
  playLevel: 24,
  currentScene: "default",
  creationTime: new Date().toISOString(),
  isDead: false
};

// ------- STATUS API -------
app.get("/status", (req, res) => {
  res.json(status);
});

// ------- JIRA WEBHOOK -------
app.post("/webhook", (req, res) => {
  const secret = req.headers["x-secret"];

  // 1. check secret
  if (secret !== "mijnSuperGeheimeWoord") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2. body uitlezen
  const action = req.body.action;

  if (!action) {
    return res.status(400).send("No action inside body");
  }

  // 3. Aanpassen van status op basis van rule
  switch (action) {
    case "toActive":
      status.currentScene = "playing";
      break;

    case "toDone":
      status.currentScene = "eating";
      break;

    default:
      return res.status(400).send("Unknown action");
  }

  console.log("Updated status:", status);
  res.json({ ok: true });
});

// Run for local testing
export default app;