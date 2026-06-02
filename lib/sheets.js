/**
 * Google Sheets API Bridge
 * Uses Google Apps Script as a REST API to read/write to Google Sheets
 * 
 * Set GOOGLE_SCRIPT_URL in .env.local to your deployed Apps Script Web App URL
 */

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";

/**
 * Send data to Google Sheets via Apps Script
 */
export async function appendToSheet(sheetName, rowData) {
  if (!SCRIPT_URL) {
    console.warn("[Sheets] GOOGLE_SCRIPT_URL not set — skipping write");
    return { success: true, skipped: true };
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "append",
        sheet: sheetName,
        data: rowData,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("[Sheets] Error writing:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Read data from Google Sheets via Apps Script
 */
export async function readSheet(sheetName, filters = {}) {
  if (!SCRIPT_URL) {
    console.warn("[Sheets] GOOGLE_SCRIPT_URL not set — skipping read");
    return [];
  }

  try {
    const params = new URLSearchParams({
      action: "read",
      sheet: sheetName,
      ...filters,
    });

    const res = await fetch(`${SCRIPT_URL}?${params}`, { cache: "no-store" });
    const data = await res.json();
    return data.rows || [];
  } catch (err) {
    console.error("[Sheets] Error reading:", err);
    return [];
  }
}

/**
 * Update a row in Google Sheets
 */
export async function updateSheet(sheetName, matchField, matchValue, updates) {
  if (!SCRIPT_URL) {
    console.warn("[Sheets] GOOGLE_SCRIPT_URL not set — skipping update");
    return { success: true, skipped: true };
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        sheet: sheetName,
        matchField,
        matchValue,
        updates,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("[Sheets] Error updating:", err);
    return { success: false, error: err.message };
  }
}
