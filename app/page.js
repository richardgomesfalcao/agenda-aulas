"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import Link from "next/link";

export default function Home() {

  const [ocupados, setOcupados] = useState({});
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(null);

  const [modal, setModal] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);

  // 📱 MOBILE (novo)
  const [isMobile, setIsMobile] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState("segunda");

  const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];

  function gerarHorarios() {
    let arr = [];
    for (let h = 7; h <= 21; h++) arr.push(`${h}:00`);
    return arr;
  }

  const horarios = gerarHorarios();

  useEffect(() => {
    const tema = localStorage.getItem("tema");
    if (tema === "light") setDark(false);

    function check() {
      setIsMobile(window.innerWidth < 768);
    }

    check();
    window.addEventListener("resize", check);

    buscar();

    return () => window.removeEventListener("resize", check);
  }, []);

  function toggleTema() {
    const novo = !dark;
    setDark(novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
  }

  async function buscar() {
    const snap = await getDocs(collection(db, "agendamentos"));
    const mapa = {};
    snap.forEach(doc => mapa[doc.id] = doc.data());
    setOcupados(mapa);
  }

  async function confirmarAgendamento() {

    if (!nome || !email) {
      alert("Preencha nome e email");
      return;
    }

    const { dia, horario } = modal;
    const id = `${dia}-${horario}`;

    setLoading(id);

    await setDoc(doc(db, "agendamentos", id), {
      dia,
      horario,
      tipo: "individual",
      aluno: nome,
      email: email,
      criadoEm: new Date()
    });

    setModal(null);
    setNome("");
    setEmail("");
    setLoading(null);
    buscar();
    // 🎉 TOAST
    setToast("Aula agendada com sucesso!");

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const bg = dark ? "#0f172a" : "#f4f6f9";
  const text = dark ? "#fff" : "#111";
  const card = dark ? "#1e293b" : "#fff";

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "15px", color: text }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
      }}>

        <div>
          <h1 style={{ margin: 0 }}>📅 Class Scheduler</h1>
          <p style={{ fontSize: "13px", opacity: 0.7, margin: 0 }}>
            Agende sua aula de forma rápida e simples
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          <Link href="/login" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Área do Professor
            </div>
          </Link>

          <button
            onClick={toggleTema}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: dark
                ? "0 2px 8px rgba(0,0,0,0.5)"
                : "0 2px 6px rgba(0,0,0,0.1)",

              // contraste automático
              background: dark ? "#1e293b" : "#e2e8f0",
              color: dark ? "#facc15" : "#1e293b",

              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {dark ? "☀️" : "🌙"}

          </button>

        </div>
      </div>

      {/* 📱 MOBILE */}
      {isMobile && (
        <div>

          {/* DIAS */}
          <div style={{
            display: "flex",
            gap: "6px",
            marginBottom: "10px",
            overflowX: "auto"
          }}>
            {dias.map(d => (
              <button
                key={d}
                onClick={() => setDiaSelecionado(d)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "20px",
                  border: "none",
                  background: diaSelecionado === d ? "#2563eb" : "#ccc",
                  color: diaSelecionado === d ? "#fff" : "#000",
                  fontWeight: "bold",
                  cursor: "pointer", // 👈 importante
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (diaSelecionado !== d) {
                    e.currentTarget.style.backgroundColor = "#94a3b8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (diaSelecionado !== d) {
                    e.currentTarget.style.backgroundColor = "#ccc";
                  }
                }}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* LISTA */}
          {horarios.map(horario => {
            const id = `${diaSelecionado}-${horario}`;
            const ag = ocupados[id];

            return (
              <div
                key={id}
                style={{
                  background: card,
                  marginBottom: "8px",
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <strong>{horario}</strong>

                {!ag && (
                  <button
                    onClick={() => setModal({ dia: diaSelecionado, horario })}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#22c55e";
                    }}
                  >
                    Agendar
                  </button>
                )}

                {ag && (
                  <div style={{
                    background: "#ef4444",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "6px"
                  }}>
                    Indisponível
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 💻 DESKTOP (SEU ORIGINAL) */}
      {!isMobile && (
        <div style={{ background: card, borderRadius: "10px", marginTop: "10px" }}>

          <div style={{
            display: "grid",
            gridTemplateColumns: "80px repeat(5,1fr)",
            background: "#2f3e4d",
            color: "#fff"
          }}>
            <div style={{ textAlign: "center", padding: "10px" }}>Hora</div>
            {["Seg", "Ter", "Qua", "Qui", "Sex"].map(d => (
              <div key={d} style={{ textAlign: "center", padding: "10px" }}>{d}</div>
            ))}
          </div>

          {horarios.map(horario => (
            <div key={horario} style={{ display: "grid", gridTemplateColumns: "80px repeat(5,1fr)" }}>

              <div style={{ textAlign: "center", padding: "10px", fontWeight: "bold" }}>
                {horario}
              </div>

              {dias.map(dia => {
                const id = `${dia}-${horario}`;
                const ag = ocupados[id];

                return (
                  <div key={id} style={{ border: "1px solid #eee", padding: "6px" }}>

                    {!ag && (
                      <button
                        onClick={() => setModal({ dia, horario })}
                        style={{
                          width: "100%",
                          background: "#22c55e",
                          color: "#fff",
                          border: "none",
                          padding: "6px",
                          borderRadius: "6px"
                        }}
                      >
                        Disponível
                      </button>
                    )}

                    {ag && (
                      <div style={{
                        background: "#ef4444",
                        color: "#fff",
                        padding: "6px",
                        borderRadius: "6px",
                        textAlign: "center"
                      }}>
                        Indisponível
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "300px",
            color: "#111"
          }}>
            <h3>Agendar aula</h3>

            <p style={{ fontWeight: "bold" }}>
              {modal.dia.charAt(0).toUpperCase() + modal.dia.slice(1)} - {modal.horario}
            </p>

            <input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
            />

            <input
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <button
              onClick={confirmarAgendamento}
              disabled={loading}
              style={{
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                padding: "8px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Agendando..." : "Confirmar"}
            </button>

            <button
              onClick={() => setModal(null)}
              style={{ marginTop: "5px", width: "100%" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#22c55e",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          fontWeight: "bold",
          zIndex: 999
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}