"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  const router = useRouter();

  // 🧠 lembrar usuário
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const tema = localStorage.getItem("tema");

    if (savedEmail) setEmail(savedEmail);
    if (tema === "light") setDark(false);
  }, []);

  function toggleTema() {
    const novo = !dark;
    setDark(novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
  }

  async function login() {
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);

      localStorage.setItem("email", email);

      // 🔒 animação leve antes de entrar
      setTimeout(() => {
        router.push("/admin");
      }, 500);

    } catch (err) {
      alert("Erro ao fazer login");
      setLoading(false);
    }
  }

  const bg = dark
    ? "linear-gradient(135deg, #0f172a, #1e293b)"
    : "#f4f6f9";

  const card = dark ? "#1e293b" : "#fff";
  const text = dark ? "#fff" : "#111";
  const inputBg = dark ? "#334155" : "#f1f5f9";

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: bg
    }}>

      {/* 🌙 botão tema */}
      <button
        onClick={toggleTema}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "6px 10px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer"
        }}
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* CARD */}
      <div style={{
        background: card,
        padding: "30px",
        borderRadius: "12px",
        width: "320px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        color: text,
        transition: "0.3s"
      }}>

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          🔐 Login Administrativo
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "none",
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
            onChange={(e)=>setSenha(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: inputBg,
              color: text
            }}
          />

          <span
            onClick={()=>setMostrarSenha(!mostrarSenha)}
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              cursor: "pointer"
            }}
          >
            👁️
          </span>
        </div>

        {/* BOTÃO */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* DEMO DISCRETO */}
        <p style={{
          marginTop: "15px",
          fontSize: "12px",
          opacity: 0.7,
          textAlign: "center"
        }}>
          Demo: teste@agenda.com / 123456
        </p>

      </div>

    </div>
  );
}