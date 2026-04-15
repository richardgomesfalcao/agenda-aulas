"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [dark, setDark] = useState(true);

  const router = useRouter();

  // 🧠 carregar preferências
  useEffect(() => {
    const tema = localStorage.getItem("tema");
    const emailSalvo = localStorage.getItem("email");

    if (tema === "light") setDark(false);
    if (emailSalvo) setEmail(emailSalvo);
  }, []);

  // 🔄 alternar tema
  function toggleTema() {
    const novo = !dark;
    setDark(novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
  }

  async function login() {
    setErro("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);

      localStorage.setItem("email", email);

      setAnimando(true);

      setTimeout(() => {
        router.push("/admin");
      }, 700);

    } catch (e) {
      setErro("Email ou senha inválidos");
      setLoading(false);
    }
  }

  // 🎨 cores dinâmicas
  const bg = dark
    ? "linear-gradient(135deg, #1e293b, #0f172a)"
    : "linear-gradient(135deg, #e2e8f0, #cbd5f5)";

  const cardBg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#f9fafb" : "#111827";
  const inputBg = dark ? "#1f2937" : "#fff";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: bg,
        padding: "15px"
      }}
    >
      {/* 🌙 BOTÃO TEMA */}
      <button
        onClick={toggleTema}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* CARD */}
      <div
        style={{
          background: cardBg,
          padding: "30px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "350px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          transform: animando ? "scale(0.95)" : "scale(1)",
          opacity: animando ? 0.5 : 1,
          transition: "0.4s"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: text
          }}
        >
          🔐 Login Admin
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: inputBg,
            color: text
          }}
        />

        {/* SENHA */}
        <div style={{ position: "relative" }}>
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: inputBg,
              color: text
            }}
          />

          <span
            onClick={() => setMostrarSenha(!mostrarSenha)}
            style={{
              position: "absolute",
              right: "10px",
              top: "12px",
              cursor: "pointer"
            }}
          >
            {mostrarSenha ? "🙈" : "👁️"}
          </span>
        </div>

        {/* ERRO */}
        {erro && (
          <div
            style={{
              color: "#ef4444",
              marginBottom: "10px",
              fontSize: "13px",
              textAlign: "center"
            }}
          >
            {erro}
          </div>
        )}

        {/* BOTÃO */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#93c5fd" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}