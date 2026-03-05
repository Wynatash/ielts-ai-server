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

  const essay = req.body.essay;
  const question = req.body.question;

  try {

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Grade this IELTS Task 1 essay and give band score and feedback.

Question:
${question}

Essay:
${essay}`
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const text = response.data.choices[0].message.content;

    res.json({
      output: text
    });

  } catch (err) {

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: "AI call failed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});
