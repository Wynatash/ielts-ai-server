import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ====== RATE LIMIT MEMORY STORE ======
let requestLog = {};

// ====== MAIN ROUTE ======
app.post("/", async (req, res) => {
  try {

    // ====== 1. SECRET CHECK ======
    if (req.body.secret !== process.env.APP_SECRET) {
      return res.status(403).json({
        error: "Unauthorized"
      });
    }

    // ====== 2. RATE LIMIT (5 REQUEST / MINUTE / IP) ======
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();

    if (!requestLog[ip]) requestLog[ip] = [];

    // Giữ lại request trong 60 giây
    requestLog[ip] = requestLog[ip].filter(
      timestamp => now - timestamp < 60000
    );

    if (requestLog[ip].length >= 5) {
      return res.status(429).json({
        error: "Too many requests. Please wait 1 minute."
      });
    }

    requestLog[ip].push(now);

    // ====== 3. INPUT VALIDATION ======
    if (!req.body.input || req.body.input.length < 10) {
      return res.status(400).json({
        error: "Input too short"
      });
    }

    if (req.body.input.length > 4000) {
      return res.status(400).json({
        error: "Input too long"
      });
    }

    // ====== 4. CALL OPENAI ======
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
          messages: [
            {
              role: "system",
              content:
                "You are an IELTS Writing examiner. Give band score, detailed feedback, and Socratic questions to help improvement."
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
      return res.status(500).json({
        openai_error: data
      });
    }

    return res.json({
      output_text:
        data.choices?.[0]?.message?.content || ""
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

// ====== HEALTH CHECK (OPTIONAL) ======
app.get("/", (req, res) => {
  res.send("IELTS AI Server Running");
});

// ====== START SERVER ======
app.listen(process.env.PORT || 3000);
