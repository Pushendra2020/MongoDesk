import React from "react";

export default function MessageBubble({ role, content, editable, onChange }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div className={`max-w-3xl w-full rounded-lg p-3 whitespace-pre-wrap ${isUser ? "bg-gray-200" : "bg-white border"}`}>
        {!editable ? (
          <div className="text-sm">{content}</div>
        ) : (
          <textarea
            className="w-full text-sm outline-none bg-transparent"
            rows={10}
            value={content}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
