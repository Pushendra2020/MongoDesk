import React, { useEffect, useRef, useState } from "react";

/**
 * ChatBox
 * Props:
 * - messages: array of { role: "user"|"assistant"|"system", content: string, _id?: string } OR array of strings
 * - onSend?: function(text)  // if provided, an input box appears and will call onSend
 * - initialDark?: boolean
 */
export default function ChatBox({ messages = [], onSend, initialDark = false }) {
  const [dark, setDark] = useState(Boolean(initialDark));
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Remove short casual greetings from the top of AI responses
  function stripLeadingGreeting(text = "") {
    const lines = text.replace(/\r/g, "").split("\n");
    if (lines.length === 0) return text;
    const first = lines[0].trim();
    // patterns to strip: "hi", "hii", "hello", "hey", possibly wrapped in ** or punctuation
    if (/^\**\s*(hi|hii|hello|hey|hiya)[\.,!?\s]*\**$/i.test(first) && lines.length > 1) {
      return lines.slice(1).join("\n").trim();
    }
    return text;
  }

  // Escape HTML to avoid XSS
  function escapeHtml(s = "") {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Minimal safe markdown-ish -> HTML (handles code fences, **bold**, *italics*, bullets)
  function formatToHtml(original = "") {
    if (!original) return "";
    // Extract code blocks first to avoid mangling
    const codeBlocks = [];
    let text = original.replace(/```([\s\S]*?)```/g, (_, inner) => {
      codeBlocks.push(inner);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    // Escape the rest
    text = escapeHtml(text);

    // Bold, italics (safe because we've escaped)
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Simple list conversion for contiguous lines beginning with "- "
    text = text.replace(/(?:^|\n)(- .*(?:\n- .*)*)/g, (m, group) => {
      const items = group.split("\n").map(l => l.replace(/^- /, "").trim());
      return "\n" + "<ul>" + items.map(i => `<li>${i}</li>`).join("") + "</ul>";
    });

    // Restore code blocks (escape their content again)
    text = text.replace(/__CODEBLOCK_(\d+)__/g, (_, idx) => {
      const code = codeBlocks[Number(idx)] ?? "";
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    });

    // Newlines -> <br/>
    text = text.replace(/\n/g, "<br/>");
    return text;
  }

  // Helper to render message content (handles string or object)
  function renderContent(raw) {
    if (raw == null) return "";
    const content = typeof raw === "string" ? raw : raw.content || "";
    const cleaned = stripLeadingGreeting(content.trim());
    return formatToHtml(cleaned);
  }

  // send handler (used only if component shows its own input)
  function handleSend(e) {
    e?.preventDefault();
    if (!onSend) return;
    const text = (input || "").trim();
    if (!text) return;
    try {
      onSend(text);
    } catch (err) {
      // swallow errors from parent handler
      console.error("onSend error:", err);
    }
    setInput("");
  }

  // Helpers: determine role safely
  function getRole(item) {
    if (typeof item === "string") return "assistant";
    if (item.role) return item.role;
    if (item.userId || item.user) return "user";
    return "assistant";
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className={`flex flex-col h-full min-h-screen ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-gray-700" : "border-gray-200"} bg-transparent`}>
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">AI Meeting Assistant</div>
            <div className="text-sm text-gray-500 hidden md:block">Summarize transcripts • Answer questions</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
              aria-label="Toggle dark mode"
            >
              {dark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4" aria-live="polite">
          {Array.isArray(messages) && messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400">No messages yet — ask anything or upload a transcript.</div>
          )}

          {messages.map((m, i) => {
            const role = getRole(m);
            const html = renderContent(m);
            const key = (m && m._id) || i;
            const isUser = role === "user";
            return (
              <div key={key} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-3xl w-full break-words whitespace-pre-wrap p-3 rounded-lg shadow-sm
                    ${isUser ? "bg-blue-600 text-white ml-auto" : dark ? "bg-gray-800 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}
                  style={{ wordBreak: "break-word" }}
                >
                  {/* using dangerouslySetInnerHTML after safe-formatting above */}
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            );
          })}

          <div ref={endRef} />
        </div>

        {/* Optional inline input (shows only if onSend prop exists) */}
        {onSend && (
          <form className={`p-4 border-t ${dark ? "border-gray-700" : "border-gray-200"} bg-transparent`} onSubmit={handleSend}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question, or type a command (e.g., 'Summarize the uploaded transcript')"
                className={`flex-1 rounded px-3 py-2 outline-none ${dark ? "bg-gray-800 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}
                aria-label="Message input"
              />
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Send</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}