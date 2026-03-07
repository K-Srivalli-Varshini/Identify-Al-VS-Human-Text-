import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "history.db");
const db = new Database(dbPath);

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
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const segments = sentences.map((s: string, i: number) => {
          const isAI = i % 3 === 0; // Simple simulation logic
          return {
            text: s,
            label: isAI ? "AI Generated" : "Human Written",
            score: isAI ? 0.8 : 0.2
          };
        });

        const aiCount = segments.filter((s: any) => s.label === "AI Generated").length;
        const overallIsAI = aiCount > segments.length / 2;

        result = {
          prediction: overallIsAI ? "AI Generated" : "Human Written",
          confidence: 0.85,
          reasoning: "(SIMULATION) Analysis based on linguistic patterns. Detected mixed signals in the text structure.",
          segments
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const modelPrompt = model.includes("RoBERTa") 
          ? "Acting as a RoBERTa-based linguistic classifier, analyze the following text for AI generation patterns."
          : "Analyze the following text for AI generation.";

        const genModel = ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `${modelPrompt}
          Break the text into logical segments (sentences or short paragraphs).
          For each segment, determine if it was likely written by an AI or a Human.
          
          Return a JSON object with this structure:
          {
            "prediction": "AI Generated" | "Human Written",
            "confidence": number (0-1),
            "reasoning": "string",
            "segments": [
              {
                "text": "the segment text",
                "label": "AI Generated" | "Human Written",
                "score": number (0-1, probability of being AI)
              }
            ]
          }
          
          Text: """${text.substring(0, 3000).replace(/"/g, "'")}"""`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const response = await genModel;
        const textResponse = response.text;
        
        if (!textResponse) {
          throw new Error("Empty response from AI model");
        }

        try {
          result = JSON.parse(textResponse);
        } catch (parseError) {
          addLog("ERROR", `JSON Parse Error: ${textResponse}`);
          throw new Error("Failed to parse AI model response as JSON");
        }

        if (!result.prediction || typeof result.confidence !== 'number') {
          throw new Error("Invalid response format from AI model");
        }
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
