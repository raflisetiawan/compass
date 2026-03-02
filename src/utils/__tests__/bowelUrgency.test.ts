import { describe, it, expect } from "vitest";
import bowelUrgencyData from "../../assets/problem_with_bowel_urgency.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type UrgencyOutcome = {
  N: number;
  "No_problem_%": number;
  "Very_small_problem_%": number;
  "Moderate_big_problem_%": number;
};

type TreatmentUrgency = {
  Totals: { Total: number; No_problem: number; Very_small_problem: number; Moderate_big_problem: number };
  Baseline: {
    No_problem: UrgencyOutcome;
    Very_small_problem: UrgencyOutcome;
    Moderate_big_problem: UrgencyOutcome;
  };
};

type BowelUrgencyData = {
  Active_Surveillance: TreatmentUrgency;
  Focal: TreatmentUrgency;
  Surgery: TreatmentUrgency;
  EBRT: TreatmentUrgency;
};

const data = bowelUrgencyData as BowelUrgencyData;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps questionnaire answer to baseline key.
 * Mirrors the FIXED logic in ProblemWithUrgencyPage.tsx.
 */
type BaselineKey = "No_problem" | "Very_small_problem" | "Moderate_big_problem";

const mapToBaselineStatus = (bowelUrgency: string): BaselineKey => {
  const u = String(bowelUrgency);
  if (u.includes("No problem") || u.includes("Not a problem")) return "No_problem";
  if (u.includes("Very") || u.includes("Small") || u.includes("small")) return "Very_small_problem";
  if (u.includes("Moderate") || u.includes("Big") || u.includes("big")) return "Moderate_big_problem";
  return "No_problem";
};

const getOutcome = (
  treatment: keyof BowelUrgencyData,
  baseline: "No_problem" | "Very_small_problem" | "Moderate_big_problem"
): UrgencyOutcome => data[treatment].Baseline[baseline];

// ─── Questionnaire options ────────────────────────────────────────────────────
// From questionnaire.json: ["No problem", "Very small problem", "Small problem", "Moderate problem", "Big problem"]

const TREATMENTS = ["Active_Surveillance", "Focal", "Surgery", "EBRT"] as const;

// ─── Section 1: Baseline status mapping ──────────────────────────────────────

describe("Bowel Urgency - Baseline Status Mapping (Website Fix)", () => {
  describe("'No problem' questionnaire answer", () => {
    it("maps 'No problem' → No_problem", () => {
      expect(mapToBaselineStatus("No problem")).toBe("No_problem");
    });
  });

  describe("'Very small problem' questionnaire answer", () => {
    it("maps 'Very small problem' → Very_small_problem", () => {
      expect(mapToBaselineStatus("Very small problem")).toBe("Very_small_problem");
    });
    it("maps 'Small problem' → Very_small_problem", () => {
      expect(mapToBaselineStatus("Small problem")).toBe("Very_small_problem");
    });
  });

  describe("'Moderate / Big problem' questionnaire answers", () => {
    it("maps 'Moderate problem' → Moderate_big_problem", () => {
      expect(mapToBaselineStatus("Moderate problem")).toBe("Moderate_big_problem");
    });
    it("maps 'Big problem' → Moderate_big_problem", () => {
      expect(mapToBaselineStatus("Big problem")).toBe("Moderate_big_problem");
    });
  });

  it("OLD BROKEN logic would have mapped 'Very small problem' to No_problem (regression guard)", () => {
    // The old code used: urgency === "Very small" || urgency === "Small"
    // which never matched "Very small problem" → defaulted to No_problem (WRONG)
    // The new code uses .includes("Very") which correctly matches "Very small problem"
    const correctResult = mapToBaselineStatus("Very small problem");
    expect(correctResult).toBe("Very_small_problem");
    expect(correctResult).not.toBe("No_problem"); // This was the old bug
  });

  it("OLD BROKEN logic would have mapped 'Moderate problem' to No_problem (regression guard)", () => {
    // Old code: urgency === "Moderate" never matched "Moderate problem"
    const correctResult = mapToBaselineStatus("Moderate problem");
    expect(correctResult).toBe("Moderate_big_problem");
    expect(correctResult).not.toBe("No_problem"); // This was the old bug
  });

  it("OLD BROKEN logic would have mapped 'Big problem' to No_problem (regression guard)", () => {
    // Old code: urgency === "Big problem" — this one would have matched,
    // but here we confirm the new code also matches it
    const correctResult = mapToBaselineStatus("Big problem");
    expect(correctResult).toBe("Moderate_big_problem");
  });

  it("All 5 questionnaire options map to a distinct/correct bucket", () => {
    expect(mapToBaselineStatus("No problem")).toBe("No_problem");
    expect(mapToBaselineStatus("Very small problem")).toBe("Very_small_problem");
    expect(mapToBaselineStatus("Small problem")).toBe("Very_small_problem");
    expect(mapToBaselineStatus("Moderate problem")).toBe("Moderate_big_problem");
    expect(mapToBaselineStatus("Big problem")).toBe("Moderate_big_problem");
  });
});

// ─── Section 2: JSON structure validation ────────────────────────────────────

describe("Bowel Urgency JSON - Structure", () => {
  const BASELINES = ["No_problem", "Very_small_problem", "Moderate_big_problem"] as const;

  TREATMENTS.forEach((treatment) => {
    describe(treatment, () => {
      it("has Baseline with all 3 expected keys", () => {
        const keys = Object.keys(data[treatment].Baseline);
        BASELINES.forEach((key) => expect(keys).toContain(key));
      });

      BASELINES.forEach((baseline) => {
        it(`baseline '${baseline}' has N > 0 and all 3 percentage keys`, () => {
          const outcome = getOutcome(treatment, baseline);
          expect(outcome.N).toBeGreaterThan(0);
          expect(typeof outcome["No_problem_%"]).toBe("number");
          expect(typeof outcome["Very_small_problem_%"]).toBe("number");
          expect(typeof outcome["Moderate_big_problem_%"]).toBe("number");
        });

        it(`baseline '${baseline}' percentages sum to approximately 100`, () => {
          const outcome = getOutcome(treatment, baseline);
          const sum =
            outcome["No_problem_%"] +
            outcome["Very_small_problem_%"] +
            outcome["Moderate_big_problem_%"];
          expect(sum).toBeGreaterThanOrEqual(98);
          expect(sum).toBeLessThanOrEqual(102);
        });
      });
    });
  });
});

// ─── Section 3: Data values vs reference (bowel-urgency.md) ──────────────────

describe("Bowel Urgency - Data Verification (vs bowel-urgency.md reference)", () => {
  describe("Active Surveillance (Table 1)", () => {
    it("No problem: N=101, 74% no / 23% very-small / 3% moderate-big", () => {
      const d = getOutcome("Active_Surveillance", "No_problem");
      expect(d.N).toBe(101);
      expect(d["No_problem_%"]).toBe(74);
      expect(d["Very_small_problem_%"]).toBe(23);
      expect(d["Moderate_big_problem_%"]).toBe(3);
    });
    it("Very/small problem: N=51, 33% / 51% / 16%", () => {
      const d = getOutcome("Active_Surveillance", "Very_small_problem");
      expect(d.N).toBe(51);
      expect(d["No_problem_%"]).toBe(33);
      expect(d["Very_small_problem_%"]).toBe(51);
      expect(d["Moderate_big_problem_%"]).toBe(16);
    });
    it("Moderate/big problem: N=6, 50% / 33% / 17%", () => {
      const d = getOutcome("Active_Surveillance", "Moderate_big_problem");
      expect(d.N).toBe(6);
      expect(d["No_problem_%"]).toBe(50);
      expect(d["Very_small_problem_%"]).toBe(33);
      expect(d["Moderate_big_problem_%"]).toBe(17);
    });
  });

  describe("Focal Therapy (Table 2)", () => {
    it("No problem: N=162, 77% / 19% / 4%", () => {
      const d = getOutcome("Focal", "No_problem");
      expect(d.N).toBe(162);
      expect(d["No_problem_%"]).toBe(77);
      expect(d["Very_small_problem_%"]).toBe(19);
      expect(d["Moderate_big_problem_%"]).toBe(4);
    });
    it("Very/small problem: N=32, 47% / 44% / 9%", () => {
      const d = getOutcome("Focal", "Very_small_problem");
      expect(d.N).toBe(32);
      expect(d["No_problem_%"]).toBe(47);
      expect(d["Very_small_problem_%"]).toBe(44);
      expect(d["Moderate_big_problem_%"]).toBe(9);
    });
    it("Moderate/big problem: N=7, 14% / 72% / 14%", () => {
      const d = getOutcome("Focal", "Moderate_big_problem");
      expect(d.N).toBe(7);
      expect(d["No_problem_%"]).toBe(14);
      expect(d["Very_small_problem_%"]).toBe(72);
      expect(d["Moderate_big_problem_%"]).toBe(14);
    });
  });

  describe("Surgery (Table 3)", () => {
    it("No problem: N=234, 85% / 13% / 2%", () => {
      const d = getOutcome("Surgery", "No_problem");
      expect(d.N).toBe(234);
      expect(d["No_problem_%"]).toBe(85);
      expect(d["Very_small_problem_%"]).toBe(13);
      expect(d["Moderate_big_problem_%"]).toBe(2);
    });
    it("Very/small problem: N=46, 59% / 37% / 4%", () => {
      const d = getOutcome("Surgery", "Very_small_problem");
      expect(d.N).toBe(46);
      expect(d["No_problem_%"]).toBe(59);
      expect(d["Very_small_problem_%"]).toBe(37);
      expect(d["Moderate_big_problem_%"]).toBe(4);
    });
    it("Moderate/big problem: N=11, 18% / 45% / 37%", () => {
      const d = getOutcome("Surgery", "Moderate_big_problem");
      expect(d.N).toBe(11);
      expect(d["No_problem_%"]).toBe(18);
      expect(d["Very_small_problem_%"]).toBe(45);
      expect(d["Moderate_big_problem_%"]).toBe(37);
    });
  });

  describe("Radiotherapy / EBRT (Table 4)", () => {
    it("No problem: N=267, 58% / 30% / 12%", () => {
      const d = getOutcome("EBRT", "No_problem");
      expect(d.N).toBe(267);
      expect(d["No_problem_%"]).toBe(58);
      expect(d["Very_small_problem_%"]).toBe(30);
      expect(d["Moderate_big_problem_%"]).toBe(12);
    });
    it("Very/small problem: N=96, 12% / 65% / 23%", () => {
      const d = getOutcome("EBRT", "Very_small_problem");
      expect(d.N).toBe(96);
      expect(d["No_problem_%"]).toBe(12);
      expect(d["Very_small_problem_%"]).toBe(65);
      expect(d["Moderate_big_problem_%"]).toBe(23);
    });
    it("Moderate/big problem: N=14, 43% / 7% / 50%", () => {
      const d = getOutcome("EBRT", "Moderate_big_problem");
      expect(d.N).toBe(14);
      expect(d["No_problem_%"]).toBe(43);
      expect(d["Very_small_problem_%"]).toBe(7);
      expect(d["Moderate_big_problem_%"]).toBe(50);
    });
  });
});

// ─── Section 4: End-to-end (questionnaire → lookup → correct data) ───────────

describe("Bowel Urgency - End-to-end Questionnaire to Data Lookup", () => {
  it("Patient 'Very small problem' → AS: 33% no problem, 51% very-small, 16% moderate-big", () => {
    const baseline = mapToBaselineStatus("Very small problem");
    expect(baseline).toBe("Very_small_problem");
    const d = getOutcome("Active_Surveillance", baseline);
    expect(d["No_problem_%"]).toBe(33);
    expect(d["Very_small_problem_%"]).toBe(51);
    expect(d["Moderate_big_problem_%"]).toBe(16);
  });

  it("Patient 'Small problem' → Focal: 47% no problem, 44% very-small, 9% moderate-big", () => {
    const baseline = mapToBaselineStatus("Small problem");
    expect(baseline).toBe("Very_small_problem");
    const d = getOutcome("Focal", baseline);
    expect(d["No_problem_%"]).toBe(47);
    expect(d["Very_small_problem_%"]).toBe(44);
    expect(d["Moderate_big_problem_%"]).toBe(9);
  });

  it("Patient 'Moderate problem' → EBRT: 43% no problem, 7% very-small, 50% moderate-big", () => {
    const baseline = mapToBaselineStatus("Moderate problem");
    expect(baseline).toBe("Moderate_big_problem");
    const d = getOutcome("EBRT", baseline);
    expect(d["No_problem_%"]).toBe(43);
    expect(d["Very_small_problem_%"]).toBe(7);
    expect(d["Moderate_big_problem_%"]).toBe(50);
  });

  it("Patient 'Big problem' → Surgery: 18% no problem, 45% very-small, 37% moderate-big", () => {
    const baseline = mapToBaselineStatus("Big problem");
    expect(baseline).toBe("Moderate_big_problem");
    const d = getOutcome("Surgery", baseline);
    expect(d["No_problem_%"]).toBe(18);
    expect(d["Very_small_problem_%"]).toBe(45);
    expect(d["Moderate_big_problem_%"]).toBe(37);
  });

  it("Patient 'No problem' → EBRT: 58% no problem, 30% very-small, 12% moderate-big", () => {
    const baseline = mapToBaselineStatus("No problem");
    expect(baseline).toBe("No_problem");
    const d = getOutcome("EBRT", baseline);
    expect(d["No_problem_%"]).toBe(58);
    expect(d["Very_small_problem_%"]).toBe(30);
    expect(d["Moderate_big_problem_%"]).toBe(12);
  });

  it("'Very small problem' and 'Small problem' both resolve to the same data", () => {
    const k1 = mapToBaselineStatus("Very small problem");
    const k2 = mapToBaselineStatus("Small problem");
    expect(k1).toBe(k2);
    expect(k1).toBe("Very_small_problem");
  });

  it("'Moderate problem' and 'Big problem' both resolve to the same data", () => {
    const k1 = mapToBaselineStatus("Moderate problem");
    const k2 = mapToBaselineStatus("Big problem");
    expect(k1).toBe(k2);
    expect(k1).toBe("Moderate_big_problem");
  });
});
