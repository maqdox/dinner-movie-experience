import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Inicializa el SDK. Automáticamente tomará process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

export async function POST(request) {
  try {
    const { image_base64 } = await request.json();

    if (!image_base64) {
      return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
    }

    // Extraer mimeType y data del data URL (ej. "data:image/jpeg;base64,/9j/4AAQ...")
    const matches = image_base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 });
    }

    const mimeType = matches[1];
    const data = matches[2];

    const prompt = `
      Analiza este ticket de cine y extrae la siguiente información en formato JSON estricto:
      {
        "pelicula": "Nombre de la película",
        "fecha": "Fecha del ticket en formato YYYY-MM-DD",
        "cine": "Nombre exacto de la sucursal del cine"
      }
      
      Reglas:
      1. Extrae el título de la película.
      2. Convierte la fecha al formato numérico YYYY-MM-DD (Ejemplo: si dice 06-jun-26, debe ser 2026-06-06).
      3. Extrae la sucursal del cine (ej. "Plaza America", "Novacentro", "Plaza Miraflores", etc).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        prompt,
        { inlineData: { mimeType, data } }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const result = JSON.parse(jsonText);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error analyzing ticket:", error);
    return NextResponse.json({ error: "Error analizando el ticket con IA" }, { status: 500 });
  }
}
