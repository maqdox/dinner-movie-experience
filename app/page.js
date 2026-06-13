import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

const ClapperboardIcon = ({ className, size = 24 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M4 11h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
    <path d="m4 11 2-3h12l2 3" />
    <path d="m8 11 1.5-2" />
    <path d="m14 11 1.5-2" />
    <path d="m4 8 2-2.5h12l2 2.5" />
    <path d="m8 8 1.5-2.5" />
    <path d="m14 8 1.5-2.5" />
  </svg>
);

const TicketIcon = ({ className, size = 24 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const PhoneTicketIcon = ({ className, size = 24 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M12 18h.01" />
    <path d="M9 6h6" />
    <path d="M8 10a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2" />
    <path d="M16 10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2" />
    <path d="M10 12h4" />
  </svg>
);

const PlateCutleryIcon = ({ className, size = 24 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3Z" />
    <path d="M19 17v5" />
  </svg>
);

import { RESTAURANTS } from "@/lib/constants";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogos}>
            <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={120} height={32} className={styles.logoMetro} />
            <span className={styles.headerX}>×</span>
            <Image src="/logos/ventu.png" alt="Ventu Life Center" width={41} height={45} className={styles.logoVentu} />
          </div>
          <nav className={styles.headerNav}>
            <a href="#como-funciona">Cómo Funciona</a>
            <a href="#restaurantes">Restaurantes</a>
            <Link href="/registro" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
              Obtener Movie Pass
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroLogos}>
            <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={240} height={64} className={styles.heroLogoMetro} />
            <span className={styles.heroLogosX}>×</span>
            <Image src="/logos/ventu.png" alt="Ventu Life Center" width={100} height={100} className={styles.heroLogoVentu} />
          </div>
          <p className={styles.heroCampaignLabel}>
            Dinner & Movie Experience • Vigencia del 19 de Junio a Agosto
          </p>
          <h1 className={styles.heroTitle}>
            Tu Noche <br />
            <span className="gold-gradient">Continúa en Ventu</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Presenta tu ticket de Metrocinemas y obtén un <strong>30% de descuento</strong> en los mejores restaurantes de Ventu Life Center.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/registro" className="btn btn-primary">
              <TicketIcon size={18} className={styles.btnIcon} />
              Obtener Mi Movie Pass
            </Link>
            <a href="#como-funciona" className="btn btn-secondary">
              Saber Más
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>13</span>
              <span className={styles.heroStatLabel}>Restaurantes</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>30%</span>
              <span className={styles.heroStatLabel}>Descuento</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>48h</span>
              <span className={styles.heroStatLabel}>Para Usar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className={`section ${styles.howItWorks}`}>
        <div className="container">
          <h2 className="section-title">
            Cómo <span className="gold-gradient">Funciona</span>
          </h2>
          <p className="section-subtitle">En solo 3 pasos simples, tu noche de cine se transforma en una experiencia gastronómica.</p>
          <div className={styles.steps}>
            {[
              { num: "1", icon: <ClapperboardIcon size={32} className={styles.stepSvg} />, title: "Ve al Cine", desc: "Disfruta cualquier película en Metrocinemas y guarda tu ticket o comprobante de compra." },
              { num: "2", icon: <PhoneTicketIcon size={32} className={styles.stepSvg} />, title: "Obtén tu Movie Pass", desc: "Regístrate aquí, sube tu ticket y selecciona tu restaurante favorito en Ventu." },
              { num: "3", icon: <PlateCutleryIcon size={32} className={styles.stepSvg} />, title: "Disfruta tu Descuento", desc: "Presenta tu Movie Pass digital en el restaurante y obtén 30% de descuento en tu consumo." },
            ].map((step, i) => (
              <div key={i} className={`glass-card ${styles.stepCard} animate-fade-in-up stagger-${i + 1}`}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurantes */}
      <section id="restaurantes" className={`section ${styles.restaurants}`}>
        <div className="container">
          <h2 className="section-title">
            Restaurantes <span className="gold-gradient">Participantes</span>
          </h2>
          <p className="section-subtitle">Descubre la variedad gastronómica que Ventu Life Center tiene para ti.</p>
          <div className={styles.restaurantGrid}>
            {RESTAURANTS.map((r, i) => (
              <div key={i} className={`glass-card ${styles.restaurantCard}`}>
                <div className={styles.restaurantLogoContainer}>
                  {r.logos && r.logos.length > 0 ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                      {r.logos.map((logo, idx) => (
                        <img key={idx} src={logo} alt={r.name} style={{ maxHeight: "100%", maxWidth: r.logos.length > 1 ? "45%" : "100%", objectFit: "contain", filter: r.invert && r.invert[idx] ? "brightness(0) invert(1)" : "none" }} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.restaurantLogoPlaceholder}>
                      <span className={styles.placeholderEmoji}>🍽️</span>
                      <span className={styles.placeholderText}>{r.name}</span>
                    </div>
                  )}
                </div>
                <h3 className={styles.restaurantName}>{r.name}</h3>
                <p className={styles.restaurantType}>{r.type}</p>
                <div className={styles.restaurantMeta}>
                  <span className="badge badge-active">30% OFF</span>
                  <span className={styles.restaurantLocation}>📍 Nivel {r.location}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "12px", width: "100%", fontStyle: "italic" }}>
                  * Aplican restricciones en cada comercio.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2>¿Listo para tu experiencia?</h2>
            <p>Obtén tu Movie Pass ahora y disfruta de los mejores sabores después del cine.</p>
            <Link href="/registro" className="btn btn-primary">
              <TicketIcon size={18} className={styles.btnIcon} />
              Obtener Mi Movie Pass
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogos}>
            <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={100} height={28} className={styles.logoMetroFooter} />
            <span className={styles.headerX}>×</span>
            <Image src="/logos/ventu.png" alt="Ventu" width={48} height={52} className={styles.logoVentuFooter} />
          </div>
          <p className={styles.footerText}>Dinner & Movie Experience — Una alianza Metrocinemas × Ventu</p>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
