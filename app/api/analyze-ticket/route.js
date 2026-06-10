import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    // Inicializa el SDK dentro de la función para evitar errores en tiempo de compilación (build)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
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
        "cine": "Nombre exacto de la sucursal del cine",
        "numero_transaccion": "El número de transacción, número de factura, boleto o recibo único que identifique este pago."
      }
      
      Reglas:
      1. "pelicula": El nombre de la película que el cliente fue a ver.
      2. "fecha": La fecha del ticket o de la función en formato "YYYY-MM-DD". Si no encuentras fecha explícita pero es obvia, infiérela.
      3. "cine": El nombre de la sucursal del cine (ej. "Metrocinemas Plaza América", "Metrocinemas Novacentro", "Metrocinemas Metromall", etc.).
      4. "numero_transaccion": El número de transacción, número de factura, boleto o recibo único que identifique este pago.

      Devuelve ÚNICAMENTE un objeto JSON válido con estas 4 llaves. Nada de explicaciones, ni Markdown extra.
      Ejemplo de salida:
      {
        "pelicula": "Inside Out 3",
        "fecha": "2024-06-08",
        "cine": "Metrocinemas Novacentro",
        "numero_transaccion": "FAC-00012345"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
