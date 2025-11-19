import express from "express";
const app = express(); 
app.use(express.json());

let status = {
  foodLevel: 24,
  sleepLevel: 24,
  playLevel: 20,
  currentScene: "default",
  creationTime: "2025-11-19T13:16:26.116Z",
  isDead: false
};

// GET endpoint — flipboard haalt status op
app.get("/status", (req, res) => {
  res.json(status);
});

// POST endpoint — Jira verandert status
pp.post("/jira-webhook", (req, res) => {
  const { newStatus } = req.body;

  if (newStatus === "Active") {
    status.currentScene = "playing";
    console.log("playing");
  }

  if (newStatus === "Done") {
    status.currentScene = "feeding";
    console.log("eating");
  }

  res.json({ ok: true });
});

export default app;