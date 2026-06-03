"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./pass.module.css";

export default function PassPage() {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    async function fetchPass() {
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
        {/* Movie Pass Card */}
        <div className={styles.passCard}>
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
              <span className={styles.detailLabel}>👤 Cliente</span>
              <span className={styles.detailValue}>{pass.nombre}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>🎬 Película</span>
              <span className={styles.detailValue}>{pass.pelicula}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>🍽️ Restaurante</span>
              <span className={styles.detailValue}>{pass.restaurante_nombre}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>👥 Personas</span>
              <span className={styles.detailValue}>{pass.personas}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>🎁 Beneficio</span>
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
      </div>
    </main>
  );
}
