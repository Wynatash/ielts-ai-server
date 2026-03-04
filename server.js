import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {

  if (req.body.secret !== "IELTS2026_SECURE") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "user", content: req.body.input }
        ],
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const text = response.data.choices?.[0]?.message?.content || "";

    res.json({
      output_text: text
    });

  } catch (err) {
    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

app.listen(3000, () => console.log("Server running"));
