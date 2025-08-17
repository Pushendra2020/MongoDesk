import React, { useEffect, useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput"; // Make sure ChatInput is imported
import { useAuth } from "../context/AuthContext";
import { editMessage, getMessages, shareMessage, summarize } from "../lib/api";

export default function Chat() {
  const { user, logout } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [edited, setEdited] = useState("");
  const [toast, setToast] = useState("");

  function showToast(t){ setToast(t); setTimeout(()=>setToast(""), 2500); }

  useEffect(() => {
    setMessages([]);
    if(!activeId) return;
    (async()=>setMessages(await getMessages(activeId)))();
  }, [activeId]);

  // Updated onSend to handle instruction, transcript, and file
  async function onSend({ instruction, transcript, file }) {
    if (!activeId) return showToast("Select or create a chat from left.");
    if (!instruction && !transcript && !file) {
      return showToast("Please provide an instruction, transcript, or file.");
    }
    setLoading(true);
    try {
      const data = await summarize(activeId, { instruction, transcript, file });
      setMessages((m) => [...m, data.user, data.assistant]);
      showToast("Summary generated.");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(msg){
    setEditId(msg._id); setEdited(msg.content);
  }
  async function saveEdit(){
    const updated = await editMessage(editId, edited);
    setMessages((ms)=> ms.map(m => m._id===updated._id ? updated : m));
    setEditId(null); showToast("Saved.");
  }
  async function share(msg){
    const recipients = prompt("Enter recipient emails (comma-separated):","");
    if(!recipients) return;
    await shareMessage(msg._id, recipients.split(",").map(s=>s.trim()), "Meeting Summary");
    showToast("Email sent.");
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar activeId={activeId} onSelect={setActiveId} />
      <main className="flex-1 flex flex-col">
        <header className="h-12 border-b bg-white px-4 flex items-center justify-between">
          <div className="font-semibold">AI Notes</div>
          <div className="text-sm">Logged in as {user?.email} <button className="ml-3 underline" onClick={logout}>Logout</button></div>
        </header>

        <div className="flex-1 overflow-auto p-4">
          {messages.map(m => (
            <div key={m._id}>
              <MessageBubble
                role={m.role}
                content={editId===m._id ? edited : m.content}
                editable={editId===m._id && m.role==="assistant"}
                onChange={setEdited}
              />
              {m.role==="assistant" && (
                <div className="flex gap-2 mb-4">
                  {editId!==m._id
                    ? <button className="text-xs px-2 py-1 border rounded" onClick={()=>startEdit(m)}>Edit</button>
                    : <button className="text-xs px-2 py-1 border rounded" onClick={saveEdit}>Save</button>}
                  <button className="text-xs px-2 py-1 border rounded" onClick={()=>share(m)}>Share</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Use ChatInput component here */}
        <ChatInput onSend={onSend} loading={loading} />
        {toast && <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded">{toast}</div>}
      </main>
    </div>
  );
}