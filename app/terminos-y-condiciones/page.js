import Link from "next/link";
import styles from "../page.module.css";
import { ArrowLeftIcon } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones - Dinner & Movie Experience",
  description: "Términos y condiciones de la promoción",
};

export default function TerminosYCondiciones() {
  return (
    <div className={styles.v2Root} style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--v2-gold)", marginBottom: "32px", textDecoration: "none", fontWeight: "600" }}>
          <ArrowLeftIcon size={20} /> Volver al Inicio
        </Link>
        
        <h1 style={{ fontSize: "2.5rem", marginBottom: "24px", color: "#fff" }}>Términos y Condiciones</h1>
        <h2 style={{ fontSize: "1.2rem", color: "var(--v2-gold)", marginBottom: "40px" }}>Promoción: Blockbuster Summer</h2>
        
        <div style={{ color: "#ddd", lineHeight: "1.8", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "24px" }}>
          <p>
            El presente apartado establece los términos y condiciones (en adelante, los &quot;Términos&quot;) bajo los cuales se regirá la promoción denominada &quot;Blockbuster Summer&quot; (en adelante, la &quot;Promoción&quot;), organizada por Ventu Life Center (en adelante, el &quot;Organizador&quot;). La participación en esta Promoción implica el conocimiento y la aceptación incondicional de los presentes Términos.
          </p>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>1. Vigencia de la Promoción</h3>
            <p>La Promoción estará vigente y será válida todos los días de la semana, iniciando el 19 de junio de 2026 y finalizando el 31 de agosto de 2026.</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>2. Participantes</h3>
            <p>Podrán participar en la Promoción todas las personas naturales, mayores y menores de edad (acompañados de un adulto responsable para el consumo en restaurantes), que adquieran un boleto de entrada para cualquier función en Metrocinemas (ubicado en: Plaza América, Novacentro y Metromall Tegucigalpa) durante el período de vigencia de la Promoción.</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>3. Mecánica de la Promoción</h3>
            <p>Para ser acreedor al beneficio de la Promoción, el participante deberá cumplir con los siguientes pasos:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Paso 1:</strong> Adquirir al menos un (1) boleto de cine en Metrocinemas durante las fechas de vigencia.</li>
              <li><strong>Paso 2:</strong> Solicitar el movie pass en el sitio web vivirvizion.com</li>
              <li><strong>Paso 3:</strong> Visitar uno de los restaurantes participantes ubicados exclusivamente dentro de Ventu Life Center.</li>
              <li><strong>Paso 4:</strong> Presentar el movie pass al personal del restaurante antes de solicitar la cuenta.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>4. Beneficio</h3>
            <p>El beneficio consiste en otorgar un 30% de descuento directo sobre el valor total del consumo de alimentos y bebidas no alcohólicas en los restaurantes participantes dentro de Ventu Life Center.</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>5. Condiciones y Restricciones (Limitaciones)</h3>
            <p>Para garantizar la transparencia, el descuento estará sujeto a las siguientes restricciones:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Validez temporal:</strong> El boleto de Metrocinemas presentado debe corresponder a una función de una película de Metrocinemas y no tener mas de 5 dias de antiguedad previo a solicitud de Movie Pass, durante la vigencia de la promoción.</li>
              <li><strong>No acumulable:</strong> Este descuento no es acumulable con otras promociones, combos, ofertas vigentes en los restaurantes, ni con el descuento de la Ley Integral de Protección al Adulto Mayor y Jubilados (en cuyo caso, el cliente deberá elegir cuál de los dos descuentos desea aplicar a su cuenta).</li>
              <li><strong>Exclusiones de consumo:</strong> El descuento no aplica en el consumo de bebidas alcohólicas ni en el pago de propinas.</li>
              <li><strong>Aplicación por mesa:</strong> Se aplicará un (1) solo descuento por mesa o por cuenta. No se permitirán cuentas separadas en la misma mesa para aplicar múltiples descuentos con diferentes boletos de cine.</li>
              <li><strong>Uso único:</strong> El boleto de cine y/o cupón será sellado, marcado o registrado en el sistema del restaurante participante para evitar su reutilización.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>6. Restaurantes Participantes</h3>
            <p>El beneficio del 30% de descuento aplica únicamente en los siguientes establecimientos ubicados en Ventu Life Center:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>Mirawa</li>
              <li>Muka</li>
              <li>Tamago</li>
              <li>Limoncello</li>
              <li>Churrería Porfirio y Bahama</li>
              <li>Alegría</li>
              <li>Bendita Pizza</li>
              <li>Garibaldi Grill</li>
              <li>Tapachula</li>
              <li>Finca 8</li>
            </ul>
            <p style={{ marginTop: "8px", fontSize: "0.95em", opacity: 0.8 }}>(El Organizador se reserva el derecho de agregar o retirar restaurantes de esta lista, notificándolo a través de sus canales oficiales).</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>7. Modificaciones y Suspensión</h3>
            <p>De conformidad con lo establecido en la Ley de Protección al Consumidor de Honduras, Ventu Life Center se reserva el derecho de modificar los presentes Términos, así como de suspender o cancelar la Promoción por causas de fuerza mayor o caso fortuito, previa notificación a los consumidores a través de los mismos medios donde fue publicada la campaña.</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>8. Manejo de Datos Personales</h3>
            <p>Ventu Life Center garantiza que la información personal brindada por los clientes será tratada de manera confidencial y utilizada exclusivamente para fines analíticos y publicitarios propios de la marca, respetando el derecho a la privacidad de los participantes.</p>
          </div>

          <div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>9. Jurisdicción y Ley Aplicable</h3>
            <p>Cualquier controversia que surja en relación con la presente Promoción será resuelta de buena fe entre las partes. En caso de no llegar a un acuerdo, las partes se someterán a la jurisdicción de la Dirección General de Protección al Consumidor de Honduras o los tribunales competentes en la ciudad de Tegucigalpa, departamento de Francisco Morazán.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
