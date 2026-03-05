import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/", async (req, res) => {

  if (req.body.secret !== "IELTS2026_SECURE") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-5-nano",

        input: req.body.input,

        max_output_tokens: 800
        
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.output?.[0]?.content?.[0]?.text || "";

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
