import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/grade", async (req, res) => {
  try {

    const { input, secret } = req.body;

    if (secret !== process.env.APP_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: input,
        max_output_tokens: 1200
      })
    });

    const data = await response.json();

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "";

    res.json({
      output_text: text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("IELTS AI Server Running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
