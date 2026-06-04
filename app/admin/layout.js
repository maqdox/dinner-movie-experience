"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

/* ── SVG Icons (estilo Lucide/stroke, consistente con el landing) ── */
const DashboardIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const KeyIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m11.5 11.5 5-5" />
    <path d="M16 7h3v3" />
    <path d="m21 2-4.5 4.5" />
  </svg>
);

const LogoutIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const UserIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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
    return (
      <div className={styles.loadingScreen}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span>Cargando panel...</span>
      </div>
    );
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

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <DashboardIcon />, match: pathname === "/admin/dashboard" },
    { href: "/admin/accesos", label: "Gestión de Accesos", icon: <KeyIcon />, match: pathname.includes("/admin/accesos") },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoArea}>
            <Image src="/logos/ventu.png" alt="Ventu" width={32} height={35} />
            <div>
              <h2>Vizion Admin</h2>
              <p>Dinner & Movie</p>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navSection}>MENÚ</span>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${item.match ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <UserIcon size={14} />
            </div>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogoutIcon size={16} />
            <span>Cerrar Sesión</span>
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
