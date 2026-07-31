import express from "express";

const router = express.Router();

// POST /api/simulate/loan
// body: { principal: number, annualRatePercent: number, months: number }
// returns monthly EMI, total paid, and total interest - the core "true cost" numbers
router.post("/loan", (req, res) => {
  try {
    const { principal, annualRatePercent, months } = req.body;

    if (!principal || !annualRatePercent || !months) {
      return res
        .status(400)
        .json({ error: "principal, annualRatePercent, and months are required" });
    }

    const monthlyRate = annualRatePercent / 100 / 12;

    // Standard EMI formula
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPaid = emi * months;
    const totalInterest = totalPaid - principal;

    res.json({
      monthlyPayment: Math.round(emi * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      principal,
    });
  } catch (err) {
    console.error("Simulate loan error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/simulate/savings
// body: { principal: number, annualRatePercent: number, years: number }
// returns compound growth year by year - for the "why save early" visualization
router.post("/savings", (req, res) => {
  try {
    const { principal, annualRatePercent, years } = req.body;

    if (!principal || !annualRatePercent || !years) {
      return res
        .status(400)
        .json({ error: "principal, annualRatePercent, and years are required" });
    }

    const rate = annualRatePercent / 100;
    const yearByYear = [];
    let balance = principal;

    for (let year = 1; year <= years; year++) {
      balance = balance * (1 + rate);
      yearByYear.push({ year, balance: Math.round(balance * 100) / 100 });
    }

    res.json({ principal, yearByYear });
  } catch (err) {
    console.error("Simulate savings error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;