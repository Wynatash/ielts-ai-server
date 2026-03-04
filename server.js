import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  try {

    if (req.body.secret !== process.env.APP_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!req.body.input || req.body.input.length < 5) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are an IELTS Writing examiner. Give band score and Socratic questions."
          },
          {
            role: "user",
            content: req.body.input
          }
        ],
        max_tokens: 700
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json(data);
    }

    res.json({
      output_text: data.choices?.[0]?.message?.content || ""
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(process.env.PORT || 3000);
