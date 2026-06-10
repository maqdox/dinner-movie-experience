import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, collection, getDocs, runTransaction, query, where } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const dynamic = 'force-dynamic';

async function generateSequentialPassId() {
  const counterRef = doc(db, "counters", "movie_passes");
  try {
    const newCount = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { count: 1 });
        return 1;
      }
      const nextCount = counterDoc.data().count + 1;
      transaction.update(counterRef, { count: nextCount });
      return nextCount;
    });
    // Devuelve un formato correlativo como SPM-00001
    return `SPM-${String(newCount).padStart(5, '0')}`;
  } catch (e) {
    console.error("Error generando ID correlativo:", e);
    // Fallback de seguridad en caso de que falle la transacción
    const random = Math.floor(10000 + Math.random() * 90000);
    return `SPM-${random}`;
  }
}

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "movie_passes"));
    const passes = [];
    querySnapshot.forEach((doc) => {
      passes.push(doc.data());
    });
    return NextResponse.json({ passes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error loading passes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, pelicula, personas, restaurante_id, restaurante_nombre, fecha_ticket, numero_transaccion, ticket_base64 } = body;

    // Validate required fields
    if (!nombre || !email || !telefono || !pelicula || !restaurante_id || !fecha_ticket || !numero_transaccion) {
      return NextResponse.json({ error: "Todos los campos son obligatorios, incluyendo el número de transacción" }, { status: 400 });
    }

    // Check for duplicate numero_transaccion
    const duplicateQuery = query(collection(db, "movie_passes"), where("numero_transaccion", "==", numero_transaccion));
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      return NextResponse.json({ error: "Este ticket o factura ya fue utilizado para generar un Movie Pass anteriormente." }, { status: 400 });
    }

    // Validar fecha del ticket
    const ticketDate = new Date(fecha_ticket);
    const serverNow = new Date();
    ticketDate.setHours(0, 0, 0, 0);
    const today = new Date(serverNow.getFullYear(), serverNow.getMonth(), serverNow.getDate());
    
    const diffTime = today - ticketDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || diffDays > 10) {
      return NextResponse.json({ error: "La fecha del ticket no es válida o excede los 10 días de antigüedad" }, { status: 400 });
    }

    const passId = await generateSequentialPassId();
    let ticketUrl = "none";

    // Upload image to Firebase Storage
    if (ticket_base64) {
      try {
        const storageRef = ref(storage, `tickets/${passId}`);
        await uploadString(storageRef, ticket_base64, 'data_url');
        ticketUrl = await getDownloadURL(storageRef);
      } catch (uploadErr) {
        console.error("Error subiendo imagen:", uploadErr);
        ticketUrl = "upload_failed";
      }
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const pass = {
      id: passId,
      nombre,
      email,
      telefono,
      pelicula,
      personas: parseInt(personas) || 2,
      restaurante_id,
      restaurante_nombre,
      ticket_imagen: ticketUrl,
      numero_transaccion,
      estado: "activo",
      fecha_ticket,
      fecha_creacion: now.toISOString(),
      fecha_expiracion: expiration.toISOString(),
      fecha_redencion: null,
      monto_consumo: null,
      descuento_aplicado: null,
      personas_redencion: null,
    };

    // Save to Firestore
    await setDoc(doc(db, "movie_passes", passId), pass);

    return NextResponse.json({
      success: true,
      id: pass.id,
      expiration: pass.fecha_expiracion,
    });
  } catch (err) {
    console.error("Error creating pass:", err);
    return NextResponse.json({ error: "Error al crear el pass" }, { status: 500 });
  }
}
