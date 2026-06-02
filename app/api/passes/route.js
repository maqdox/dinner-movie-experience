import { NextResponse } from "next/server";
import { readPasses, addPass } from "@/lib/store";
import { appendToSheet } from "@/lib/sheets";

function generatePassId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SPM-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  try {
    const passes = readPasses();
    return NextResponse.json({ passes });
  } catch (err) {
    return NextResponse.json({ error: "Error loading passes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, pelicula, personas, restaurante_id, restaurante_nombre, ticket_base64 } = body;

    // Validate required fields
    if (!nombre || !email || !telefono || !pelicula || !restaurante_id) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const pass = {
      id: generatePassId(),
      nombre,
      email,
      telefono,
      pelicula,
      personas: parseInt(personas) || 2,
      restaurante_id,
      restaurante_nombre,
      ticket_imagen: ticket_base64 ? "uploaded" : "none",
      estado: "activo",
      fecha_creacion: now.toISOString(),
      fecha_expiracion: expiration.toISOString(),
      fecha_redencion: null,
      monto_consumo: null,
      descuento_aplicado: null,
      personas_redencion: null,
    };

    // Save locally
    addPass(pass);

    // Also save to Google Sheets if configured
    await appendToSheet("movie_passes", pass);

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
