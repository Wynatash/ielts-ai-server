import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server Running");
});

app.post("/grade", async (req, res) => {

  if (req.body.secret !== "IELTS2026_SECURE") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const prompt = req.body.input;

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600
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

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI Server Running");
});
