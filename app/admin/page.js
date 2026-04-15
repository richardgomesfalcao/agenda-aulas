"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Admin() {

  const [agendamentos, setAgendamentos] = useState({});
  const [modal, setModal] = useState(null);
  const [tipo, setTipo] = useState("turma");
  const [nomes, setNomes] = useState("");

  const router = useRouter();

  const dias = ["segunda","terca","quarta","quinta","sexta"];

  function gerarHorarios() {
    let arr = [];
    for (let h = 7; h <= 21; h++) arr.push(`${h}:00`);
    return arr;
  }

  const horarios = gerarHorarios();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else buscar();
    });
    return () => unsub();
  }, []);

  async function buscar() {
    const snap = await getDocs(collection(db, "agendamentos"));
    const mapa = {};
    snap.forEach(doc => mapa[doc.id] = doc.data());
    setAgendamentos(mapa);
  }

  async function salvar() {
    const { dia, horario } = modal;
    const id = `${dia}-${horario}`;

    let data = {
      dia,
      horario,
      tipo,
      criadoEm: new Date()
    };

    if (tipo === "turma") {
      data.alunos = nomes.split(",").map(n => n.trim()).filter(Boolean);
    }

    if (tipo === "individual") {
      data.aluno = nomes;
    }

    if (tipo === "outros") {
      data.motivo = nomes;
    }

    await setDoc(doc(db,"agendamentos",id), data);

    setModal(null);
    setNomes("");
    buscar();
  }

  async function excluir(id){
    await deleteDoc(doc(db,"agendamentos",id));
    buscar();
  }

  async function logout(){
    await signOut(auth);
  }

  return (
    <div style={{ background:"#f4f6f9", minHeight:"100vh", padding:"15px" }}>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1 style={{ color:"#111", fontWeight:"bold" }}>
          📊 Painel Admin
        </h1>

        <button onClick={logout}
          style={{ background:"#ef4444", color:"#fff", border:"none", padding:"6px 10px", borderRadius:"6px" }}>
          Sair
        </button>
      </div>

      {/* GRID */}
      <div style={{ background:"#fff", borderRadius:"10px", marginTop:"10px", overflow:"hidden" }}>

        {/* HEADER */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"80px repeat(5,1fr)",
          background:"#2f3e4d",
          color:"#fff",
          fontWeight:"bold"
        }}>
          <div style={{ textAlign:"center", padding:"10px" }}>Hora</div>
          {["Seg","Ter","Qua","Qui","Sex"].map(d=>(
            <div key={d} style={{ textAlign:"center", padding:"10px" }}>{d}</div>
          ))}
        </div>

        {/* LINHAS */}
        {horarios.map(horario=>(
          <div key={horario} style={{ display:"grid", gridTemplateColumns:"80px repeat(5,1fr)" }}>

            {/* HORA */}
            <div style={{
              textAlign:"center",
              padding:"10px",
              fontWeight:"bold",
              color:"#111"
            }}>
              {horario}
            </div>

            {dias.map(dia=>{
              const id = `${dia}-${horario}`;
              const ag = agendamentos[id];

              return (
                <div key={id} style={{ border:"1px solid #eee", padding:"6px" }}>

                  {/* LIVRE */}
                  {!ag && (
                    <button
                      onClick={()=>setModal({dia,horario})}
                      style={{
                        width:"100%",
                        background:"#2563eb",
                        color:"#fff",
                        border:"none",
                        padding:"6px",
                        borderRadius:"6px",
                        cursor:"pointer"
                      }}>
                      Separar horário
                    </button>
                  )}

                  {/* OCUPADO */}
                  {ag && (
                    <div style={{
                      background: ag.tipo === "outros" ? "#111" : "#ef4444",
                      color:"#fff",
                      padding:"6px",
                      borderRadius:"6px",
                      fontSize:"12px"
                    }}>

                      {/* TIPO */}
                      <div style={{ fontWeight:"bold", marginBottom:"4px" }}>
                        {ag.tipo === "turma" && "👥 Turma"}
                        {ag.tipo === "individual" && "👤 Individual"}
                        {ag.tipo === "outros" && "🚫 Indisponível"}
                      </div>

                      {/* DADOS */}
                      {ag.aluno && <div>{ag.aluno}</div>}

                      {ag.alunos?.map((n,i)=>(
                        <div key={i}>• {n}</div>
                      ))}

                      {ag.motivo && <div>{ag.motivo}</div>}

                      {/* AÇÕES */}
                      <div style={{ marginTop:"5px", display:"flex", gap:"5px" }}>
                        <button
                          onClick={()=>setModal({dia,horario})}
                          style={{
                            flex:1,
                            background:"#fff",
                            color:"#000",
                            border:"none",
                            borderRadius:"4px",
                            cursor:"pointer"
                          }}>
                          Editar
                        </button>

                        <button
                          onClick={()=>excluir(id)}
                          style={{
                            flex:1,
                            background:"#000",
                            color:"#fff",
                            border:"none",
                            borderRadius:"4px",
                            cursor:"pointer"
                          }}>
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

      {/* MODAL */}
      {modal && (
        <div style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,0.4)",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{
            background:"#fff",
            padding:"20px",
            borderRadius:"10px",
            width:"300px"
          }}>
            <h3 style={{ marginBottom:"10px", color:"#111" }}>
              Editar horário
            </h3>

            <select value={tipo} onChange={(e)=>setTipo(e.target.value)} style={{ width:"100%", marginBottom:"10px" }}>
              <option value="turma">Turma</option>
              <option value="individual">Individual</option>
              <option value="outros">Indisponível</option>
            </select>

            <input
              placeholder="Nome(s) ou motivo"
              value={nomes}
              onChange={(e)=>setNomes(e.target.value)}
              style={{ width:"100%", marginBottom:"10px" }}
            />

            <button onClick={salvar}
              style={{ width:"100%", background:"#2563eb", color:"#fff", border:"none", padding:"8px", borderRadius:"6px" }}>
              Salvar
            </button>

            <button onClick={()=>setModal(null)}
              style={{ marginTop:"5px", width:"100%" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}