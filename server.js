import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI server running");
});

app.post("/", async (req, res) => {

  if (req.body.secret !== "IELTS2026_SECURE") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: req.body.input,
        max_output_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text =
      response.data.output?.[0]?.content?.[0]?.text || "";

    res.json({ output_text: text });

  } catch (error) {

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
