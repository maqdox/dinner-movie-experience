"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import styles from "./registro.module.css";

const RESTAURANTS = [
  { id: "mirawa", name: "Mirawa", type: "Oriental / China", location: "PB" },
  { id: "muka", name: "Muka", type: "Restaurante y Café", location: "PB" },
  { id: "entre-tiempo", name: "Entre Tiempo", type: "Restaurante y Bar", location: "PB" },
  { id: "el-morito", name: "El Morito", type: "Especialidad Mariscos", location: "N7" },
  { id: "tamago", name: "Tamago", type: "Comida Koreana", location: "N7" },
  { id: "puro-sabor", name: "Puro Sabor", type: "Buffet", location: "N7" },
  { id: "limoncello", name: "Limoncello", type: "Gourmet", location: "N7" },
  { id: "churreria-porfirio", name: "Churrería Porfirio & Heladería Bahama", type: "Cafetería y Heladería", location: "N7" },
  { id: "alegria", name: "Alegría", type: "Bistro y Café", location: "N8" },
  { id: "bendita-pizza", name: "Bendita Pizza", type: "Pizzas Gourmet", location: "N8" },
  { id: "garibaldi-grill", name: "Garibaldi Grill", type: "Mexicana Gourmet", location: "N8" },
  { id: "tapachula", name: "Tapachula", type: "Mexicana To Go", location: "N8" },
  { id: "f8", name: "Finca 8", type: "Especialidad en Cortes", location: "N8" },
];

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    pelicula: "",
    personas: "2",
    restaurante: "",
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
      setForm({ ...form, ticket: file });
      setFileName(file.name);
      setError("");

      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
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
          <Image src="/logos/metrocinemas.png" alt="Metrocinemas" width={90} height={24} />
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
                <label className="form-label" htmlFor="restaurante">Restaurante</label>
                <select
                  id="restaurante"
                  name="restaurante"
                  className="form-input"
                  value={form.restaurante}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un restaurante</option>
                  {RESTAURANTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.type} (Nivel {r.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ticket de Metrocinemas</label>
                <div className={`file-upload ${fileName ? "has-file" : ""}`}>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} />
                  {filePreview ? (
                    <div className={styles.filePreview}>
                      <img src={filePreview} alt="Preview" className={styles.previewImage} />
                      <p className={styles.fileName}>{fileName}</p>
                    </div>
                  ) : (
                    <>
                      <div className="file-upload-icon">📸</div>
                      <p className="file-upload-text">
                        <strong>Toca para subir</strong> tu ticket
                        <br />
                        Foto, screenshot o PDF (máx 5MB)
                      </p>
                    </>
                  )}
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
                    "🎟️ Obtener Movie Pass"
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
