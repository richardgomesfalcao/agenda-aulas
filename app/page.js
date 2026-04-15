"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import emailjs from "emailjs-com";
import Link from "next/link";

export default function Home() {

  const [ocupados, setOcupados] = useState({});
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(null);

  const [modal, setModal] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

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
    buscar();
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

    // 📧 EMAILJS
    // 🔒 EmailJS removido do front por segurança
    // Pode ser implementado via backend em produção

    setModal(null);
    setNome("");
    setEmail("");
    setLoading(null);
    buscar();
  }

  const bg = dark ? "#0f172a" : "#f4f6f9";
  const text = dark ? "#fff" : "#111";
  const card = dark ? "#1e293b" : "#fff";

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "15px", color: text }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>📅 Agenda de Aulas Online</h1>

        <div style={{ display: "flex", gap: "10px" }}>
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
                display: "inline-block"
              }}
            >
              Área do Professor
            </div>
          </Link>

          <button onClick={toggleTema}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* GRID */}
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
                      }}>
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
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
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
              style={{
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                padding: "8px",
                border: "none",
                borderRadius: "6px"
              }}>
              Confirmar
            </button>

            <button
              onClick={() => setModal(null)}
              style={{ marginTop: "5px", width: "100%" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}