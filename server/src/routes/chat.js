import express from "express";
import multer from "multer";
import { authRequired } from "../middleware/auth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { summarizeWithGemini } from "../services/ai.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authRequired);

// list conversations
router.get("/conversations", async (req, res) => {
  const items = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  res.json(items);
});

// create conversation
router.post("/conversations", async (req, res) => {
  const { title } = req.body;
  const conv = await Conversation.create({ userId: req.user.id, title: title || "New chat" });
  res.json(conv);
});

// get messages of a conversation
router.get("/conversations/:id/messages", async (req, res) => {
  const msgs = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
  res.json(msgs);
});

// user sends transcript+instruction; server responds with summary message
router.post("/conversations/:id/summarize", upload.single("file"), async (req, res) => {
  const { instruction = "Summarize in bullets with action items.", transcript: tBody } = req.body;
  let transcript = tBody || "";
  if (req.file?.buffer) transcript = req.file.buffer.toString("utf-8");
  if (!transcript.trim()) return res.status(400).json({ error: "No transcript" });

  const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  // save user message containing both fields
  const userMsg = await Message.create({
    conversationId: conv._id,
    userId: req.user.id,
    role: "user",
    content: `Instruction: ${instruction}\n\nTranscript:\n${transcript}`,
    meta: { type: "summarize", instruction }
  });

  // call Gemini
  const summary = await summarizeWithGemini({ transcript, instruction });

  const assistantMsg = await Message.create({
    conversationId: conv._id,
    role: "assistant",
    content: summary,
    meta: { type: "summary" }
  });

  // update title if first message
  if (!conv.title || conv.title === "New chat") {
    const first = instruction.slice(0, 40).trim();
    conv.title = first || "Summary";
  }
  await conv.save();

  res.json({ user: userMsg, assistant: assistantMsg });
});

// edit an assistant message (make the summary editable)
router.put("/messages/:id", async (req, res) => {
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ error: "Not found" });
  // allow editing only your conversation messages
  const conv = await Conversation.findOne({ _id: msg.conversationId, userId: req.user.id });
  if (!conv) return res.status(403).json({ error: "Forbidden" });
  msg.content = req.body.content ?? msg.content;
  await msg.save();
  res.json(msg);
});

// share a specific assistant message via email
router.post("/share", async (req, res) => {
  const { messageId, recipients, subject } = req.body;
  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ error: "Message not found" });
  const conv = await Conversation.findOne({ _id: msg.conversationId, userId: req.user.id });
  if (!conv) return res.status(403).json({ error: "Forbidden" });

  const list = (recipients || []).map(x => String(x).trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ error: "No recipients" });

  const html = `
    <div style="font-family: Inter,Arial; line-height:1.6;">
      <h2>${subject || "Meeting Summary"}</h2>
      <div>${escapeHtml(msg.content).replace(/\n/g, "<br/>")}</div>
      <hr/>
      <small>Shared from AI Notes</small>
    </div>
  `;
  await sendEmail({ to: list.join(","), subject: subject || "Meeting Summary", html });
  res.json({ ok: true, sent: list.length });
});

function escapeHtml(s=""){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")
.replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}

export default router;
