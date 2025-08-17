import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema(
  {
    transcript: { type: String, required: true },
    prompt: { type: String, required: true },
    summary: { type: String, required: true },
    recipients: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Summary", SummarySchema);
