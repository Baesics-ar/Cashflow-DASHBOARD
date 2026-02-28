import { useState } from "react";
import { useData } from "./hooks/useData.js";
import { Spinner, ErrorBanner } from "./components/UI.jsx";
import { fmt, getSemaforo, SEMAFORO_COLORS } from "./lib/utils.js";
import TxModal from "./components/TxModal.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import MovimientosPage from "./pages/MovimientosPage.jsx";
import ObligacionesPage from "./pages/ObligacionesPage.jsx";
import FondosPage from "./pages/FondosPage.jsx";
import AnalisisPage from "./pages/AnalisisPage.jsx";
import CuentasPage from "./pages/CuentasPage.jsx";

const NAV = [
  { id: "dashboard",    label: "Dashboard",      icon: "⬡" },
  { id: "movimientos",  label: "Movimientos",     icon: "≡" },
  { id: "obligaciones", label: "Obligaciones",    icon: "◈" },
  { id: "fondos",       label: "Fondos & Cobros", icon: "◉" },
  { id: "analisis",     label: "Análisis",        icon: "◫" },
  { id: "cuentas",      label: "Cuentas",         icon: "◎" },
];

export default function App() {
  const data = useData();
  const [view, setView] = useState("dashboard");
  const [showGlobalAdd, setShowGlobalAdd] = useState(false);

  const { transactions, loading, error, reload, cuentas, addTransaction } = data;

  const saldo = transactions.reduce((a, t) => a + parseFloat(t.monto || 0), 0);
  const semaforo = getSemaforo(saldo);

  return (
    <div style={{ minHeight: "100vh", background: "#060a10", color: "#f8fafc", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex" }}>

      {/* SIDEBAR */}
      <div style={{ width: 230, background: "#080d14", borderRight: "1px solid #1a2236", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>Gestión</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" }}>CashFlow</div>
        </div>

        {NAV.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            background: view === v.id ? "#111827" : "transparent",
            border: view === v.id ? "1px solid #1e293b" : "1px solid transparent",
            color: view === v.id ? "#f8fafc" : "#64748b",
            padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
            fontSize: 13, fontWeight: view === v.id ? 600 : 400, transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 10, width: "100%"
          }}
            onMouseEnter={e => { if (view !== v.id) e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (view !== v.id) e.currentTarget.style.color = "#64748b"; }}
          >
            <span style={{ fontSize: 14, opacity: 0.6 }}>{v.icon}</span>
            {v.label}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: "16px 0", borderTop: "1px solid #1a2236" }}>
          <div style={{ fontSize: 11, color: "#334155", marginBottom: 6 }}>Semáforo</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SEMAFORO_COLORS[semaforo], boxShadow: `0 0 8px ${SEMAFORO_COLORS[semaforo]}` }} />
            <span style={{ fontSize: 12, color: SEMAFORO_COLORS[semaforo], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{semaforo}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono',monospace" }}>
            {loading ? "—" : fmt(saldo)}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto", minHeight: "100vh" }}>
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading ? <Spinner /> : (
          <>
            {view === "dashboard"    && <DashboardPage    data={data} onAdd={() => setShowGlobalAdd(true)} />}
            {view === "movimientos"  && <MovimientosPage  data={data} />}
            {view === "obligaciones" && <ObligacionesPage data={data} />}
            {view === "fondos"       && <FondosPage       data={data} />}
            {view === "analisis"     && <AnalisisPage     data={data} />}
            {view === "cuentas"      && <CuentasPage      data={data} />}
          </>
        )}
      </div>

      {showGlobalAdd && (
        <TxModal
          tx={null}
          cuentas={cuentas}
          onSave={addTransaction}
          onClose={() => setShowGlobalAdd(false)}
        />
      )}
    </div>
  );
}
