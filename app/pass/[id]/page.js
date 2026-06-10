"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Film, Utensils, Users, Gift, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./pass.module.css";

export default function PassPage() {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const [restaurant, setRestaurant] = useState(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemForm, setRedeemForm] = useState({ monto_consumo: "", personas_redencion: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchPass() {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("restaurant");
        if (stored) setRestaurant(JSON.parse(stored));
      }

      try {
        const res = await fetch(`/api/passes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPass(data.pass);

        // Generate QR code as data URL
        const QRCode = (await import("qrcode")).default;
        const url = `${window.location.origin}/pass/${id}`;
        const qr = await QRCode.toDataURL(url, {
          width: 280,
          margin: 2,
          color: {
            dark: "#0a0a0f",
            light: "#f0ece4",
          },
        });
        setQrUrl(qr);
      } catch (err) {
        setError(err.message || "Pass no encontrado");
      } finally {
        setLoading(false);
      }
    }
    fetchPass();
  }, [id]);

  const handleRedeem = async () => {
    setActionLoading(true);
    setRedeemError("");

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

      setRedeemSuccess(`✅ Pass redimido exitosamente. Descuento: L${descuento.toFixed(2)}`);
      setPass(data.pass);
      setShowRedeem(false);
    } catch (err) {
      setRedeemError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const passElement = document.getElementById("movie-pass-card");
      if (!passElement) return;
      
      const canvas = await html2canvas(passElement, {
        scale: 2,
        backgroundColor: "#16161f",
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`MoviePass_${pass.id}.pdf`);
    } catch (err) {
      console.error("Error exporting to PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Cargando tu Movie Pass...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorIcon}>❌</div>
        <h2>Pass No Encontrado</h2>
        <p>{error}</p>
        <Link href="/" className="btn btn-primary">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const statusConfig = {
    activo: { label: "ACTIVO", class: styles.statusActive, icon: "✅" },
    redimido: { label: "UTILIZADO", class: styles.statusRedeemed, icon: "🎉" },
    expirado: { label: "EXPIRADO", class: styles.statusExpired, icon: "⏰" },
  };

  const status = statusConfig[pass.estado] || statusConfig.activo;
  const expDate = new Date(pass.fecha_expiracion);
  const createdDate = new Date(pass.fecha_creacion);

  // Time remaining
  const now = new Date();
  const remaining = expDate - now;
  const hoursLeft = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Inicio
        </Link>
        <div className={styles.headerLogos}>
          <Image src="/logos/metrocinemas.png" alt="Metrocinemas" width={90} height={24} />
          <span style={{ color: "var(--color-gold)", fontSize: "0.9rem" }}>×</span>
          <Image src="/logos/ventu.png" alt="Ventu" width={48} height={52} />
        </div>
      </header>

      <div className={styles.passContainer}>
        {pass && (
          <button 
            onClick={handleExportPDF} 
            disabled={exporting}
            className="btn btn-secondary" 
            style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}
          >
            <Download size={18} />
            {exporting ? "Generando PDF..." : "Exportar a PDF"}
          </button>
        )}

        {/* Movie Pass Card */}
        <div id="movie-pass-card" className={styles.passCard}>
          {/* Top decorative strip */}
          <div className={styles.passStrip} />

          {/* Pass Header */}
          <div className={styles.passHeader}>
            <span className={styles.passLabel}>MOVIE PASS</span>
            <h1 className={styles.passId}>{pass.id}</h1>
            <div className={`${styles.statusBadge} ${status.class}`}>
              <span>{status.icon}</span> {status.label}
            </div>
          </div>

          {/* QR Code */}
          {pass.estado === "activo" && qrUrl && (
            <div className={styles.qrSection}>
              <div className={styles.qrWrapper}>
                <img src={qrUrl} alt="QR Code" className={styles.qrImage} />
              </div>
              <p className={styles.qrHint}>Presenta este QR en el restaurante</p>
            </div>
          )}

          {pass.estado === "redimido" && (
            <div className={styles.redeemedSection}>
              <div className={styles.redeemedIcon}>🎉</div>
              <p>Este pass ya fue utilizado</p>
              {pass.fecha_redencion && (
                <span className={styles.redeemedDate}>
                  {new Date(pass.fecha_redencion).toLocaleString("es-HN")}
                </span>
              )}
            </div>
          )}

          {pass.estado === "expirado" && (
            <div className={styles.expiredSection}>
              <div className={styles.expiredIcon}>⏰</div>
              <p>Este pass ha expirado</p>
            </div>
          )}

          {/* Divider */}
          <div className={styles.passDivider}>
            <div className={styles.dividerCircleLeft} />
            <div className={styles.dividerLine} />
            <div className={styles.dividerCircleRight} />
          </div>

          {/* Pass Details */}
          <div className={styles.passDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={16} /> Cliente</span>
              <span className={styles.detailValue}>{pass.nombre}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}><Film size={16} /> Película</span>
              <span className={styles.detailValue}>{pass.pelicula}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}><Utensils size={16} /> Restaurante</span>
              <span className={styles.detailValue}>{pass.restaurante_nombre}</span>
            </div>
            <div className={styles.detailRow} style={{ display: "none" }}>
              <span className={styles.detailLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={16} /> Personas</span>
              <span className={styles.detailValue}>{pass.personas}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel} style={{ display: "flex", alignItems: "center", gap: "6px" }}><Gift size={16} /> Beneficio</span>
              <span className={`${styles.detailValue} ${styles.benefitValue}`}>30% Descuento</span>
            </div>
          </div>

          {/* Time info */}
          <div className={styles.passFooter}>
            <div className={styles.timeInfo}>
              <span className={styles.timeLabel}>Creado</span>
              <span className={styles.timeValue}>{createdDate.toLocaleString("es-HN")}</span>
            </div>
            <div className={styles.timeInfo}>
              <span className={styles.timeLabel}>Expira</span>
              <span className={styles.timeValue}>{expDate.toLocaleString("es-HN")}</span>
            </div>
            {pass.estado === "activo" && remaining > 0 && (
              <div className={styles.countdown}>
                ⏳ {hoursLeft}h {minutesLeft}m restantes
              </div>
            )}
          </div>
        </div>

        {pass.estado === "activo" && (
          <p className={styles.footerNote}>
            Presenta este código en <strong>{pass.restaurante_nombre}</strong> para obtener tu descuento.
            Válido por 48 horas desde su emisión.
          </p>
        )}

        {/* Restaurant Validation UI (Only visible to logged-in waiters) */}
        {restaurant && pass.estado === "activo" && (
          <div className={`glass-card`} style={{ marginTop: 24, padding: 20 }}>
            <h3 style={{ color: "var(--color-gold)", marginBottom: 16 }}>Modo Restaurante</h3>
            
            {pass.restaurante_id !== restaurant.id ? (
              <p style={{ color: "var(--color-red-light)" }}>⚠️ Este pase es para {pass.restaurante_nombre}, no para {restaurant.name}.</p>
            ) : (
              <>
                {!showRedeem ? (
                  <button onClick={() => setShowRedeem(true)} className="btn btn-success" style={{ width: "100%" }}>
                    ✅ Validar y Cobrar
                  </button>
                ) : (
                  <div>
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
                    {redeemError && <p style={{ color: "var(--color-red-light)", marginBottom: 12 }}>{redeemError}</p>}
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                      <button onClick={() => setShowRedeem(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                      <button onClick={handleRedeem} className="btn btn-success" disabled={!redeemForm.monto_consumo || actionLoading} style={{ flex: 2 }}>
                        {actionLoading ? "Procesando..." : "Confirmar"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {redeemSuccess && (
          <div className="glass-card" style={{ marginTop: 24, padding: 20, textAlign: "center" }}>
            <p style={{ color: "var(--color-green)", fontWeight: "bold" }}>{redeemSuccess}</p>
          </div>
        )}
      </div>
    </main>
  );
}
