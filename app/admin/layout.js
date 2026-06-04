"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Only check auth state if we are NOT on the login page itself
    if (pathname === "/admin") {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "white" }}>Cargando panel...</div>;
  }

  // Si estamos en la pantalla de login (/admin), no mostramos el sidebar.
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Panel Admin</h2>
          <p>DINNER & MOVIE</p>
        </div>

        <nav className={styles.nav}>
          <Link 
            href="/admin/dashboard" 
            className={`${styles.navLink} ${pathname === "/admin/dashboard" ? styles.active : ""}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/admin/accesos" 
            className={`${styles.navLink} ${pathname.includes("/admin/accesos") ? styles.active : ""}`}
          >
            🔑 Gestión de Accesos
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userEmail}>{user?.email}</div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            🚪 Salir
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
