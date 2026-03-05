import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/", async (req, res) => {

  if (req.body.secret !== "IELTS2026_SECURE") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-5-nano",
        messages: [
          {
            role: "user",
            content: req.body.input
          }
        ],
        max_tokens: 1200,
        temperature: 0.3
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.choices?.[0]?.message?.content || "";

    res.json({
      output_text: text
    });

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
