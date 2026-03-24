// api/calculate.js
// Dynamic tool runner — no need to add tools manually ever again.
// The formula is sent in the request body itself from ElevenLabs.

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { formula, ...inputs } = req.body;

  if (!formula) {
    return res.status(400).json({ error: "formula is required in the request body." });
  }

  try {
    // Convert numeric strings to numbers
    const parsed = Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => [k, isNaN(v) ? v : parseFloat(v)])
    );

    // Dynamically run the formula with the inputs as variables
    const argNames = Object.keys(parsed);
    const argValues = Object.values(parsed);
    const fn = new Function(...argNames, `"use strict"; ${formula}`);
    const result = fn(...argValues);

    if (!result || typeof result !== "object") {
      return res.status(400).json({ error: "Formula must return an object." });
    }

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: "Calculation error: " + err.message });
  }
};
