import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createJudge0ClientFromEnv } from "./executors/judge0";

dotenv.config();

// Initialize Google Gemini AI
const geminiKey = process.env.GEMINI_API_KEY;
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const judge0 = createJudge0ClientFromEnv();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now(), judge0: !!judge0, gemini: !!ai });
});

app.post("/api/execute", async (req, res) => {
  const { language, code, input } = req.body || {};

  // If Judge0 configured, use it — otherwise fall back to mocked response
  if (!judge0) {
    const output = `Mocked execution — language: ${language || "unknown"}\nInput: ${String(input || "")}\n\n=== Output ===\nHello from mocked runner!`;
    return res.json({ output, time: "0.12s", memory: "8MB", status: "success", logs: ["mocked"] });
  }

  try {
    const langId = await judge0.resolveLanguageId(language || "");
    if (!langId) {
      return res.status(400).json({ error: `unsupported language: ${language}` });
    }

    const timeoutMs = Number(process.env.EXECUTION_TIMEOUT_MS || 5000);
    const result = await judge0.runSubmission(langId, code || "", input || "", timeoutMs);

    // Prefer stdout, stderr, or compile_output
    const output = result.stdout ?? result.stderr ?? result.compile_output ?? "";
    return res.json({ output, time: result.time, memory: result.memory, status: result.status, logs: [] });
  } catch (err: any) {
    console.error("/api/execute error:", err?.message ?? err);
    return res.status(500).json({ error: err?.message ?? "execution error" });
  }
});

// AI assistant endpoint powered by Google Gemini
app.post("/api/ai", async (req, res) => {
  const { message, currentCode, language, history } = req.body || {};

  if (!ai) {
    return res.json({ response: "AI is not configured. Please set GEMINI_API_KEY in the backend .env file." });
  }

  try {
    const systemPrompt = `You are an expert programming assistant embedded in a live code editor called LiveCode+.
Your role is to help developers write, debug, optimize, and understand code.

Guidelines:
- Be concise but thorough in your explanations.
- When suggesting code changes, show the specific code with proper formatting.
- Use markdown formatting: **bold** for emphasis, \`inline code\`, and \`\`\`language for code blocks.
- If the user shares code, analyze it carefully before responding.
- Point out bugs, performance issues, and best practices.
- When asked to optimize, explain what you changed and why.
- Suggest tests when appropriate.
- Be friendly and encouraging.`;

    // Build the prompt with context
    let prompt = "";

    if (currentCode && currentCode.trim()) {
      prompt += `The user is currently working with ${language || "code"} in the editor. Here is their current code:\n\n\`\`\`${language || ""}\n${currentCode}\n\`\`\`\n\n`;
    }

    prompt += `User message: ${message}`;

    // Build conversation history for multi-turn context
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add previous messages if provided
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const response = result.text ?? "Sorry, I couldn't generate a response.";
    return res.json({ response });
  } catch (err: any) {
    console.error("/api/ai error:", err?.message ?? err);
    return res.status(500).json({ error: err?.message ?? "AI service error" });
  }
});

app.use((req, res) => res.status(404).json({ error: "not_found" }));

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on http://localhost:${PORT} (Judge0 ${judge0 ? "enabled" : "disabled"}, Gemini ${ai ? "enabled" : "disabled"})`);
  try {
    // server.address() can be string or AddressInfo
    // print PID and address for debugging
    // @ts-ignore
    const addr = server.address();
    console.log({ pid: process.pid, address: addr });
  } catch (err) {
    console.log("server.address() unavailable", err);
  }
});

server.on("error", (err: any) => {
  console.error("HTTP server error:", err?.message ?? err);
});
