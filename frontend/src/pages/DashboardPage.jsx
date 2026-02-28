import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, PageHeader, PrimaryBtn, SectionTitle } from "../components/UI.jsx";
import { fmt, getSemaforo, SEMAFORO_COLORS } from "../lib/utils.js";

const TT = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "10px 14px", borderRadius: 8 }}>
      <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{payload[0]?.payload?.concepto}</p>
      <p style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600 }}>{fmt(payload[0]?.value)}</p>
    </div>
  );
};

export default function DashboardPage({ data, onAdd }) {
  const { transactions, dashConfig, dineroEstimado, fondosInversion } = data;

  const saldoFinal = useMemo(() => transactions.reduce((a, t) => a + parseFloat(t.monto), 0), [transactions]);
  const totalIngresos = useMemo(() => transactions.filter(t => parseFloat(t.monto) > 0).reduce((a, t) => a + parseFloat(t.monto), 0), [transactions]);
  const totalEgresos = useMemo(() => transactions.filter(t => parseFloat(t.monto) < 0).reduce((a, t) => a + Math.abs(parseFloat(t.monto)), 0), [transactions]);
  const totalEstimado = useMemo(() => dineroEstimado.reduce((a, d) => a + parseFloat(d.monto || 0), 0), [dineroEstimado]);
  const totalFondos = useMemo(() => fondosInversion.reduce((a, f) => a + parseFloat(f.monto || 0), 0), [fondosInversion]);
  const totalOblig = useMemo(() =>
    (parseFloat(dashConfig?.proveedores) || 0) + (parseFloat(dashConfig?.talleres) || 0) +
    (parseFloat(dashConfig?.sueldos_pendientes) || 0) + (parseFloat(dashConfig?.oblig_oficinas) || 0),
    [dashConfig]);

  const saldoConOblig = saldoFinal - totalOblig;
  const dineroAFavor = saldoFinal + totalEstimado + totalFondos - totalOblig;
  const semaforo = getSemaforo(saldoFinal);

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let r = 0;
    return sorted.map(t => { r += parseFloat(t.monto); return { fecha: t.fecha?.slice(5, 10), concepto: t.concepto, saldo: r }; });
  }, [transactions]);

  const kpis1 = [
    { label: "Dinero a Favor", value: fmt(dineroAFavor), color: dineroAFavor >= 0 ? "#4ade80" : "#f87171", sub: "Neto real estimado" },
    { label: "Liquidez Actual", value: fmt(saldoFinal), color: SEMAFORO_COLORS[semaforo], sub: "Saldo proyectado" },
    { label: "Saldo c/ Obligaciones", value: fmt(saldoConOblig), color: saldoConOblig >= 0 ? "#4ade80" : "#f87171", sub: "Descontando deudas" },
    { label: "Saldo de Respaldo", value: dashConfig?.saldo_respaldo ? fmt(dashConfig.saldo_respaldo) : "—", color: "#94a3b8", sub: "Fondo de emergencia" },
  ];

  const kpis2 = [
    { label: "Total Ingresos", value: fmt(totalIngresos), color: "#4ade80", sub: `${transactions.filter(t => parseFloat(t.monto) > 0).length} movimientos` },
    { label: "Total Egresos", value: fmt(totalEgresos), color: "#f87171", sub: `${transactions.filter(t => parseFloat(t.monto) < 0).length} movimientos` },
    { label: "Total Obligaciones", value: fmt(totalOblig), color: "#facc15", sub: "Proveedores + sueldos + oficina" },
  ];

  return (
    <div>
      <PageHeader pre="Overview" title="Dashboard" action={<PrimaryBtn onClick={onAdd}>+ Nuevo Movimiento</PrimaryBtn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
        {kpis1.map((k, i) => (
          <Card key={i}>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color, letterSpacing: "-0.02em", marginBottom: 4, fontFamily: "'DM Mono',monospace" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#334155" }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
        {kpis2.map((k, i) => (
          <Card key={i}>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color, letterSpacing: "-0.02em", marginBottom: 4, fontFamily: "'DM Mono',monospace" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#334155" }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 14 }}>
        <SectionTitle>Evolución del Saldo</SectionTitle>
        <ResponsiveContainer width="100%" height={175}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a2236" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<TT />} />
            <Area type="monotone" dataKey="saldo" stroke="#e2e8f0" strokeWidth={2} fill="url(#sg)" dot={{ fill: "#e2e8f0", r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <SectionTitle>Últimos Movimientos</SectionTitle>
        {[...transactions].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 6).map((t, i, arr) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid #111827" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: parseFloat(t.monto) > 0 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                {parseFloat(t.monto) > 0 ? "↑" : "↓"}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{t.concepto}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{t.categoria} · {t.fecha?.slice(0, 10)}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: parseFloat(t.monto) > 0 ? "#4ade80" : "#f87171", fontFamily: "'DM Mono',monospace" }}>
              {parseFloat(t.monto) > 0 ? "+" : ""}{fmt(t.monto)}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
