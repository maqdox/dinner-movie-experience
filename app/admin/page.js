"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "../restaurante/restaurante.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar el perfil del usuario en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.role !== "admin") {
          setError("Acceso denegado: No tienes permisos de administrador.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        // Guardar en sessionStorage para compatibilidad con el dashboard actual
        if (typeof window !== "undefined") {
          sessionStorage.setItem("restaurant", JSON.stringify({
            id: userData.restaurant_id || "admin",
            name: userData.name || "Administrador",
            role: userData.role
          }));
        }

        router.push("/admin/dashboard");
      } else {
        setError("Usuario no tiene perfil asignado. Contacta a soporte.");
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <Image src="/logos/ventu.png" alt="Ventu" width={72} height={80} />
            <h1 className={styles.loginTitle} style={{ color: "var(--color-gold)" }}>Portal Administrativo</h1>
            <p className={styles.loginSubtitle}>Inicia sesión para gestionar el proyecto Vizion</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@vizion.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", backgroundColor: "var(--color-gold)", color: "black", borderColor: "var(--color-gold)" }}>
              {loading ? "Validando..." : "Ingresar"}
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
