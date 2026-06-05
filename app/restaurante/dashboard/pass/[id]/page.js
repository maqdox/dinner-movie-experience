"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./pass-detail.module.css";

export default function RestaurantPassDetail() {
  const router = useRouter();
  const { id } = useParams();
  
  const [restaurant, setRestaurant] = useState(null);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [redeemForm, setRedeemForm] = useState({
    monto_consumo: "",
    personas_redencion: "",
  });

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) {
      console.error("Audio not supported");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("restaurant");
    if (!stored) {
      router.push("/restaurante");
      return;
    }
    setRestaurant(JSON.parse(stored));

    const fetchPass = async () => {
      try {
        const res = await fetch(`/api/passes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPass(data.pass);
      } catch (err) {
        setError(err.message || "Pass no encontrado");
      } finally {
        setLoading(false);
      }
    };

    fetchPass();
  }, [id, router]);

  const handleRedeem = async () => {
    setActionLoading(true);
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

      playBeep();
      setPass(data.pass);
      setDiscountApplied(descuento);
      setRedeemSuccess(true);
      setShowRedeem(false);

      // Save to history in localStorage
      const storedHistory = localStorage.getItem("recentScans_" + restaurant.id);
      let recentScans = [];
      if (storedHistory) {
        try { recentScans = JSON.parse(storedHistory); } catch(e) {}
      }
      
      const newHistoryItem = {
        id: pass.id,
        time: new Date().toLocaleTimeString("es-HN", { hour: '2-digit', minute: '2-digit' }),
        descuento
      };
      const newHistory = [newHistoryItem, ...recentScans].slice(0, 10);
      localStorage.setItem("recentScans_" + restaurant.id, JSON.stringify(newHistory));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
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
        <button onClick={() => router.push("/restaurante/dashboard")} className={styles.backBtn}>
          ←
        </button>
        <h2 className={styles.headerTitle}>Detalles del Pase</h2>
      </header>

      <div className={styles.content}>
        {loading && <div style={{ textAlign: "center", padding: "40px" }}>Cargando pase...</div>}
        
        {error && !pass && (
          <div className={styles.alertError}>
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => router.push("/restaurante/dashboard")} 
              className="btn btn-primary" 
              style={{ marginTop: 16 }}
            >
              Volver al inicio
            </button>
          </div>
        )}

        {pass && !redeemSuccess && (
          <div className={styles.passCard}>
            <div className={styles.passHeader}>
              <div>
                <h3 className={styles.passId}>{pass.id}</h3>
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
              <div className={styles.alertError + " " + styles.alert}>
                ⚠️ Este pass es para <strong>{pass.restaurante_nombre}</strong>, no para {restaurant.name}.
              </div>
            )}
            {error && pass && <div className={styles.alertError + " " + styles.alert}>{error}</div>}

            {/* Redeem Actions */}
            {pass.estado === "activo" && pass.restaurante_id === restaurant.id && !showRedeem && (
              <button onClick={() => setShowRedeem(true)} className="btn btn-success" style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}>
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
                  <button onClick={() => setShowRedeem(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                  <button onClick={handleRedeem} className="btn btn-success" disabled={!redeemForm.monto_consumo || actionLoading} style={{ flex: 2 }}>
                    {actionLoading ? "Procesando..." : "Confirmar Redención"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success View */}
        {redeemSuccess && (
          <div className={styles.successView}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>¡Beneficio Aplicado!</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>Pass {pass?.id} ha sido redimido.</p>
            
            <div className={styles.successAmount}>
              Ahorro: L {discountApplied.toFixed(2)}
            </div>

            <div className={styles.successButtons}>
              <button 
                onClick={() => router.push("/restaurante/dashboard/scan")} 
                className="btn btn-primary" 
                style={{ padding: "16px", fontSize: "1.1rem" }}
              >
                Escanear Nuevo Pase
              </button>
              <button 
                onClick={() => router.push("/restaurante/dashboard")} 
                className="btn btn-secondary"
              >
                Volver al Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* Redeemed Modal Popup */}
        {pass && pass.estado === "redimido" && !redeemSuccess && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>⚠️</div>
              <h3 className={styles.modalTitle}>Pase Ya Utilizado</h3>
              <p className={styles.modalText}>
                Este pase ({pass.id}) ya fue redimido y no puede utilizarse nuevamente.
              </p>
              <button 
                onClick={() => router.push("/restaurante/dashboard")} 
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "24px", padding: "14px" }}
              >
                Volver al Menú Principal
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
