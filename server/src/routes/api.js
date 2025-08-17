import express from "express";
import multer from "multer";
import Summary from "../models/Summary.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendSummaryEmail } from "../utils/mailer.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health
router.get("/health", (_, res) => res.json({ ok: true }));

// Summarize (accepts raw text or uploaded .txt file)
router.post("/summarize", upload.single("file"), async (req, res) => {
  try {
    const { transcript: bodyTranscript, prompt = "Summarize the following notes." } = req.body;

    let transcript = bodyTranscript || "";
    if (req.file && req.file.buffer) {
      transcript = req.file.buffer.toString("utf-8");
    }
    if (!transcript.trim()) {
      return res.status(400).json({ error: "No transcript provided." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction =
      `You are an assistant that produces concise, structured meeting summaries.\n` +
      `Follow the user's instruction exactly. Produce clean markdown.\n`;

    const userPrompt =
      `${systemInstruction}\n` +
      `Instruction: ${prompt}\n\n` +
      `Transcript:\n${transcript}`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    // Save to DB
    const saved = await Summary.create({
      transcript,
      prompt,
      summary: text,
      recipients: []
    });

    res.json({ summary: text, id: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed." });
  }
});

// Update (edit summary after user changes it)
router.put("/summaries/:id", async (req, res) => {
  try {
    const { summary, prompt, transcript } = req.body;
    const updated = await Summary.findByIdAndUpdate(
      req.params.id,
      { ...(summary && { summary }), ...(prompt && { prompt }), ...(transcript && { transcript }) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed." });
  }
});

// Share via email
router.post("/share", async (req, res) => {
  try {
    const { id, recipients, subject } = req.body;
    const doc = await Summary.findById(id);
    if (!doc) return res.status(404).json({ error: "Summary not found" });

    const toList = (recipients || [])
      .map((r) => String(r || "").trim())
      .filter(Boolean);

    if (!toList.length) return res.status(400).json({ error: "No recipients." });

    const html = `
      <div style="font-family: Inter, Arial; line-height:1.5;">
        <h2>Shared Summary</h2>
        <p><strong>Prompt:</strong> ${escapeHtml(doc.prompt)}</p>
        <hr/>
        <div>${markdownToHtml(doc.summary)}</div>
        <hr/>
        <small>Sent via AI Notes Summarizer</small>
      </div>
    `;
    await sendSummaryEmail({
      to: toList.join(","),
      subject: subject || "Meeting Summary",
      html
    });

    // store recipients for record
    doc.recipients = Array.from(new Set([...(doc.recipients || []), ...toList]));
    await doc.save();

    res.json({ ok: true, sent: toList.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Email failed." });
  }
});

// Simple helpers
function escapeHtml(s = "") {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// very tiny markdown -> html (bold, italics, code blocks, bullets)
function markdownToHtml(md = "") {
  let html = escapeHtml(md);
  // code fences
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
  // bold/italics
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // bullet lines
  html = html.replace(/^- (.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*<\/li>)/g, "<ul>$1</ul>");
  // newlines
  html = html.replace(/\n/g, "<br/>");
  return html;
}

export default router;
