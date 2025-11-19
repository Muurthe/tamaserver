import express from "express";

const app = express();
app.use(express.json());

let status = {
  foodLevel: 24,
  sleepLevel: 24,
  playLevel: 24,
  currentScene: "default",
  creationTime: "2025-11-18T13:16:26.116Z",
  isDead: true
};

// Geeft de status als pure JSON terug
app.get("/status", (req, res) => {
  res.json(status);
});

// Hiermee kun je later de status aanpassen, maar is nu niet nodig
app.post("/status", (req, res) => {
  status = { ...status, ...req.body };
  res.json(status);
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});