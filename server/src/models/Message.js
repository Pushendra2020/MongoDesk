import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for user messages
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  meta: { type: Object, default: {} } // e.g., {type:"summary", prompt, transcript}
}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);
