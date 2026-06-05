"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import QRScanner from "@/components/QRScanner";

export default function RestaurantDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [passCode, setPassCode] = useState("");
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRedeem, setShowRedeem] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [metrics, setMetrics] = useState({ count: 0, totalDiscount: 0 });
  const [redeemForm, setRedeemForm] = useState({
    monto_consumo: "",
    descuento_aplicado: "",
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

    if (stored) {
      const parsedRes = JSON.parse(stored);
      const storedHistory = localStorage.getItem("recentScans_" + parsedRes.id);
      if (storedHistory) {
        try {
          const history = JSON.parse(storedHistory);
          setRecentScans(history);
          setMetrics({
            count: history.length,
            totalDiscount: history.reduce((acc, curr) => acc + (curr.descuento || 0), 0)
          });
        } catch(e) {}
      }
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

  const handleScanSuccess = (decodedText) => {
    playBeep();
    setShowScanner(false);
    setPassCode(decodedText.toUpperCase());
    executeSearch(decodedText);
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

      playBeep();
      setSuccess(`✅ Pass ${pass.id} redimido exitosamente. Descuento: L${descuento.toFixed(2)}`);
      setPass(data.pass);
      setShowRedeem(false);

      // Save to history
      const newHistoryItem = {
        id: pass.id,
        time: new Date().toLocaleTimeString("es-HN", { hour: '2-digit', minute: '2-digit' }),
        descuento
      };
      const newHistory = [newHistoryItem, ...recentScans].slice(0, 10);
      setRecentScans(newHistory);
      setMetrics(prev => ({
        count: prev.count + 1,
        totalDiscount: prev.totalDiscount + descuento
      }));
      localStorage.setItem("recentScans_" + restaurant.id, JSON.stringify(newHistory));
      
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
        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Validados Hoy</span>
            <span className={styles.metricValue}>{metrics.count}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Descuentos Aplicados</span>
            <span className={styles.metricValue} style={{ color: "var(--color-gold)" }}>
              L {metrics.totalDiscount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchForm}>
          <h3 className={styles.searchTitle}>Validar Movie Pass</h3>
          <p className={styles.searchDesc}>Ingresa el código del cliente o escanea su QR</p>
          
          <button 
            type="button" 
            className={styles.qrBtn}
            onClick={() => setShowScanner(true)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Escanear Código QR
          </button>

          <form onSubmit={handleSearch} className={styles.searchRow}>
            <input
              type="text"
              className="form-input"
              placeholder="Código Manual (Ej: SPM-A8K3N)"
              value={passCode}
              onChange={(e) => setPassCode(e.target.value.toUpperCase())}
              style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !passCode.trim()}>
              {loading ? "..." : "Buscar"}
            </button>
          </form>
        </div>

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

        {/* Scanner Modal */}
        {showScanner && (
          <QRScanner 
            onScanSuccess={handleScanSuccess} 
            onClose={() => setShowScanner(false)} 
          />
        )}

        {/* History Section */}
        {recentScans.length > 0 && (
          <div className={styles.historySection}>
            <h4 className={styles.historyTitle}>Últimos Validados</h4>
            <div className={styles.historyList}>
              {recentScans.map((scan, idx) => (
                <div key={idx} className={styles.historyItem}>
                  <span className={styles.historyItemCode}>{scan.id}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--color-gold)", fontSize: "0.85rem", fontWeight: 600 }}>L{scan.descuento.toFixed(2)}</div>
                    <div className={styles.historyItemTime}>{scan.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
