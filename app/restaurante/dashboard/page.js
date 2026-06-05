"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import QRScanner from "@/components/QRScanner";

export default function RestaurantDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [passCode, setPassCode] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [metrics, setMetrics] = useState({ count: 0, totalDiscount: 0 });



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
    setTimeout(() => setRestaurant(JSON.parse(stored)), 0);

    // Auto-completar si viene un código escaneado en la URL
    if (typeof window !== "undefined") {
      if (codeParam) {
        router.push(`/restaurante/dashboard/pass/${codeParam.toUpperCase()}`);
      }
    }

    if (stored) {
      const parsedRes = JSON.parse(stored);
      const storedHistory = localStorage.getItem("recentScans_" + parsedRes.id);
      if (storedHistory) {
        try {
          const history = JSON.parse(storedHistory);
          setTimeout(() => {
            setRecentScans(history);
            setMetrics({
              count: history.length,
              totalDiscount: history.reduce((acc, curr) => acc + (curr.descuento || 0), 0)
            });
          }, 0);
        } catch(e) {}
      }
    }
  }, [router]);



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

        {/* Main CTA */}
        <div style={{ marginTop: "32px", marginBottom: "32px" }}>
          <button 
            type="button" 
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "1.2rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", borderRadius: "16px" }}
            onClick={() => router.push("/restaurante/dashboard/scan")}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Validar Nuevo Pase
          </button>
        </div>





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
