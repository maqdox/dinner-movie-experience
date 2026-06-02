import { NextResponse } from "next/server";
import { findPass, updatePass } from "@/lib/store";
import { updateSheet } from "@/lib/sheets";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pass = findPass(id);

    if (!pass) {
      return NextResponse.json({ error: "Pass no encontrado" }, { status: 404 });
    }

    // Check expiration
    if (pass.estado === "activo" && new Date(pass.fecha_expiracion) < new Date()) {
      pass.estado = "expirado";
      updatePass(id, { estado: "expirado" });
      await updateSheet("movie_passes", "id", id, { estado: "expirado" });
    }

    return NextResponse.json({ pass });
  } catch (err) {
    return NextResponse.json({ error: "Error al buscar pass" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pass = findPass(id);

    if (!pass) {
      return NextResponse.json({ error: "Pass no encontrado" }, { status: 404 });
    }

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

    const updated = updatePass(id, updates);
    await updateSheet("movie_passes", "id", id, updates);

    return NextResponse.json({ success: true, pass: updated });
  } catch (err) {
    return NextResponse.json({ error: "Error al redimir pass" }, { status: 500 });
  }
}
