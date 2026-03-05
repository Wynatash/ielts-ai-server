import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("IELTS AI Server running");
});

app.post("/grade", async (req, res) => {

  try {

    const { essay, taskImage, mode } = req.body;

    if (!essay) {
      return res.status(400).json({ error: "Essay missing" });
    }

    // ==========================
    // SOCRATIC MODE
    // ==========================

    if (mode === "socratic") {

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
You are an IELTS Writing coach.

Student essay:
${essay}

Do NOT give corrections.

Instead give:

1. 3 Socratic questions
2. 2 hints

Return JSON:

{
"questions":[],
"hints":[]
}
`
      });

      const text = response.output_text;

      return res.json(JSON.parse(text));

    }

    // ==========================
    // FINAL GRADING
    // ==========================

    const prompt = `
You are a certified IELTS examiner.

Grade the following essay using IELTS Writing Task 1 criteria.

Essay:
${essay}

Return ONLY JSON:

{
"overall":number,
"TA":number,
"CC":number,
"LR":number,
"GRA":number,

"grammar_errors":[
{
"start":number,
"end":number,
"explanation":"string",
"correction":"string"
}
],

"feedback":{
"strengths":"string",
"weaknesses":"string",
"improvements":"string"
}
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const text = response.output_text;

    const json = JSON.parse(text);

    res.json(json);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI grading failed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
