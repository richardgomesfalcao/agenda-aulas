"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Admin() {

    const [agendamentos, setAgendamentos] = useState({});
    const [modal, setModal] = useState(null);
    const [tipo, setTipo] = useState("turma");
    const [nomes, setNomes] = useState("");
    const [dark, setDark] = useState(true);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [isMobile, setIsMobile] = useState(false);
    const [diaSelecionado, setDiaSelecionado] = useState("segunda");

    const router = useRouter();

    const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const horarios = Array.from({ length: 15 }, (_, i) => `${7 + i}:00`);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);

        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) router.push("/login");
            else buscar();
        });

        return () => {
            window.removeEventListener("resize", check);
            unsub();
        };
    }, []);

    function toggleTema() {
        setDark(!dark);
    }

    async function buscar() {
        const snap = await getDocs(collection(db, "agendamentos"));
        const mapa = {};
        snap.forEach(doc => mapa[doc.id] = doc.data());
        setAgendamentos(mapa);
    }

    async function salvar() {
        setLoading(true);

        const { dia, horario } = modal;
        const id = `${dia}-${horario}`;

        let data = { dia, horario, tipo };

        if (tipo === "turma") {
            data.alunos = nomes.split(",").map(n => n.trim());
        }

        if (tipo === "individual") data.aluno = nomes;
        if (tipo === "outros") data.motivo = nomes;

        await setDoc(doc(db, "agendamentos", id), data);

        setModal(null);
        setNomes("");
        buscar();

        setLoading(false);
    }

    async function excluir(id) {
        await deleteDoc(doc(db, "agendamentos", id));
        buscar();
    }

    async function logout() {
        await signOut(auth);
    }

    const bg = dark ? "#0f172a" : "#f4f6f9";
    const card = dark ? "#1e293b" : "#fff";
    const text = dark ? "#fff" : "#111";

    return (
        <div style={{ background: bg, color: text, minHeight: "100vh", padding: "15px" }}>

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>📊 Painel do Professor</h1>
                    <p style={{ opacity: 0.7 }}>Gerencie sua agenda de aulas</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>

                    {/* TEMA */}
                    <button
                        onClick={toggleTema}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: "none",
                            cursor: "pointer",
                            background: dark ? "#1e293b" : "#e2e8f0",
                            color: dark ? "#facc15" : "#111",
                            fontSize: "18px",
                            transition: "0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        {dark ? "☀️" : "🌙"}
                    </button>

                    {/* SAIR */}
                    <button onClick={logout} style={{
                        background: "#ef4444",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        color: "#fff",
                        cursor: "pointer"
                    }}>
                        Sair
                    </button>

                </div>
            </div>

            {/* ================= MOBILE ================= */}
            {isMobile && (
                <>
                    <div style={{ display: "flex", gap: "6px", margin: "10px 0" }}>
                        {dias.map(d => (
                            <button
                                key={d}
                                onClick={() => setDiaSelecionado(d)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "20px",
                                    border: "none",
                                    background: diaSelecionado === d ? "#2563eb" : "#444",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    if (diaSelecionado !== d) {
                                        e.currentTarget.style.background = "#555";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (diaSelecionado !== d) {
                                        e.currentTarget.style.background = "#444";
                                        e.currentTarget.style.transform = "scale(1)";
                                    }
                                }}
                            >
                                {d.slice(0, 3)}
                            </button>
                        ))}
                    </div>

                    {horarios.map(horario => {
                        const id = `${diaSelecionado}-${horario}`;
                        const ag = agendamentos[id];

                        return (
                            <div key={id} style={{
                                background: card,
                                padding: "12px",
                                marginBottom: "10px",
                                borderRadius: "10px"
                            }}>
                                <strong>{horario}</strong>

                                {!ag && (
                                    <button
                                        onClick={() => setModal({ dia: diaSelecionado, horario })}
                                        style={{
                                            width: "100%",
                                            marginTop: "8px",
                                            padding: "10px",
                                            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            transition: "0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.03)";
                                            e.currentTarget.style.filter = "brightness(1.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.filter = "brightness(1)";
                                        }}
                                    >
                                        Separar horário
                                    </button>
                                )}

                                {ag && (
                                    <div style={{
                                        marginTop: "8px",
                                        background: "#dc2626",
                                        padding: "10px",
                                        borderRadius: "8px"
                                    }}>
                                        <strong>{ag.tipo}</strong>
                                        <div>{ag.aluno || ag.motivo}</div>

                                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>

                                            <button
                                                onClick={() => {
                                                    setModal({ dia: diaSelecionado, horario });
                                                    setTipo(ag.tipo);
                                                    setNomes(
                                                        ag.aluno ||
                                                        ag.alunos?.join(", ") ||
                                                        ag.motivo ||
                                                        ""
                                                    );
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: "#ffffff",
                                                    color: "#111",
                                                    border: "none",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    transition: "0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#e5e7eb";
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "#ffffff";
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => setConfirmDelete(id)}
                                                style={{
                                                    flex: 1,
                                                    background: "#111",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    transition: "0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#333";
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "#111";
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                            >
                                                Excluir
                                            </button>

                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            )}

            {/* ================= DESKTOP GRID ================= */}
            {!isMobile && (
                <div style={{ marginTop: "20px" }}>

                    {/* HEADER GRID */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "80px repeat(5,1fr)",
                        background: "#334155",
                        padding: "10px",
                        borderRadius: "10px 10px 0 0"
                    }}>
                        <div>Hora</div>
                        <div>Seg</div>
                        <div>Ter</div>
                        <div>Qua</div>
                        <div>Qui</div>
                        <div>Sex</div>
                    </div>

                    {horarios.map(horario => (
                        <div key={horario} style={{
                            display: "grid",
                            gridTemplateColumns: "80px repeat(5,1fr)"
                        }}>

                            <div style={{ padding: "10px" }}>{horario}</div>

                            {dias.map(dia => {
                                const id = `${dia}-${horario}`;
                                const ag = agendamentos[id];

                                return (
                                    <div key={id} style={{
                                        padding: "6px",
                                        border: "1px solid #334155"
                                    }}>

                                        {!ag && (
                                            <button
                                                onClick={() => setModal({ dia, horario })} //
                                                style={{
                                                    width: "100%",
                                                    marginTop: "8px",
                                                    padding: "10px",
                                                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    transition: "0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.03)";
                                                    e.currentTarget.style.filter = "brightness(1.1)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                    e.currentTarget.style.filter = "brightness(1)";
                                                }}
                                            >
                                                Separar horário
                                            </button>
                                        )}

                                        {ag && (
                                            <div style={{
                                                background: "#dc2626",
                                                padding: "6px",
                                                borderRadius: "6px"
                                            }}>
                                                <strong>{ag.tipo}</strong>
                                                <div>{ag.aluno || ag.motivo}</div>

                                                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>

                                                    <button
                                                        onClick={() => {
                                                            setModal({ dia, horario });
                                                            setTipo(ag.tipo);
                                                            setNomes(
                                                                ag.aluno ||
                                                                ag.alunos?.join(", ") ||
                                                                ag.motivo ||
                                                                ""
                                                            );
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            background: "#ffffff",
                                                            color: "#111",
                                                            border: "none",
                                                            padding: "6px",
                                                            borderRadius: "6px",
                                                            fontWeight: "bold",
                                                            cursor: "pointer",
                                                            transition: "0.2s"
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        onClick={() => setConfirmDelete(`${dia}-${horario}`)}
                                                        style={{
                                                            flex: 1,
                                                            background: "#111",
                                                            color: "#fff",
                                                            border: "none",
                                                            padding: "6px",
                                                            borderRadius: "6px",
                                                            fontWeight: "bold",
                                                            cursor: "pointer",
                                                            transition: "0.2s"
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = "#333"}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "#111"}
                                                    >
                                                        Excluir
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    ))}

                </div>
            )}

            {/* MODAL BONITO */}
            {modal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 999
                }}>
                    <div style={{
                        background: dark ? "#1e293b" : "#fff",
                        color: dark ? "#fff" : "#111",
                        padding: "20px",
                        borderRadius: "12px",
                        width: "320px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        <h3 style={{ margin: 0 }}>
                            {modal.dia} - {modal.horario}
                        </h3>

                        <select
                            value={tipo}
                            onChange={e => setTipo(e.target.value)}
                            style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #ccc"
                            }}
                        >
                            <option value="turma">Turma</option>
                            <option value="individual">Individual</option>
                            <option value="outros">Indisponível</option>
                        </select>

                        <input
                            value={nomes}
                            onChange={e => setNomes(e.target.value)}
                            placeholder="Nome(s)"
                            style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #ccc"
                            }}
                        />

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={salvar}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: loading ? "#93c5fd" : "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? "Salvando..." : "Salvar"}
                            </button>

                            <button
                                onClick={() => setModal(null)}
                                style={{
                                    flex: 1,
                                    background: "#696969ff",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmDelete && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 999
                }}>
                    <div style={{
                        background: "#0f172a",
                        padding: "20px",
                        borderRadius: "12px",
                        width: "300px",
                        textAlign: "center",
                        color: "#111"
                    }}>
                        <h3 style={{ fontSize: "18px", opacity: 0.7, color: "#fff" }}>Excluir horário?</h3>
                        <p style={{ fontSize: "14px", opacity: 0.7, color: "#fff", }}>
                            Essa ação não pode ser desfeita.
                        </p>

                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <button
                                onClick={() => {
                                    excluir(confirmDelete);
                                    setConfirmDelete(null);
                                }}
                                style={{
                                    flex: 1,
                                    background: "#dc2626",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}
                            >
                                Excluir
                            </button>

                            <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                    flex: 1,
                                    background: "#727272ff",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}