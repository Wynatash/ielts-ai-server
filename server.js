import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/grade", async (req, res) => {
  try {
    const essay = req.body.essay;

    if (!essay) {
      return res.status(400).json({ error: "Missing essay" });
    }

    const prompt = `
You are an IELTS Writing examiner.

Analyze the essay and give feedback:

1. Estimated band score (0-9)
2. Grammar mistakes
3. Vocabulary feedback
4. Suggestions for improvement

Essay:
${essay}
`;

    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data.output_text;

    if (!output) {
      return res.json({
        result: "AI did not return content."
      });
    }

    res.json({
      result: output
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
