import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const docRef = doc(db, "movie_passes", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Pass no encontrado" }, { status: 404 });
    }

    const pass = docSnap.data();

    // Check expiration
    if (pass.estado === "activo" && new Date(pass.fecha_expiracion) < new Date()) {
      pass.estado = "expirado";
      await updateDoc(docRef, { estado: "expirado" });
    }

    return NextResponse.json({ pass });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al buscar pass" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const docRef = doc(db, "movie_passes", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
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

    await updateDoc(docRef, updates);

    return NextResponse.json({ success: true, pass: { ...pass, ...updates } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al redimir pass" }, { status: 500 });
  }
}
