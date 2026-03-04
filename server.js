import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let requestLog = {};

app.post("/", async (req, res) => {
  try {

    // ===== SECRET CHECK =====
    if (req.body.secret !== process.env.APP_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ===== RATE LIMIT =====
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();

    if (!requestLog[ip]) requestLog[ip] = [];

    requestLog[ip] = requestLog[ip].filter(
      timestamp => now - timestamp < 60000
    );

    if (requestLog[ip].length >= 5) {
      return res.status(429).json({
        error: "Too many requests. Wait 1 minute."
      });
    }

    requestLog[ip].push(now);

    // ===== INPUT VALIDATION =====
    if (!req.body.input || req.body.input.length < 20) {
      return res.status(400).json({
        error: "Essay too short"
      });
    }

    if (req.body.input.length > 4000) {
      return res.status(400).json({
        error: "Essay too long"
      });
    }

    // ===== OPENAI CALL =====
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `
You are an IELTS Writing Task 1 examiner.

Return STRICT JSON only.

Rules:
- Give overall band (0-9).
- Give 1 short feedback paragraph (max 120 words).
- Give breakdown: TR, CC, LR, GRA.
- If band >= 8.0 → socratic_questions = [].
- Otherwise give exactly 5 Socratic questions.
- No hints.
- No explanations outside JSON.

Format:

{
  "overall_band": number,
  "breakdown": {
    "TR": number,
    "CC": number,
    "LR": number,
    "GRA": number
  },
  "feedback": "text",
  "socratic_questions": []
}
`
            },
            {
              role: "user",
              content: req.body.input
            }
          ],
          max_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ openai_error: data });
    }

    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "AI returned invalid JSON"
      });
    }

    return res.json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
