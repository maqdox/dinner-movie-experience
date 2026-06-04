"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { RESTAURANTS } from "@/lib/constants";

/* ── SVG Icons ── */
const TicketIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);
const CheckCircleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const StarIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const ClockIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const WalletIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
    <path d="M18 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);
const TrendUpIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const CalendarIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FilterIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

/* ── Mini Line Chart (pure SVG, no dependencies) ── */
function MiniLineChart({ data, labels, width = 500, height = 160 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * chartW;
    const y = padY + chartH - (v / max) * chartH;
    return { x, y, v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  // Y-axis gridlines
  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => Math.round((max / gridLines) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block", overflow: "visible" }}>
      {/* Grid lines */}
      {gridValues.map((val, i) => {
        const y = padY + chartH - (val / max) * chartH;
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} fill="rgba(255,255,255,0.25)" fontSize="10" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          {p.v > 0 && (
            <text x={p.x} y={p.y - 10} fill="#0ea5e9" fontSize="11" fontWeight="600" textAnchor="middle">{p.v}</text>
          )}
          <text x={p.x} y={height - 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("todos");

  useEffect(() => {
    const stored = sessionStorage.getItem("restaurant");
    if (!stored) { router.push("/restaurante"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "admin" && parsed.id !== "admin") { router.push("/restaurante"); return; }
    fetchPasses();
  }, [router]);

  const fetchPasses = async () => {
    try {
      const res = await fetch("/api/passes");
      const data = await res.json();
      setPasses(data.passes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Stats
  const total = passes.length;
  const activos = passes.filter((p) => p.estado === "activo").length;
  const redimidos = passes.filter((p) => p.estado === "redimido").length;
  const expirados = passes.filter((p) => p.estado === "expirado").length;
  const totalConsumo = passes.filter((p) => p.monto_consumo).reduce((sum, p) => sum + parseFloat(p.monto_consumo), 0);
  const tasaRedencion = total > 0 ? Math.round((redimidos / total) * 100) : 0;

  // Weekly trend data (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    const labels = [];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = passes.filter(p => {
        const created = new Date(p.fecha_creacion);
        return created >= d && created < next;
      }).length;
      days.push(count);
      labels.push(dayNames[d.getDay()]);
    }
    return { days, labels };
  }, [passes]);

  // Restaurants stats
  const byRestaurant = {};
  passes.forEach((p) => {
    if (!byRestaurant[p.restaurante_nombre]) byRestaurant[p.restaurante_nombre] = { total: 0, redimidos: 0, consumo: 0 };
    byRestaurant[p.restaurante_nombre].total++;
    if (p.estado === "redimido") {
      byRestaurant[p.restaurante_nombre].redimidos++;
      byRestaurant[p.restaurante_nombre].consumo += parseFloat(p.monto_consumo) || 0;
    }
  });

  // Filtered passes
  const filtered = useMemo(() => {
    let result = passes;
    if (filter !== "todos") result = result.filter((p) => p.estado === filter);
    if (restaurantFilter !== "todos") result = result.filter((p) => p.restaurante_id === restaurantFilter);
    if (dateFrom) { const from = new Date(dateFrom); from.setHours(0,0,0,0); result = result.filter((p) => new Date(p.fecha_creacion) >= from); }
    if (dateTo) { const to = new Date(dateTo); to.setHours(23,59,59,999); result = result.filter((p) => new Date(p.fecha_creacion) <= to); }
    return result;
  }, [passes, filter, dateFrom, dateTo, restaurantFilter]);

  const statusLabels = {
    activo: { text: "Activo", class: "badge-active" },
    redimido: { text: "Utilizado", class: "badge-redeemed" },
    expirado: { text: "Expirado", class: "badge-expired" },
  };

  if (loading) {
    return (<div className={styles.loadingScreen}><div className="spinner" style={{ width: 40, height: 40 }} /><p>Cargando dashboard...</p></div>);
  }

  const kpiCards = [
    { label: "Total Passes", value: total, icon: <TicketIcon /> },
    { label: "Activos", value: activos, icon: <CheckCircleIcon /> },
    { label: "Redimidos", value: redimidos, icon: <StarIcon /> },
    { label: "Expirados", value: expirados, icon: <ClockIcon /> },
  ];



  return (
    <main className={styles.main}>
      <header className={styles.pageHeader}>
        <h2>Dashboard</h2>
        <p>Métricas generales de la promoción Dinner & Movie Experience</p>
      </header>

      <div className={styles.content}>
        {/* KPI Cards */}
        <div className={styles.statsGrid}>
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className={styles.statCard}>
              <div className={styles.statCardIcon}>{kpi.icon}</div>
              <div className={styles.statCardInfo}>
                <span className={styles.statLabel}>{kpi.label}</span>
                <span className={styles.statValue}>{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Overview: Chart + Financial */}
        <div className={styles.overviewGrid}>
          {/* Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Tendencia Semanal de Pases</h3>
              <p className={styles.chartSubtitle}>Últimos 7 días</p>
            </div>
            <div className={styles.chartWrapper}>
              <MiniLineChart data={weeklyData.days} labels={weeklyData.labels} />
            </div>
          </div>

          {/* Financial Summary */}
          <div className={styles.financialStack}>
            <div className={styles.financialCard}>
              <div className={styles.financialTop}>
                <span className={styles.financialIcon}><WalletIcon /></span>
                <span className={styles.financialLabel}>Consumo Total Generado</span>
              </div>
              <span className={styles.financialValue}>L {totalConsumo.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.financialCard}>
              <div className={styles.financialTop}>
                <span className={styles.financialIcon}><TrendUpIcon /></span>
                <span className={styles.financialLabel}>Tasa de Redención</span>
              </div>
              <span className={styles.financialValue}>{tasaRedencion}%</span>
            </div>
          </div>
        </div>

        {/* By Restaurant */}
        {Object.keys(byRestaurant).length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Rendimiento por Restaurante</h3>
            <div className={styles.restaurantStats}>
              {Object.entries(byRestaurant).sort((a, b) => b[1].redimidos - a[1].redimidos).map(([name, stats]) => (
                <div key={name} className={styles.restaurantStatCard}>
                  <h4>{name}</h4>
                  <div className={styles.restaurantStatGrid}>
                    <div><span className={styles.miniStat}>{stats.total}</span><span className={styles.miniLabel}>Passes</span></div>
                    <div><span className={styles.miniStat}>{stats.redimidos}</span><span className={styles.miniLabel}>Redimidos</span></div>
                    <div><span className={styles.miniStat}>L{stats.consumo.toFixed(0)}</span><span className={styles.miniLabel}>Consumo</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passes Table */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Auditoría de Pases</h3>

          <div className={styles.filtersBar}>
            <div className={styles.statusFilters}>
              {["todos", "activo", "redimido", "expirado"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}>
                  {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                </button>
              ))}
            </div>
            <div className={styles.filterDivider} />
            <div className={styles.filterGroup}>
              <CalendarIcon />
              <input type="date" className={styles.filterInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className={styles.filterDash}>—</span>
              <input type="date" className={styles.filterInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <FilterIcon />
              <select className={styles.filterInput} value={restaurantFilter} onChange={(e) => setRestaurantFilter(e.target.value)}>
                <option value="todos">Todos los restaurantes</option>
                {RESTAURANTS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.passesCount}>
            Mostrando <strong>{filtered.length}</strong> de {passes.length} pases
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}><p>No hay pases {filter !== "todos" ? `con estado "${filter}"` : "registrados aún"}.</p></div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.passesTable}>
                <thead>
                  <tr>
                    <th>Código</th><th>Cliente</th><th>Película</th><th>Restaurante</th><th>Fecha</th><th>Estado</th><th>Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td><code className={styles.codeCell}>{p.id}</code></td>
                      <td>{p.nombre}</td>
                      <td>{p.pelicula}</td>
                      <td>{p.restaurante_nombre}</td>
                      <td className={styles.dateCell}>{new Date(p.fecha_creacion).toLocaleDateString("es-HN")}</td>
                      <td><span className={`badge ${statusLabels[p.estado]?.class}`}>{statusLabels[p.estado]?.text}</span></td>
                      <td>
                        {p.ticket_imagen && p.ticket_imagen !== "none" && p.ticket_imagen !== "upload_failed" ? (
                          <a href={p.ticket_imagen} target="_blank" rel="noopener noreferrer" className={styles.ticketLink}>Ver</a>
                        ) : (<span className={styles.noTicket}>—</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
