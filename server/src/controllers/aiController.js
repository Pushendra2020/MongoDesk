import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const askAI = async (req, res) => {
  try {
    const { prompt, conversation } = req.body;

    const messages = [
      {
        role: "system",
        // Updated prompt to allow bolding
        content: `You are an AI assistant.
- Format your response using Markdown for emphasis, like making text bold with **asterisks**.
- For lists, use simple dashes or numbers, not asterisks (*).
- Avoid casual greetings.`
      },
      ...conversation,
      { role: "user", content: prompt }
    ];

    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages,
      temperature: 0.4
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed to respond" });
  }
};