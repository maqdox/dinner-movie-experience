"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  // User Management State
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", restaurant_id: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("restaurant");
    if (!stored) {
      router.push("/restaurante");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "admin" && parsed.id !== "admin") {
      router.push("/restaurante");
      return;
    }
    fetchPasses();
  }, [router]);

  const fetchPasses = async () => {
    try {
      const res = await fetch("/api/passes");
      const data = await res.json();
      setPasses(data.passes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurant");
    router.push("/restaurante");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, role: "restaurant" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      setUserMessage("✅ Restaurante creado exitosamente");
      setNewUser({ name: "", email: "", password: "", restaurant_id: "" });
    } catch (err) {
      setUserMessage("❌ " + err.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Stats
  const total = passes.length;
  const activos = passes.filter((p) => p.estado === "activo").length;
  const redimidos = passes.filter((p) => p.estado === "redimido").length;
  const expirados = passes.filter((p) => p.estado === "expirado").length;
  const totalConsumo = passes.filter((p) => p.monto_consumo).reduce((sum, p) => sum + parseFloat(p.monto_consumo), 0);
  const totalDescuento = passes.filter((p) => p.descuento_aplicado).reduce((sum, p) => sum + parseFloat(p.descuento_aplicado), 0);

  // Restaurants stats
  const byRestaurant = {};
  passes.forEach((p) => {
    if (!byRestaurant[p.restaurante_nombre]) {
      byRestaurant[p.restaurante_nombre] = { total: 0, redimidos: 0, consumo: 0 };
    }
    byRestaurant[p.restaurante_nombre].total++;
    if (p.estado === "redimido") {
      byRestaurant[p.restaurante_nombre].redimidos++;
      byRestaurant[p.restaurante_nombre].consumo += parseFloat(p.monto_consumo) || 0;
    }
  });

  const filtered = filter === "todos" ? passes : passes.filter((p) => p.estado === filter);

  const statusLabels = {
    activo: { text: "Activo", class: "badge-active" },
    redimido: { text: "Utilizado", class: "badge-redeemed" },
    expirado: { text: "Expirado", class: "badge-expired" },
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Panel Administrativo</h2>
          <span className={styles.headerSub}>Dinner & Movie Experience</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Salir</button>
      </header>

      <div className={styles.content}>
        {/* KPI Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{total}</span>
            <span className={styles.statLabel}>Total Passes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: "var(--color-green)" }}>{activos}</span>
            <span className={styles.statLabel}>Activos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: "var(--color-gold)" }}>{redimidos}</span>
            <span className={styles.statLabel}>Redimidos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: "var(--color-red-light)" }}>{expirados}</span>
            <span className={styles.statLabel}>Expirados</span>
          </div>
        </div>

        {/* Financial KPIs */}
        {totalConsumo > 0 && (
          <div className={styles.financialRow}>
            <div className={`glass-card ${styles.financialCard}`}>
              <span className={styles.financialLabel}>Consumo Total Generado</span>
              <span className={styles.financialValue}>L{totalConsumo.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={`glass-card ${styles.financialCard}`}>
              <span className={styles.financialLabel}>Descuentos Otorgados</span>
              <span className={styles.financialValue} style={{ color: "var(--color-red-light)" }}>L{totalDescuento.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={`glass-card ${styles.financialCard}`}>
              <span className={styles.financialLabel}>Tasa de Redención</span>
              <span className={styles.financialValue}>{total > 0 ? Math.round((redimidos / total) * 100) : 0}%</span>
            </div>
          </div>
        )}

        {/* By Restaurant */}
        {Object.keys(byRestaurant).length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Por Restaurante</h3>
            <div className={styles.restaurantStats}>
              {Object.entries(byRestaurant).sort((a, b) => b[1].redimidos - a[1].redimidos).map(([name, stats]) => (
                <div key={name} className={`glass-card ${styles.restaurantStatCard}`}>
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

        {/* User Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Gestión de Accesos</h3>
          </div>
          <div className={`glass-card ${styles.userManagementCard}`}>
            <p style={{ marginBottom: "16px", color: "var(--color-text-secondary)" }}>
              Crea nuevos accesos para los restaurantes. Estas credenciales les permitirán ingresar al portal de validación.
            </p>
            <form onSubmit={handleCreateUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <input type="text" className="form-input" placeholder="Nombre (Ej. Finca 8)" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-input" placeholder="ID (Ej. f8)" value={newUser.restaurant_id} onChange={(e) => setNewUser({ ...newUser, restaurant_id: e.target.value })} required />
              </div>
              <div className="form-group">
                <input type="email" className="form-input" placeholder="Correo electrónico" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <input type="password" className="form-input" placeholder="Contraseña temporal" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px" }}>
                <button type="submit" disabled={userLoading} className="btn btn-primary" style={{ padding: "10px 24px" }}>
                  {userLoading ? "Creando..." : "Crear Restaurante"}
                </button>
                {userMessage && <span style={{ color: userMessage.includes("❌") ? "var(--color-red-light)" : "var(--color-green)", fontSize: "0.9rem" }}>{userMessage}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* Passes List */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Auditoría de Pases</h3>
            <div className={styles.filters}>
              {["todos", "activo", "redimido", "expirado"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}>
                  {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No hay pases {filter !== "todos" ? `con estado "${filter}"` : "registrados aún"}.</p>
            </div>
          ) : (
            <div className={styles.passesList}>
              {filtered.map((p) => (
                <div key={p.id} className={`glass-card ${styles.passItem}`}>
                  <div className={styles.passItemHeader}>
                    <strong className={styles.passItemId}>{p.id}</strong>
                    <span className={`badge ${statusLabels[p.estado]?.class}`}>{statusLabels[p.estado]?.text}</span>
                  </div>
                  <div className={styles.passItemDetails}>
                    <span>👤 {p.nombre}</span>
                    <span>🎬 {p.pelicula}</span>
                    <span>🍽️ {p.restaurante_nombre}</span>
                    <span>📅 {new Date(p.fecha_creacion).toLocaleDateString("es-HN")}</span>
                    {p.ticket_imagen && p.ticket_imagen !== "none" && p.ticket_imagen !== "upload_failed" && (
                      <span>🎫 <a href={p.ticket_imagen} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>Ver Ticket de Cine</a></span>
                    )}
                  </div>
                  {p.estado === "redimido" && p.monto_consumo && (
                    <div className={styles.passItemRedemption}>
                      Consumo: L{parseFloat(p.monto_consumo).toFixed(2)} | Descuento: L{parseFloat(p.descuento_aplicado).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
