"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import styles from "./registro.module.css";

import { RESTAURANTS } from "@/lib/constants";

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiWarning, setAiWarning] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    pelicula: "",
    restaurante: "",
    fecha_ticket: "",
    numero_transaccion: "",
    ticket: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no debe exceder 5MB");
        return;
      }
      setForm({ ...form, ticket: file, pelicula: "", fecha_ticket: "", numero_transaccion: "" });
      setFileName(file.name);
      setError("");

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64Image = ev.target.result;
        setFilePreview(base64Image);
        
        // Iniciar análisis de IA
        setAnalyzing(true);
        setAiWarning("");
        try {
          const res = await fetch("/api/analyze-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_base64: base64Image })
          });
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            const { pelicula, fecha, cine, numero_transaccion } = data.data;
            
            // Autocompletar form
            setForm(prev => ({
              ...prev,
              pelicula: pelicula || prev.pelicula,
              fecha_ticket: fecha || prev.fecha_ticket,
              numero_transaccion: numero_transaccion || prev.numero_transaccion
            }));
            
            // Validar cine
            const cineLower = cine?.toLowerCase() || "";
            if (!cineLower.includes("america") && !cineLower.includes("novacentro") && !cineLower.includes("miraflores")) {
              setAiWarning(`La IA detectó el cine como "${cine}". Recuerda que solo participan Plaza América, Novacentro y Plaza Miraflores.`);
            }
          }
        } catch (err) {
          console.error("Error al analizar con IA:", err);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!form.nombre.trim()) return "Ingresa tu nombre";
    if (!form.email.trim() || !form.email.includes("@")) return "Ingresa un correo válido";
    if (!form.telefono.trim()) return "Ingresa tu teléfono";
    return null;
  };

  const validateStep2 = () => {
    if (!form.pelicula.trim()) return "Ingresa la película que viste";
    if (!form.restaurante) return "Selecciona un restaurante";
    if (!form.fecha_ticket) return "Ingresa la fecha de tu ticket";
    
    // Validar que la fecha no sea de hace más de 5 días ni en el futuro
    const ticketDate = new Date(form.fecha_ticket);
    const now = new Date();
    // Ajustar horas para comparar solo fechas
    ticketDate.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = today - ticketDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return "La fecha del ticket no puede ser en el futuro";
    }
    if (diffDays > 5) {
      return "El ticket no puede tener más de 5 días de antigüedad";
    }
    
    if (!form.numero_transaccion.trim()) return "El número de transacción no fue detectado, por favor ingrésalo manualmente";

    if (!form.ticket) return "Sube tu ticket de Metrocinemas";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Comprimir la imagen si es archivo de tipo imagen
      let fileToConvert = form.ticket;
      if (fileToConvert.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 0.15, // Max 150KB
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        try {
          fileToConvert = await imageCompression(fileToConvert, options);
        } catch (error) {
          console.error("Error al comprimir la imagen:", error);
        }
      }

      // Convert ticket to base64
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });

      const ticketBase64 = await toBase64(fileToConvert);
      const restaurant = RESTAURANTS.find((r) => r.id === form.restaurante);

      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          pelicula: form.pelicula,
          personas: form.personas,
          restaurante_id: form.restaurante,
          restaurante_nombre: restaurant?.name || "",
          fecha_ticket: form.fecha_ticket,
          numero_transaccion: form.numero_transaccion,
          ticket_base64: ticketBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al crear el pass");

      router.push(`/pass/${data.id}`);
    } catch (err) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Header mini */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Inicio
        </Link>
        <div className={styles.headerLogos}>
          <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={90} height={24} />
          <span style={{ color: "var(--color-gold)", fontSize: "0.9rem" }}>×</span>
          <Image src="/logos/ventu.png" alt="Ventu" width={48} height={52} />
        </div>
      </header>

      <div className={styles.formWrapper}>
        {/* Progress */}
        <div className={styles.progress}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}>
            <div className={styles.progressDot}>1</div>
            <span>Tus Datos</span>
          </div>
          <div className={styles.progressLine}>
            <div className={styles.progressLineFill} style={{ width: step >= 2 ? "100%" : "0%" }} />
          </div>
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}>
            <div className={styles.progressDot}>2</div>
            <span>Ticket & Restaurante</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.formTitle}>
            {step === 1 ? "Tus Datos" : "Tu Experiencia"}
          </h1>
          <p className={styles.formSubtitle}>
            {step === 1
              ? "Ingresa tus datos para generar tu Movie Pass."
              : "Sube tu ticket y elige dónde cenar."}
          </p>

          {/* Step 1 */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="form-input"
                  placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  className="form-input"
                  placeholder="+504 9999-0000"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <button type="button" onClick={handleNext} className="btn btn-primary" style={{ width: "100%" }}>
                Siguiente →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.disclaimerBox} style={{ backgroundColor: "rgba(255, 215, 0, 0.1)", border: "1px solid var(--color-gold)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                <p style={{ color: "var(--color-gold)", fontSize: "0.85rem", margin: "0 0 8px 0" }}>
                  <strong>⚠️ Importante:</strong> Esta promoción es válida únicamente presentando tickets de <strong>Metrocinemas Plaza América, Novacentro o Plaza Miraflores</strong>.
                </p>
                <p style={{ color: "var(--color-gold)", fontSize: "0.85rem", margin: 0 }}>
                  Tu ticket debe tener <strong>máximo 5 días de antigüedad</strong>.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "var(--color-gold)" }}>1. Sube tu Ticket de Metrocinemas</label>
                <div className={`file-upload ${fileName ? "has-file" : ""}`} style={{ position: "relative", marginTop: "8px" }}>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} disabled={analyzing} />
                  
                  {analyzing && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "8px", zIndex: 10 }}>
                      <span className="spinner" style={{ width: 30, height: 30, marginBottom: 10 }} />
                      <p style={{ color: "#fff", fontSize: "0.9rem" }}>✨ Analizando con IA...</p>
                    </div>
                  )}

                  {filePreview ? (
                    <div className={styles.filePreview}>
                      <img src={filePreview} alt="Preview" className={styles.previewImage} />
                      <p className={styles.fileName}>{fileName}</p>
                    </div>
                  ) : (
                    <>
                      <div className="file-upload-icon" style={{ marginBottom: "12px" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="file-upload-text">
                        <strong>Toca para subir</strong> tu ticket
                        <br />
                        Foto, screenshot o PDF (máx 5MB)
                      </p>
                    </>
                  )}
                </div>
                {aiWarning && (
                  <p style={{ color: "var(--color-red-light)", fontSize: "0.85rem", marginTop: "8px" }}>
                    ⚠️ {aiWarning}
                  </p>
                )}
              </div>

              <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.1)", margin: "24px 0" }} />

              <label className="form-label" style={{ color: "var(--color-gold)", marginBottom: "16px", display: "block" }}>
                2. Verifica y completa tus datos
              </label>

              <div className="form-group">
                <label className="form-label" htmlFor="pelicula">Película que Viste</label>
                <input
                  id="pelicula"
                  name="pelicula"
                  type="text"
                  className="form-input"
                  placeholder="Ej: Inside Out 3"
                  value={form.pelicula}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fecha_ticket">Fecha del Ticket</label>
                <input
                  id="fecha_ticket"
                  name="fecha_ticket"
                  type="date"
                  className="form-input"
                  value={form.fecha_ticket}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="numero_transaccion">Número de Ticket/Factura</label>
                <input
                  id="numero_transaccion"
                  name="numero_transaccion"
                  type="text"
                  className="form-input"
                  placeholder="FAC-000000"
                  value={form.numero_transaccion}
                  onChange={handleChange}
                />
                <p style={{ color: "var(--color-gold)", fontSize: "0.8rem", marginTop: "4px" }}>Este dato es necesario para evitar duplicados.</p>
              </div>
              <div className="form-group" style={{ display: "none" }}>
                <label className="form-label" htmlFor="personas">Cantidad de Personas</label>
                <select
                  id="personas"
                  name="personas"
                  className="form-input"
                  value={form.personas}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: "16px", display: "block" }}>Elige tu Restaurante</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                  {RESTAURANTS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setForm({ ...form, restaurante: r.id }); setError(""); }}
                      style={{
                        background: form.restaurante === r.id ? "rgba(255, 215, 0, 0.15)" : "rgba(255,255,255,0.03)",
                        border: form.restaurante === r.id ? "2px solid var(--color-gold)" : "2px solid rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        padding: "16px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", height: "64px", width: "100%" }}>
                        {r.logos.map((logo, index) => (
                          <img key={index} src={logo} alt={r.name} style={{ maxHeight: "100%", maxWidth: r.logos.length > 1 ? "45%" : "100%", objectFit: "contain", filter: r.invert && r.invert[index] ? "brightness(0) invert(1)" : "none" }} />
                        ))}
                      </div>
                      <span style={{ color: form.restaurante === r.id ? "var(--color-gold)" : "#fff", fontWeight: 600, fontSize: "0.8rem", textAlign: "center", marginTop: "8px", lineHeight: "1.2" }}>{r.name}</span>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem", textAlign: "center", letterSpacing: "0.5px" }}>Nivel {r.location}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.stepButtons}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                  ← Atrás
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <span className="spinner" /> Generando...
                    </>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                        <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
                      </svg>
                      Obtener Movie Pass
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </main>
  );
}
