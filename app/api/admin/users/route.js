import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, restaurant_id, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Crear el usuario en Firebase Authentication (sin cerrar la sesión del admin actual)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Guardar el perfil y rol en Firestore (users collection)
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role: role || "restaurant",
      restaurant_id: restaurant_id || null,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 });
  }
}
