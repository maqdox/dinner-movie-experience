"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess, onClose }) {
  const [error, setError] = useState(null);
  const [hasCameras, setHasCameras] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          if (mounted) setHasCameras(true);
          
          scannerInstance.current = new Html5Qrcode("qr-reader");
          
          await scannerInstance.current.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // Success callback
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Ignore scan errors as they happen constantly when no QR is found
            }
          );
        } else {
          if (mounted) setError("No se encontraron cámaras en este dispositivo.");
        }
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        if (mounted) setError("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerInstance.current && scannerInstance.current.isScanning) {
        scannerInstance.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Escanear Movie Pass</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.scannerContainer}>
          {error ? (
            <div style={styles.errorBox}>{error}</div>
          ) : (
            <div id="qr-reader" ref={scannerRef} style={{ width: "100%" }}></div>
          )}
        </div>
        
        <p style={styles.hint}>Apunta la cámara al código QR del cliente</p>
        
        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ 
              width: "100%", 
              padding: "14px", 
              backgroundColor: "rgba(255,255,255,0.1)", 
              color: "#fff", 
              border: "1px solid rgba(255,255,255,0.2)", 
              borderRadius: "8px", 
              fontSize: "1rem", 
              fontWeight: 600, 
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
          >
            Cancelar Escaneo
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem"
  },
  modal: {
    backgroundColor: "#111827",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#9CA3AF",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.2rem",
    lineHeight: 1
  },
  scannerContainer: {
    width: "100%",
    minHeight: "300px",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  errorBox: {
    padding: "2rem",
    color: "#EF4444",
    textAlign: "center",
    fontSize: "0.9rem"
  },
  hint: {
    textAlign: "center",
    color: "#9CA3AF",
    padding: "1rem",
    margin: 0,
    fontSize: "0.9rem"
  }
};
