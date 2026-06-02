"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./restaurante.module.css";

const RESTAURANT_CODES = {
  mirawa2026: { id: "mirawa", name: "Mirawa" },
  muka2026: { id: "muka", name: "Muka" },
  entretiempo2026: { id: "entre-tiempo", name: "Entre Tiempo" },
  elmorito2026: { id: "el-morito", name: "El Morito" },
  tamago2026: { id: "tamago", name: "Tamago" },
  purosabor2026: { id: "puro-sabor", name: "Puro Sabor" },
  limoncello2026: { id: "limoncello", name: "Limoncello" },
  porfirio2026: { id: "churreria-porfirio", name: "Churrería Porfirio & Heladería Bahama" },
  alegria2026: { id: "alegria", name: "Alegría" },
  benditapizza2026: { id: "bendita-pizza", name: "Bendita Pizza" },
  garibaldi2026: { id: "garibaldi-grill", name: "Garibaldi Grill" },
  tapachula2026: { id: "tapachula", name: "Tapachula" },
  f82026: { id: "f8", name: "Finca 8" },
  admin2026: { id: "admin", name: "Administrador" },
};

export default function RestaurantLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const restaurant = RESTAURANT_CODES[code.trim().toLowerCase()];
    if (!restaurant) {
      setError("Código inválido. Contacta al administrador.");
      return;
    }

    // Store in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("restaurant", JSON.stringify(restaurant));
    }

    if (restaurant.id === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/restaurante/dashboard");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <Image src="/logos/ventu.webp" alt="Ventu" width={80} height={40} />
            <h1 className={styles.loginTitle}>Portal Restaurante</h1>
            <p className={styles.loginSubtitle}>Ingresa tu código de acceso para validar Movie Passes</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="code">Código de Acceso</label>
              <input
                id="code"
                type="password"
                className="form-input"
                placeholder="Ingresa tu código"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                autoFocus
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Ingresar
            </button>
          </form>

          <div className={styles.loginFooter}>
            <Link href="/" className={styles.footerLink}>← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
