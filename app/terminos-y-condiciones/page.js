import Link from "next/link";
import styles from "../page.module.css";
import { ArrowLeftIcon } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones - Dinner & Movie Experience",
  description: "Términos y condiciones de la promoción",
};

export default function TerminosYCondiciones() {
  return (
    <div className={styles.v2Root} style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--v2-gold)", marginBottom: "32px", textDecoration: "none", fontWeight: "600" }}>
          <ArrowLeftIcon size={20} /> Volver al Inicio
        </Link>
        
        <h1 style={{ fontSize: "2.5rem", marginBottom: "24px", color: "#fff" }}>Términos y Condiciones</h1>
        <h2 style={{ fontSize: "1.2rem", color: "var(--v2-gold)", marginBottom: "40px" }}>Promoción: Blockbuster Summer 2026</h2>
        
        <div style={{ color: "#ddd", lineHeight: "1.8", fontSize: "1.05rem", whiteSpace: "pre-wrap", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* EL TEXTO SE INSERTARÁ AQUÍ */}
          <p>
            Estimado usuario, este espacio está reservado para el texto legal de los Términos y Condiciones.
          </p>
          <p>
            <strong>Nota para el administrador:</strong> Por favor, envíame (en el chat) el texto del documento de Google Docs para pegarlo en esta sección de manera definitiva.
          </p>
        </div>
      </div>
    </div>
  );
}
