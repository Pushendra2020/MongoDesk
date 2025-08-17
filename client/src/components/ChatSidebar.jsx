import React, { useEffect, useState } from "react";
import { createConversation, listConversations } from "../lib/api";

export default function ChatSidebar({ activeId, onSelect }) {
  const [convs, setConvs] = useState([]);

  async function load() {
    setConvs(await listConversations());
  }
  useEffect(() => { load(); }, []);

  async function onNew() {
    const conv = await createConversation("New chat");
    setConvs([conv, ...convs]);
    onSelect(conv._id);
  }

  return (
    <aside className="w-64 bg-gray-100 border-r h-screen p-3 flex flex-col">
      <button onClick={onNew} className="mb-3 px-3 py-2 rounded bg-black text-white">+ New chat</button>
      <div className="overflow-auto space-y-1">
        {convs.map(c => (
          <button key={c._id}
            onClick={() => onSelect(c._id)}
            className={`w-full text-left px-3 py-2 rounded ${activeId===c._id ? "bg-white shadow" : "hover:bg-white"}`}>
            <div className="text-sm font-medium truncate">{c.title}</div>
            <div className="text-xs text-gray-500">{new Date(c.updatedAt).toLocaleString()}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
