/**
 * Local JSON storage for development
 * In production, this is backed by Google Sheets via lib/sheets.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const PASSES_FILE = join(DATA_DIR, "passes.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readPasses() {
  ensureDir();
  if (!existsSync(PASSES_FILE)) return [];
  try {
    return JSON.parse(readFileSync(PASSES_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function writePasses(passes) {
  ensureDir();
  writeFileSync(PASSES_FILE, JSON.stringify(passes, null, 2));
}

export function findPass(id) {
  const passes = readPasses();
  return passes.find((p) => p.id === id) || null;
}

export function addPass(pass) {
  const passes = readPasses();
  passes.push(pass);
  writePasses(passes);
  return pass;
}

export function updatePass(id, updates) {
  const passes = readPasses();
  const index = passes.findIndex((p) => p.id === id);
  if (index === -1) return null;
  passes[index] = { ...passes[index], ...updates };
  writePasses(passes);
  return passes[index];
}
