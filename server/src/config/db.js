import mongoose from "mongoose";

export async function connectDB(uri) {
  await mongoose.connect(uri, { dbName: "ai-notes" });
  console.log("MongoDB connected");
}