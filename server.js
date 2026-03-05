import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server is running");
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const text =
      response.data.output?.[0]?.content?.[0]?.text || "";

    res.json({
      output_text: text
    });

  } catch (err) {

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
