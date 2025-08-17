import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Auth
export const register = (payload) => api.post("/auth/register", payload).then(r => r.data);
export const login = (payload) => api.post("/auth/login", payload).then(r => r.data);

// Chat
export const listConversations = () => api.get("/chat/conversations").then(r => r.data);
export const createConversation = (title) => api.post("/chat/conversations", { title }).then(r => r.data);
export const getMessages = (id) => api.get(`/chat/conversations/${id}/messages`).then(r => r.data);
export const summarize = (id, { instruction, transcript, file }) => {
  const fd = new FormData();
  fd.append("instruction", instruction || "");
  if (file) fd.append("file", file);
  if (transcript) fd.append("transcript", transcript);
  return api.post(`/chat/conversations/${id}/summarize`, fd).then(r => r.data);
};
export const editMessage = (id, content) => api.put(`/chat/messages/${id}`, { content }).then(r => r.data);
export const shareMessage = (messageId, recipients, subject) =>
  api.post("/chat/share", { messageId, recipients, subject }).then(r => r.data);
