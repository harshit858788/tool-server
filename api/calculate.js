// api/calculate.js
// Vercel automatically exposes this as: POST https://your-app.vercel.app/api/calculate

const TOOLS = {

  emi: ({ principal, rate, tenure }) => {
    const r = rate / (12 * 100);
    const emi = principal * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
    const total = emi * tenure;
    return {
      monthly_emi: `₹${emi.toFixed(2)}`,
      total_payment: `₹${total.toFixed(2)}`,
      total_interest: `₹${(total - principal).toFixed(2)}`,
    };
  },

  gst: ({ amount, gstRate }) => {
    const gst = amount * gstRate / 100;
    return {
      gst_amount: `₹${gst.toFixed(2)}`,
      total_amount: `₹${(amount + gst).toFixed(2)}`,
    };
  },

  sip: ({ monthly, rate, years }) => {
    const r = rate / (12 * 100);
    const n = years * 12;
    const maturity = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = monthly * n;
    return {
      maturity_amount: `₹${maturity.toFixed(2)}`,
      total_invested: `₹${invested.toFixed(2)}`,
      wealth_gained: `₹${(maturity - invested).toFixed(2)}`,
    };
  },

  bmi: ({ weight, height }) => {
    const h = height / 100;
    const bmi = weight / (h * h);
    const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    return { bmi: bmi.toFixed(2), category };
  },

  // ── Add more tools here as you build them ──────────────────────────────────
};

export default function handler(req, res) {
  // Allow ElevenLabs to call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { tool_id, ...inputs } = req.body;

  if (!tool_id) {
    return res.status(400).json({ error: "tool_id is required in the request body." });
  }

  const tool = TOOLS[tool_id];
  if (!tool) {
    return res.status(404).json({ error: `Tool "${tool_id}" not found. Available: ${Object.keys(TOOLS).join(", ")}` });
  }

  try {
    // Convert numeric strings → numbers
    const parsed = Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => [k, isNaN(v) ? v : parseFloat(v)])
    );
    const result = tool(parsed);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Calculation error: " + err.message });
  }
}
