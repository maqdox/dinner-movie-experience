"use client";

import styles from "./v2.module.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

const ChevronIcon = ({ size = 20, isOpen }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}
    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", color: "var(--v2-gold)", flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}
    style={{ color: "var(--v2-gold)", flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

import { RESTAURANTS } from "@/lib/constants";

const FAQ_ITEMS = [
  {
    question: "¿En cuáles sucursales de Metrocinemas aplica la promoción?",
    answer: "La promoción Blockbuster Summer aplica únicamente para compras realizadas en las siguientes sucursales de Metrocinemas en Tegucigalpa: Plaza América, Novacentro y Miraflores. Las compras realizadas en otras sucursales o ciudades no serán elegibles para generar un Movie Pass."
  },
  {
    question: "¿Cuál es la vigencia de la promoción?",
    answer: "La promoción Blockbuster Summer estará vigente del 18 de junio al 30 de agosto de 2026."
  },
  {
    question: "¿La promoción aplica para cualquier película o estreno?",
    answer: "Sí. La promoción aplica para cualquier película o estreno exhibido en Metrocinemas durante el período de vigencia de la campaña, sujeto a los términos y condiciones establecidos."
  },
  {
    question: "¿Qué restaurantes participan?",
    answer: "Actualmente participan 13 restaurantes y establecimientos gastronómicos ubicados en Ventu Life Center, ofreciendo una amplia variedad de experiencias gastronómicas. Puedes consultar la lista completa en la sección \"Restaurantes Participantes\"."
  },
  {
    question: "¿Cómo obtengo mi Movie Pass?",
    answer: "1. Compra tu ticket de cine en Metrocinemas Plaza América, Novacentro o Miraflores.\n2. Ingresa a la plataforma Blockbuster Summer.\n3. Registra tus datos y sube tu factura de compra.\n4. Selecciona el restaurante participante.\n5. Genera tu Movie Pass y disfruta tu beneficio."
  },
  {
    question: "¿Cuánto tiempo tengo para utilizar mi Movie Pass?",
    answer: "Tu Movie Pass deberá utilizarse dentro de los 5 días hábiles posteriores a la fecha y hora de emisión de tu factura de compra en Metrocinemas."
  },
  {
    question: "¿Qué necesito presentar para recibir mi descuento?",
    answer: "Para recibir tu beneficio deberás presentar tu Movie Pass vigente al momento de solicitar tu cuenta en el restaurante participante."
  },
  {
    question: "¿Cuántos Movie Pass puedo generar?",
    answer: "Se podrá generar un (1) Movie Pass por cada factura de compra de Metrocinemas registrada y aprobada."
  },
  {
    question: "¿Puedo utilizar varios Movie Pass al mismo tiempo?",
    answer: "No. Cada Movie Pass es individual y únicamente podrá aplicarse a una sola factura de consumo en un restaurante participante."
  },
  {
    question: "¿Puedo cambiar el restaurante seleccionado después de generar mi Movie Pass?",
    answer: "No. Una vez generado el Movie Pass y seleccionado el restaurante participante, no será posible realizar cambios."
  },
  {
    question: "¿Puedo combinar esta promoción con otras promociones o descuentos?",
    answer: "No. Esta promoción no puede utilizarse en conjunto con otras promociones, descuentos, beneficios o programas vigentes de Ventu o de los restaurantes participantes."
  },
  {
    question: "¿Aplica para bebidas alcohólicas?",
    answer: "No. Los descuentos y beneficios de Blockbuster Summer no aplican sobre bebidas alcohólicas."
  },
  {
    question: "¿Todos los restaurantes ofrecen el mismo descuento?",
    answer: "No. Los beneficios y porcentajes de descuento pueden variar según el restaurante participante. Cada establecimiento mostrará claramente el beneficio aplicable antes de la redención."
  },
  {
    question: "¿Existe un límite de consumo?",
    answer: "Sí. Los montos máximos de consumo elegibles para la promoción podrán variar según las condiciones establecidas por cada restaurante participante. Te recomendamos consultar las condiciones específicas antes de utilizar tu Movie Pass."
  },
  {
    question: "¿Qué hago si mi factura es rechazada o tengo problemas?",
    answer: "Te recomendamos intentar nuevamente verificando que la imagen de la factura de compra de Metrocinemas sea legible y que toda la información esté visible. Si el problema persiste, puedes contactarnos en: info@ventuhn.com"
  }
];

const EXPERIENCE_IMAGES = [
  { src: "/images/experience-ventu-night.png", alt: "Experiencia nocturna en Ventu Life Center" },
  { src: "/images/experience-muka.png", alt: "Experiencia gastronómica en Muka Café" },
  { src: "/images/experience-ventu-group.png", alt: "Amigos disfrutando en Ventu" },
  { src: "/images/experience-ventu-solo.png", alt: "Experiencia individual en Ventu" },
];

const BENEFITS = [
  "Hasta un 30% de descuento en restaurantes participantes de Ventu",
  "13 restaurantes participantes",
  "Válido con tickets Metrocinemas",
  "Proceso digital en minutos",
  "Vigente hasta 30 de agosto",
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
      <button className={styles.faqQuestion} onClick={onToggle} aria-expanded={isOpen}>
        <span>{item.question}</span>
        <ChevronIcon size={20} isOpen={isOpen} />
      </button>
      <div className={styles.faqAnswer} style={{ maxHeight: isOpen ? "500px" : "0px" }}>
        <div className={styles.faqAnswerInner}>
          {item.answer.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeV2() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className={styles.v2Root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogos}>
            <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={120} height={32} className={styles.logoMetro} />
            <span className={styles.headerX}>×</span>
            <Image src="/logos/ventu.png" alt="Ventu Life Center" width={41} height={45} className={styles.logoVentu} />
          </div>
          <nav className={styles.headerNav}>
            <a href="#estrenos">Experiencias</a>
            <a href="#como-funciona">Cómo Funciona</a>
            <a href="#restaurantes">Restaurantes</a>
            <Link href="/registro" className={`${styles.v2Btn} ${styles.v2BtnPrimary}`} style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
              Obtener Movie Pass
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/experience-ventu-night.png"
            alt="Ventu Life Center de noche"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroLogos}>
            <Image src="/logos/metrocinemas-blanco.png" alt="Metrocinemas" width={240} height={64} className={styles.heroLogoMetro} />
            <span className={styles.heroLogosX}>×</span>
            <Image src="/logos/ventu.png" alt="Ventu Life Center" width={100} height={100} className={styles.heroLogoVentu} />
          </div>
          <p className={styles.heroCampaignLabel}>
            Blockbuster Summer 2026 • 18 Jun — 30 Ago
          </p>
          <h1 className={styles.heroTitle}>
            Este Verano, Cada Estreno Tiene <br />
            <span className={styles.v2GoldGradient}>Una Segunda Función</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Después de la película, vive nuevas <strong>experiencias, sabores y momentos</strong> en Ventu. Presenta tu ticket de Metrocinemas y obtén hasta un <strong>30% de descuento</strong>.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/registro" className={`${styles.v2Btn} ${styles.v2BtnPrimary}`}>
              <TicketIcon size={18} className={styles.btnIcon} />
              Obtener Mi Movie Pass
            </Link>
            <a href="#como-funciona" className={`${styles.v2Btn} ${styles.v2BtnSecondary}`}>
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
              <span className={styles.heroStatNumber}>5</span>
              <span className={styles.heroStatLabel}>Días para Usar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estrenos / Experiencias */}
      <section id="estrenos" className={`${styles.v2Section} ${styles.experiences}`}>
        <div className={styles.v2Container}>
          <h2 className={styles.v2SectionTitle}>
            Grandes Estrenos del <span className={styles.v2GoldGradient}>Verano</span>
          </h2>
          <p className={styles.v2SectionSubtitle}>
            Este verano, cada estreno tiene una segunda función. Después de la película, vive nuevas experiencias, sabores y momentos en Ventu.
          </p>
          <div className={styles.experienceGrid}>
            {EXPERIENCE_IMAGES.map((img, i) => (
              <div key={i} className={styles.experienceCard}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={800}
                  className={styles.experienceImg}
                />
                <div className={styles.experienceOverlay} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className={`${styles.v2Section} ${styles.howItWorks}`}>
        <div className={styles.v2Container}>
          <h2 className={styles.v2SectionTitle}>
            ¿Cómo <span className={styles.v2GoldGradient}>Funciona</span>?
          </h2>
          <p className={styles.v2SectionSubtitle}>En solo 3 pasos simples, tu noche de cine se transforma en una experiencia gastronómica.</p>
          <div className={styles.steps}>
            {[
              { num: "1", icon: <ClapperboardIcon size={32} className={styles.stepSvg} />, title: "Ve al Cine", desc: "Disfruta cualquier película en Metrocinemas y guarda tu factura de compra." },
              { num: "2", icon: <PhoneTicketIcon size={32} className={styles.stepSvg} />, title: "Obtén tu Movie Pass", desc: "Sube tu factura y selecciona tu restaurante favorito en Ventu." },
              { num: "3", icon: <PlateCutleryIcon size={32} className={styles.stepSvg} />, title: "Disfruta tu Descuento", desc: "Presenta tu Movie Pass y recibe hasta un 30% de descuento en restaurantes de Ventu." },
            ].map((step, i) => (
              <div key={i} className={`${styles.v2GlassCard} ${styles.stepCard}`}>
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
      <section id="restaurantes" className={`${styles.v2Section} ${styles.restaurants}`}>
        <div className={styles.v2Container}>
          <h2 className={styles.v2SectionTitle}>
            Restaurantes <span className={styles.v2GoldGradient}>Participantes</span>
          </h2>
          <p className={styles.v2SectionSubtitle}>13 experiencias gastronómicas donde podrás disfrutar hasta un 30% de descuento al presentar tu Movie Pass.</p>
          <div className={styles.restaurantGrid}>
            {RESTAURANTS.map((r, i) => (
              <div key={i} className={`${styles.v2GlassCard} ${styles.restaurantCard}`}>
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
                  <span className={styles.v2Badge}>30% OFF</span>
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

      {/* CTA Final — Movie Pass */}
      <section className={styles.ctaSection}>
        <div className={styles.v2Container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2>¿Listo para Continuar <span className={styles.v2GoldGradient}>la Experiencia</span>?</h2>
              <p className={styles.ctaSubtext}>Obtén tu Movie Pass ahora y disfruta de los mejores sabores después del cine.</p>
              <ul className={styles.ctaBenefits}>
                {BENEFITS.map((b, i) => (
                  <li key={i}>
                    <CheckIcon size={18} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link href="/registro" className={`${styles.v2Btn} ${styles.v2BtnPrimary}`}>
                <TicketIcon size={18} className={styles.btnIcon} />
                Obtener Mi Movie Pass
              </Link>
            </div>
            <div className={styles.ctaImageWrap}>
              <Image
                src="/images/popcorn.png"
                alt="Popcorn"
                width={300}
                height={300}
                className={styles.ctaPopcorn}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`${styles.v2Section} ${styles.faqSection}`}>
        <div className={styles.v2Container}>
          <h2 className={styles.v2SectionTitle}>
            Preguntas <span className={styles.v2GoldGradient}>Frecuentes</span>
          </h2>
          <p className={styles.v2SectionSubtitle}>Todo lo que necesitas saber sobre Blockbuster Summer.</p>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
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
          <p className={styles.footerText}>Blockbuster Summer 2026 — Una alianza Metrocinemas × Ventu</p>
          <p className={styles.footerLinks}>
            <a href="mailto:info@ventuhn.com">info@ventuhn.com</a>
          </p>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
