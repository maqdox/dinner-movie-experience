"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function RestaurantDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [passCode, setPassCode] = useState("");
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemForm, setRedeemForm] = useState({
    monto_consumo: "",
    descuento_aplicado: "",
    personas_redencion: "",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("restaurant");
    
    let codeParam = "";
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      codeParam = urlParams.get("code");
    }

    if (!stored) {
      if (codeParam) {
        router.push(`/restaurante?code=${codeParam}`);
      } else {
        router.push("/restaurante");
      }
      return;
    }
    setRestaurant(JSON.parse(stored));

    // Auto-completar si viene un código escaneado en la URL
    if (typeof window !== "undefined" && codeParam) {
      setPassCode(codeParam.toUpperCase());
      executeSearch(codeParam);
    }
  }, [router]);

  const executeSearch = async (codeToSearch) => {
    if (!codeToSearch.trim()) return;

    setLoading(true);
    setError("");
    setPass(null);
    setShowRedeem(false);
    setSuccess("");

    try {
      const res = await fetch(`/api/passes/${codeToSearch.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPass(data.pass);
    } catch (err) {
      setError(err.message || "Pass no encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    executeSearch(passCode);
  };

  const handleRedeem = async () => {
    setLoading(true);
    setError("");

    try {
      const monto = parseFloat(redeemForm.monto_consumo);
      const descuento = monto * 0.3;

      const res = await fetch(`/api/passes/${pass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto_consumo: monto,
          descuento_aplicado: descuento,
          personas_redencion: parseInt(redeemForm.personas_redencion) || pass.personas,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`✅ Pass ${pass.id} redimido exitosamente. Descuento: L${descuento.toFixed(2)}`);
      setPass(data.pass);
      setShowRedeem(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurant");
    router.push("/restaurante");
  };

  if (!restaurant) return null;

  const statusLabels = {
    activo: { text: "ACTIVO", class: "badge-active" },
    redimido: { text: "UTILIZADO", class: "badge-redeemed" },
    expirado: { text: "EXPIRADO", class: "badge-expired" },
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>{restaurant.name}</h2>
          <span className={styles.headerSub}>Portal de Validación</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Salir</button>
      </header>

      <div className={styles.content}>
        {/* Search */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <h3 className={styles.searchTitle}>Validar Movie Pass</h3>
          <p className={styles.searchDesc}>Ingresa el código del Movie Pass del cliente</p>
          <div className={styles.searchRow}>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: SPM-A8K3N"
              value={passCode}
              onChange={(e) => setPassCode(e.target.value.toUpperCase())}
              style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "..." : "Buscar"}
            </button>
          </div>
        </form>

        {error && <div className={styles.alert + " " + styles.alertError}>{error}</div>}
        {success && <div className={styles.alert + " " + styles.alertSuccess}>{success}</div>}

        {/* Pass Result */}
        {pass && (
          <div className={`glass-card ${styles.passResult}`}>
            <div className={styles.passResultHeader}>
              <div>
                <h3 className={styles.passResultId}>{pass.id}</h3>
                <span className={`badge ${statusLabels[pass.estado]?.class}`}>
                  {statusLabels[pass.estado]?.text}
                </span>
              </div>
            </div>

            <div className={styles.passGrid}>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Cliente</span>
                <span className={styles.passFieldValue}>{pass.nombre}</span>
              </div>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Película</span>
                <span className={styles.passFieldValue}>{pass.pelicula}</span>
              </div>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Restaurante</span>
                <span className={styles.passFieldValue}>{pass.restaurante_nombre}</span>
              </div>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Personas</span>
                <span className={styles.passFieldValue}>{pass.personas}</span>
              </div>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Beneficio</span>
                <span className={styles.passFieldValue} style={{ color: "var(--color-gold)" }}>30% Descuento</span>
              </div>
              <div className={styles.passField}>
                <span className={styles.passFieldLabel}>Expira</span>
                <span className={styles.passFieldValue}>{new Date(pass.fecha_expiracion).toLocaleString("es-HN")}</span>
              </div>
            </div>

            {/* Warnings */}
            {pass.restaurante_id !== restaurant.id && pass.estado === "activo" && (
              <div className={styles.alert + " " + styles.alertError}>
                ⚠️ Este pass es para <strong>{pass.restaurante_nombre}</strong>, no para {restaurant.name}.
              </div>
            )}

            {/* Redeem Button */}
            {pass.estado === "activo" && pass.restaurante_id === restaurant.id && !showRedeem && (
              <button onClick={() => setShowRedeem(true)} className="btn btn-success" style={{ width: "100%", marginTop: 16 }}>
                ✅ Aplicar Beneficio
              </button>
            )}

            {/* Redeem Form */}
            {showRedeem && (
              <div className={styles.redeemForm}>
                <h4>Registrar Redención</h4>
                <div className="form-group">
                  <label className="form-label">Monto Total del Consumo (L)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej: 850"
                    value={redeemForm.monto_consumo}
                    onChange={(e) => setRedeemForm({ ...redeemForm, monto_consumo: e.target.value })}
                  />
                  {redeemForm.monto_consumo && (
                    <p style={{ color: "var(--color-gold)", fontSize: "0.85rem", marginTop: 8 }}>
                      Descuento (30%): <strong>L{(parseFloat(redeemForm.monto_consumo) * 0.3).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Personas en Mesa</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={pass.personas}
                    value={redeemForm.personas_redencion}
                    onChange={(e) => setRedeemForm({ ...redeemForm, personas_redencion: e.target.value })}
                  />
                </div>
                <div className={styles.redeemButtons}>
                  <button onClick={() => setShowRedeem(false)} className="btn btn-secondary">Cancelar</button>
                  <button onClick={handleRedeem} className="btn btn-success" disabled={!redeemForm.monto_consumo || loading} style={{ flex: 1 }}>
                    {loading ? "Procesando..." : "Confirmar Redención"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
