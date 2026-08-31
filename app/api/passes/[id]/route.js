import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const docRef = adminDb.collection("movie_passes").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Pass no encontrado" }, { status: 404 });
    }

    const pass = docSnap.data();

    // Check expiration
    if (pass.estado === "activo" && new Date(pass.fecha_expiracion) < new Date()) {
      pass.estado = "expirado";
      try {
        await docRef.update({ estado: "expirado" });
      } catch (updateErr) {
        console.warn("Failed to update expired status in DB, but continuing:", updateErr);
      }
    }

    return NextResponse.json({ pass });
  } catch (err) {
    console.error("Error fetching pass:", err);
    return NextResponse.json({ error: "Error al buscar pass" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const docRef = adminDb.collection("movie_passes").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Pass no encontrado" }, { status: 404 });
    }

    const pass = docSnap.data();

    if (pass.estado === "redimido") {
      return NextResponse.json({ error: "Este pass ya fue utilizado" }, { status: 400 });
    }

    if (pass.estado === "expirado" || new Date(pass.fecha_expiracion) < new Date()) {
      return NextResponse.json({ error: "Este pass ha expirado" }, { status: 400 });
    }

    const updates = {
      estado: "redimido",
      fecha_redencion: new Date().toISOString(),
      monto_consumo: body.monto_consumo || null,
      descuento_aplicado: body.descuento_aplicado || null,
      personas_redencion: body.personas_redencion || null,
    };

    await docRef.update(updates);

    return NextResponse.json({ success: true, pass: { ...pass, ...updates } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al redimir pass" }, { status: 500 });
  }
}
