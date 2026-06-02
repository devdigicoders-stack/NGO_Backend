// ─────────────────────────────────────────────────────────────
// utils/fileDb.js  —  JSON file-based database helper
// All models use this utility to read/write JSON data files
// ─────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config');

/**
 * Ensure the data directory exists (runs once on startup).
 */
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

/**
 * Read and parse a JSON data file.
 * @param {string} filename  e.g. 'programs.json'
 * @returns {Array|Object}   Parsed JSON or empty array on error
 */
const readFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Serialize and write data to a JSON data file.
 * @param {string}        filename  e.g. 'programs.json'
 * @param {Array|Object}  data      Data to persist
 */
const writeFile = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { ensureDataDir, readFile, writeFile };
