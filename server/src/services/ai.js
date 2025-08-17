import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function summarizeWithGemini({ transcript, instruction }) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  // Updated prompt to allow bolding but not asterisk lists
  const system = `You generate concise, structured meeting summaries.
- Use Markdown for emphasis, especially for headings and key terms (e.g., **Important Text**).
- Do NOT use asterisks (*) for bullet points. Use dashes (-) or numbers instead.
- Be direct and to the point.
Respect the user's instruction.`;
  const prompt = `${system}\nInstruction: ${instruction}\n\nTranscript:\n${transcript}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}