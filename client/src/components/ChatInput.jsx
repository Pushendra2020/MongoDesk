import React, { useState } from "react";
export default function ChatInput({ onSend, loading }) {
  const [instruction, setInstruction] = useState("");
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState(null);

  function submit(e) {
    e.preventDefault();
    onSend({ instruction, transcript, file });
  }

  return (
    <form onSubmit={submit} className="border-t bg-white p-3">
      <div className="flex gap-2">
        <input className="flex-1 border rounded p-2"
          value={instruction} onChange={(e)=>setInstruction(e.target.value)}
          placeholder="Instruction (e.g., highlight action items)" />
        <input type="file" accept=".txt" onChange={(e)=>setFile(e.target.files?.[0]||null)}
          className="text-sm" />
      </div>
      <textarea
        className="w-full border rounded p-2 mt-2"
        rows={6}
        value={transcript}
        onChange={(e)=>setTranscript(e.target.value)}
        placeholder="Paste transcript (or upload .txt)" />
      <button disabled={loading} className="mt-2 px-4 py-2 rounded bg-black text-white disabled:opacity-60">
        {loading ? "Generating..." : "Generate Summary"}
      </button>
    </form>
  );
}
