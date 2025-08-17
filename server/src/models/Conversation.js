import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, default: "New chat" }
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
