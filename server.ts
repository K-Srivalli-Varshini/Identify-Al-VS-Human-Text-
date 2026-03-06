import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import "dotenv/config";

const db = new Database("history.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    prediction TEXT,
    confidence REAL,
    model TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const addLog = (level: string, message: string) => {
  const stmt = db.prepare("INSERT INTO logs (level, message) VALUES (?, ?)");
  stmt.run(level, message);
  console.log(`[${level}] ${message}`);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM history ORDER BY timestamp DESC").all();
    res.json(history);
  });

  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
    res.json(logs);
  });

  app.delete("/api/history/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM history WHERE id = ?").run(id);
    addLog("INFO", `History record ${id} deleted.`);
    res.json({ success: true });
  });

  app.delete("/api/history", (req, res) => {
    db.prepare("DELETE FROM history").run();
    addLog("INFO", "All history records cleared.");
    res.json({ success: true });
  });

  app.post("/api/analyze", async (req, res) => {
    const { text, model } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    let isSimulationMode = false;
    
    if (!apiKey || apiKey.trim() === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      isSimulationMode = true;
      addLog("WARNING", "GEMINI_API_KEY not found. Entering Simulation Mode for demonstration.");
    }

    addLog("INFO", `User Input Received. ${isSimulationMode ? 'Running Local Simulation' : 'Running AI Analysis'}`);

    try {
      let result;

      if (isSimulationMode) {
        // Local heuristic-based simulation for demonstration
        const aiPatterns = [
          /\b(in conclusion|it is important to note|furthermore|moreover|consequently)\b/gi,
          /\b(delve|tapestry|unveil|leverage|comprehensive)\b/gi,
          /\b(as an ai language model|my knowledge cutoff)\b/gi
        ];
        
        let score = 0.5; // Start at neutral
        const matches = aiPatterns.reduce((acc, pattern) => acc + (text.match(pattern)?.length || 0), 0);
        
        // Simple logic: more transition words/AI buzzwords = higher AI probability
        score += (matches * 0.1);
        if (text.length < 50) score -= 0.2; // Short texts are harder to judge, bias human
        
        const finalScore = Math.min(Math.max(score, 0.1), 0.95);
        const isAI = finalScore > 0.55;

        result = {
          prediction: isAI ? "AI Generated" : "Human Written",
          confidence: isAI ? finalScore : (1 - finalScore),
          reasoning: `(SIMULATION) Analysis based on linguistic patterns, sentence structure, and vocabulary complexity. ${matches > 0 ? 'Detected common AI transition patterns.' : 'Text exhibits natural human-like variation.'}`
        };
        
        // Artificial delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const genModel = ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze the following text and determine if it was likely written by an AI or a Human. 
          Return ONLY a JSON object with the following structure:
          {
            "prediction": "AI Generated" | "Human Written",
            "confidence": number (between 0 and 1),
            "reasoning": "brief explanation"
          }
          
          Text: "${text.substring(0, 2000)}"`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const response = await genModel;
        result = JSON.parse(response.text || "{}");
      }

      const stmt = db.prepare("INSERT INTO history (text, prediction, confidence, model) VALUES (?, ?, ?, ?)");
      stmt.run(text, result.prediction, result.confidence, isSimulationMode ? "Local Heuristic (Simulated)" : model);

      addLog("INFO", `Prediction: ${result.prediction} (${(result.confidence * 100).toFixed(1)}%)`);
      
      res.json({
        ...result,
        timestamp: new Date().toISOString(),
        model: isSimulationMode ? "Local Heuristic (Simulated)" : model,
        isSimulation: isSimulationMode
      });
    } catch (error: any) {
      addLog("ERROR", `Analysis failed: ${error.message}`);
      res.status(500).json({ error: error.message || "Failed to analyze text" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    addLog("INFO", `Server running on http://localhost:${PORT}`);
  });
}

startServer();
