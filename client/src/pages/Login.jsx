import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-96 space-y-3">
        <h1 className="text-xl font-bold">Log in</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="w-full border rounded p-2" placeholder="Email"
          value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded p-2" placeholder="Password"
          value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full py-2 bg-black text-white rounded">Login</button>
        <div className="text-sm text-center">No account? <Link className="underline" to="/register">Register</Link></div>
      </form>
    </div>
  );
}
