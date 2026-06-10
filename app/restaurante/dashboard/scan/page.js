"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import styles from "./scan.module.css";

export default function RestaurantScan() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [passCode, setPassCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("restaurant");
    if (!stored) {
      router.push("/restaurante");
      return;
    }
    setTimeout(() => setRestaurant(JSON.parse(stored)), 0);
  }, [router]);

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

  const executeSearch = (codeToSearch) => {
    if (!codeToSearch.trim()) return;
    router.push(`/restaurante/dashboard/pass/${codeToSearch.trim().toUpperCase()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(passCode);
  };

  const handleScanSuccess = (decodedText) => {
    playBeep();
    setShowScanner(false);
    
    let code = decodedText;
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        code = lastPart;
      }
    } catch(e) {
      // Not a valid URL, use raw text
    }

    const finalCode = code.toUpperCase();
    setPassCode(finalCode);
    executeSearch(finalCode);
  };

  if (!restaurant) return null;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <button onClick={() => router.push("/restaurante/dashboard")} className={styles.backBtn}>
          ←
        </button>
        <h2 className={styles.headerTitle}>Validar Nuevo Pase</h2>
      </header>

      <div className={styles.content}>
        
        {!showScanner ? (
          <div className={styles.scanActions}>
            <div className={styles.iconContainer}>
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            
            <button 
              type="button" 
              className={styles.qrBtn}
              onClick={() => setShowScanner(true)}
            >
              Abrir Cámara para Escanear
            </button>

            <div className={styles.divider}>
              <span>O ingresar manualmente</span>
            </div>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                className="form-input"
                placeholder="Código Manual (Ej: SPM-A8K3N)"
                value={passCode}
                onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, textAlign: "center", fontSize: "1.1rem" }}
              />
              <button type="submit" className="btn btn-primary" disabled={!passCode.trim()} style={{ width: "100%" }}>
                Buscar Código
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.scannerWrapper}>
            <div className={styles.scannerBox}>
              <QRScanner 
                onScanSuccess={handleScanSuccess} 
                onClose={() => setShowScanner(false)} 
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
