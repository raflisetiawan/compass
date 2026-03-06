import { describe, it, expect } from "vitest";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";

// ─── Helpers ───

/** Look up a survival entry the same way the webpage & PDF do. */
const findSurvivalEntry = (
  ageGroup: string,
  tStage: string,
  gradeGroup: number,
  psaRange: string
): SurvivalData | undefined =>
  (survivalData.Survival as SurvivalData[]).find(
    (item) =>
      item["Age Group"] === ageGroup &&
      String(item["T Stage"]) === tStage &&
      item["Grade Group"] === gradeGroup &&
      item["PSA"] === psaRange
  );

/** Simulate the full pipeline: raw patient inputs → lookup result. */
const simulateLookup = (
  age: number,
  cancerStage: string,
  gleasonScore: string,
  psa: number
) => {
  const tStage = cancerStage.replace("T", "");
  if (tStage === "4" || tStage === "Unknown") return null;
  const effectiveTStage =
    tStage === "1 or 2" || tStage.toLowerCase().includes("1 or t2")
      ? "2"
      : tStage;

  const ageGroup = getAgeGroup(age);
  const psaRange = getPSARange(psa);
  const gradeGroup = getGradeGroup(gleasonScore);

  let result = findSurvivalEntry(ageGroup, effectiveTStage, gradeGroup, psaRange);

  // Fallback for Grade Group 1 → try Grade Group 2
  if ((!result || result["Alive (%)"] === "" || result["Alive (%)"] == null) && gradeGroup === 1) {
    result = findSurvivalEntry(ageGroup, effectiveTStage, 2, psaRange);
  }

  return result ?? null;
};

// ═══════════════════════════════════════════════════════
// 1. JSON Data Integrity — matches CSV source
// ═══════════════════════════════════════════════════════
describe("Survival JSON Data Integrity", () => {
  it("should contain 243 entries (matching CSV rows minus insufficient data)", () => {
    expect(survivalData.Survival.length).toBe(243);
  });

  it("should have exactly 6 age groups", () => {
    const ageGroups = [...new Set(survivalData.Survival.map((e) => e["Age Group"]))];
    expect(ageGroups.sort()).toEqual(["0-59", "60-", "65-", "70-", "75-", "80-"]);
  });

  it("should have T Stages 2, 3a, 3b", () => {
    const tStages = [...new Set(survivalData.Survival.map((e) => String(e["T Stage"])))];
    expect(tStages.sort()).toEqual(["2", "3a", "3b"]);
  });

  it("should have Grade Groups 1-5", () => {
    const grades = [...new Set(survivalData.Survival.map((e) => e["Grade Group"]))].sort();
    expect(grades).toEqual([1, 2, 3, 4, 5]);
  });

  it("should have PSA ranges 0-, 10-, 20-", () => {
    const psa = [...new Set(survivalData.Survival.map((e) => e["PSA"]))].sort();
    expect(psa).toEqual(["0-", "10-", "20-"]);
  });

  it("all Alive (%) + PCa Death (%) + Other Death (%) ≈ 100 for each entry", () => {
    for (const entry of survivalData.Survival as SurvivalData[]) {
      const alive = Number(entry["Alive (%)"]);
      const pca = Number(entry["PCa Death (%)"]);
      const other = Number(entry["Other Death (%)"]);
      const total = alive + pca + other;
      expect(total).toBeCloseTo(100, 0); // within rounding
    }
  });

  it("Alive (n) + PCa Death (n) + Other Death (n) === Total (N) for each entry", () => {
    for (const entry of survivalData.Survival as SurvivalData[]) {
      const totalN = Number(entry["Total (N)"]);
      const aliveN = Number(entry["Alive (n)"]);
      const pcaN = Number(entry["PCa Death (n)"]);
      const otherN = Number(entry["Other Death (n)"]);
      expect(aliveN + pcaN + otherN).toBe(totalN);
    }
  });
});

// ═══════════════════════════════════════════════════════
// 2. getAgeGroup — Mapping Tests
// ═══════════════════════════════════════════════════════
describe("getAgeGroup Mapping", () => {
  const cases: [number, string][] = [
    [50, "0-59"],
    [59, "0-59"],
    [60, "60-"],
    [64, "60-"],
    [65, "65-"],
    [69, "65-"],
    [70, "70-"],
    [74, "70-"],
    [75, "75-"],
    [79, "75-"],
    [80, "80-"],
    [90, "80-"],
  ];

  for (const [age, expected] of cases) {
    it(`age ${age} → "${expected}"`, () => {
      expect(getAgeGroup(age)).toBe(expected);
    });
  }
});

// ═══════════════════════════════════════════════════════
// 3. getPSARange — Mapping Tests
// ═══════════════════════════════════════════════════════
describe("getPSARange Mapping", () => {
  const cases: [number, string][] = [
    [1, "0-"],
    [5, "0-"],
    [9.9, "0-"],
    [10, "10-"],
    [15, "10-"],
    [19.9, "10-"],
    [20, "20-"],
    [50, "20-"],
  ];

  for (const [psa, expected] of cases) {
    it(`PSA ${psa} → "${expected}"`, () => {
      expect(getPSARange(psa)).toBe(expected);
    });
  }
});

// ═══════════════════════════════════════════════════════
// 4. getGradeGroup — Mapping Tests
// ═══════════════════════════════════════════════════════
describe("getGradeGroup Mapping", () => {
  const cases: [string, number][] = [
    ["3+3", 1],
    ["3+4", 2],
    ["4+3", 3],
    ["4+4", 4],
    ["4+4 / 3+5 / 5+3", 4],
    ["4+4 or 3+5 or 5+3", 4],  // questionnaire format
    ["4+5", 5],
    ["5+4", 5],
    ["4+5 / 5+4 / 5+5", 5],
    ["4+5 or 5+4 or 5+5", 5],  // questionnaire format
  ];

  for (const [gleason, expected] of cases) {
    it(`Gleason ${gleason} → Grade Group ${expected}`, () => {
      expect(getGradeGroup(gleason)).toBe(expected);
    });
  }
});

// ═══════════════════════════════════════════════════════
// 5. End-to-End Lookup — Website Data Verification
//    Verifies that patient inputs produce the exact
//    expected values from the CSV source.
// ═══════════════════════════════════════════════════════
describe("End-to-End Survival Lookup (matching CSV data)", () => {
  describe("Age 0-59 group", () => {
    it("Age 55, T2, Gleason 3+3, PSA 5 → Alive 98.68%", () => {
      const result = simulateLookup(55, "T2", "3+3", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(98.68);
      expect(result!["PCa Death (%)"]).toBe(0.06);
      expect(result!["Other Death (%)"]).toBe(1.26);
      expect(result!["Total (N)"]).toBe(3172);
    });

    it("Age 50, T2, Gleason 4+5, PSA 25 → Alive 81.36%", () => {
      const result = simulateLookup(50, "T2", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(81.36);
      expect(result!["PCa Death (%)"]).toBe(8.47);
      expect(result!["Other Death (%)"]).toBe(10.17);
    });

    it("Age 58, T3a, Gleason 4+3, PSA 25 → Alive 92.71%", () => {
      const result = simulateLookup(58, "T3a", "4+3", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(92.71);
    });

    it("Age 55, T3b, Gleason 3+4, PSA 15 → Alive 95.65%", () => {
      const result = simulateLookup(55, "T3b", "3+4", 15);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(95.65);
    });
  });

  describe("Age 60- group", () => {
    it("Age 62, T2, Gleason 3+3, PSA 5 → Alive 97.20%", () => {
      const result = simulateLookup(62, "T2", "3+3", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(97.2);
      expect(result!["Total (N)"]).toBe(2289);
    });

    it("Age 63, T3a, Gleason 4+5, PSA 25 → Alive 90.98%", () => {
      const result = simulateLookup(63, "T3a", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(90.98);
    });

    it("Age 64, T3b, Gleason 4+5, PSA 25 → Alive 82.52%", () => {
      const result = simulateLookup(64, "T3b", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(82.52);
    });
  });

  describe("Age 65- group", () => {
    it("Age 66, T2, Gleason 3+4, PSA 5 → Alive 95.53%", () => {
      const result = simulateLookup(66, "T2", "3+4", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(95.53);
      expect(result!["Total (N)"]).toBe(3285);
    });

    it("Age 68, T2, Gleason 4+4, PSA 15 → Alive 93.15%", () => {
      const result = simulateLookup(68, "T2", "4+4", 15);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(93.15);
    });

    it("Age 67, T3b, Gleason 4+5, PSA 25 → Alive 83.98%", () => {
      const result = simulateLookup(67, "T3b", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(83.98);
    });
  });

  describe("Age 70- group", () => {
    it("Age 72, T2, Gleason 3+3, PSA 5 → Alive 92.40%", () => {
      const result = simulateLookup(72, "T2", "3+3", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(92.4);
      expect(result!["Total (N)"]).toBe(2250);
    });

    it("Age 73, T3a, Gleason 4+3, PSA 15 → Alive 86.99%", () => {
      const result = simulateLookup(73, "T3a", "4+3", 15);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(86.99);
    });

    it("Age 74, T3b, Gleason 4+5, PSA 25 → Alive 87.08%", () => {
      const result = simulateLookup(74, "T3b", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(87.08);
    });
  });

  describe("Age 75- group", () => {
    it("Age 76, T2, Gleason 3+3, PSA 5 → Alive 86.66%", () => {
      const result = simulateLookup(76, "T2", "3+3", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(86.66);
      expect(result!["Total (N)"]).toBe(1147);
    });

    it("Age 78, T3a, Gleason 4+5, PSA 25 → Alive 71.11%", () => {
      const result = simulateLookup(78, "T3a", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(71.11);
    });

    it("Age 79, T3b, Gleason 4+5, PSA 25 → Alive 74.57%", () => {
      const result = simulateLookup(79, "T3b", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(74.57);
    });
  });

  describe("Age 80- group", () => {
    it("Age 82, T2, Gleason 3+3, PSA 5 → Alive 78.80%", () => {
      const result = simulateLookup(82, "T2", "3+3", 5);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(78.8);
      expect(result!["Total (N)"]).toBe(217);
    });

    it("Age 85, T2, Gleason 4+5, PSA 25 → Alive 59.55%", () => {
      const result = simulateLookup(85, "T2", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(59.55);
    });

    it("Age 80, T3a, Gleason 4+5, PSA 25 → Alive 55.00%", () => {
      const result = simulateLookup(80, "T3a", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(55);
    });

    it("Age 83, T3b, Gleason 4+5, PSA 25 → Alive 68.06%", () => {
      const result = simulateLookup(83, "T3b", "4+5", 25);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(68.06);
    });
  });
});

// ═══════════════════════════════════════════════════════
// 6. T1 or T2 Handling — maps to T2
// ═══════════════════════════════════════════════════════
describe("T1 or T2 → T2 mapping", () => {
  it("'T1 or T2' should return same data as 'T2'", () => {
    const resultT1orT2 = simulateLookup(55, "T1 or T2", "3+3", 5);
    const resultT2 = simulateLookup(55, "T2", "3+3", 5);
    expect(resultT1orT2).toEqual(resultT2);
    expect(resultT1orT2).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════
// 7. Unsupported T Stages — T4 / Unknown → null
// ═══════════════════════════════════════════════════════
describe("Unsupported T Stages return null", () => {
  it("T4 returns null", () => {
    expect(simulateLookup(65, "T4", "3+4", 10)).toBeNull();
  });

  it("Unknown returns null", () => {
    expect(simulateLookup(65, "TUnknown", "3+4", 10)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════
// 8. Insufficient Data Fallback — Grade 1, T3b
//    should fall back to Grade 2 (or null if also missing)
// ═══════════════════════════════════════════════════════
describe("Insufficient Data Fallback", () => {
  it("0-59, T3b, Grade 1, PSA 0- → insufficient → fallback to Grade 2 (95.00%)", () => {
    // CSV: 0-59, 3b, Grade 1, PSA 0- = insufficient
    // CSV: 0-59, 3b, Grade 2, PSA 0- = 95.00%
    const result = simulateLookup(55, "T3b", "3+3", 5);
    expect(result).not.toBeNull();
    // Falls back to Grade 2
    expect(result!["Grade Group"]).toBe(2);
    expect(result!["Alive (%)"]).toBe(95);
  });

  it("80-, T3b, Grade 1, PSA 0- → insufficient → fallback also insufficient → null", () => {
    // CSV: 80-, 3b, 1, PSA 0- = insufficient
    // CSV: 80-, 3b, 2, PSA 0- = also insufficient
    const result = simulateLookup(85, "T3b", "3+3", 5);
    expect(result).toBeNull();
  });

  it("60-, T3a, Grade 1, PSA 20- → insufficient → fallback to Grade 2 (94.85%)", () => {
    // CSV: 60-, 3a, 1, PSA 20- = insufficient
    // CSV: 60-, 3a, 2, PSA 20- = 94.85%
    const result = simulateLookup(63, "T3a", "3+3", 25);
    expect(result).not.toBeNull();
    expect(result!["Grade Group"]).toBe(2);
    expect(result!["Alive (%)"]).toBe(94.85);
  });
});

// ═══════════════════════════════════════════════════════
// 9. Webpage Display Formatting — matches SurvivalDataTable
// ═══════════════════════════════════════════════════════
describe("Webpage Display Formatting", () => {
  it("Alive (%) displayed with 2 decimal places", () => {
    const result = simulateLookup(55, "T2", "3+3", 5);
    expect(result).not.toBeNull();
    const formatted = Number(result!["Alive (%)"]).toFixed(2);
    expect(formatted).toBe("98.68");
  });

  it("PCa Death (%) displayed with 2 decimal places", () => {
    const result = simulateLookup(55, "T2", "3+3", 5);
    expect(result).not.toBeNull();
    const formatted = Number(result!["PCa Death (%)"]).toFixed(2);
    expect(formatted).toBe("0.06");
  });

  it("Values like 100.00 format correctly", () => {
    // 0-59, T2, Grade 4, PSA 10- = 100.00%
    const result = simulateLookup(55, "T2", "4+4", 15);
    expect(result).not.toBeNull();
    const formatted = Number(result!["Alive (%)"]).toFixed(2);
    expect(formatted).toBe("100.00");
  });

  it("IconArray data sums to ~100%", () => {
    const result = simulateLookup(72, "T2", "3+4", 5);
    expect(result).not.toBeNull();
    const alive = Number(result!["Alive (%)"]);
    const pca = Number(result!["PCa Death (%)"]);
    const other = Number(result!["Other Death (%)"]);
    expect(alive + pca + other).toBeCloseTo(100, 0);
  });
});

// ═══════════════════════════════════════════════════════
// 10. PDF consistency — same lookup logic as webpage
// ═══════════════════════════════════════════════════════
describe("PDF and Webpage consistency", () => {
  // The PDF (survival.ts) and the webpage (SurvivalAfterTreatmentPage.tsx)
  // use the exact same lookup logic. Verify a few key cases produce
  // identical values.
  const testCases = [
    { age: 55, stage: "T2", gleason: "3+3", psa: 5, expectedAlive: 98.68 },
    { age: 66, stage: "T2", gleason: "3+4", psa: 5, expectedAlive: 95.53 },
    { age: 72, stage: "T3a", gleason: "4+3", psa: 15, expectedAlive: 86.99 },
    { age: 82, stage: "T2", gleason: "4+5", psa: 25, expectedAlive: 59.55 },
    { age: 76, stage: "T3b", gleason: "4+5", psa: 25, expectedAlive: 74.57 },
  ];

  for (const tc of testCases) {
    it(`Age ${tc.age}, ${tc.stage}, Gleason ${tc.gleason}, PSA ${tc.psa} → ${tc.expectedAlive}%`, () => {
      const result = simulateLookup(tc.age, tc.stage, tc.gleason, tc.psa);
      expect(result).not.toBeNull();
      expect(result!["Alive (%)"]).toBe(tc.expectedAlive);
      // PDF formats with .toFixed(2)
      expect(Number(result!["Alive (%)"]).toFixed(2)).toBe(
        tc.expectedAlive.toFixed(2)
      );
    });
  }
});

// ═══════════════════════════════════════════════════════
// 11. Regression: Questionnaire Gleason "or" format
//     These use the actual values from questionnaire.json
// ═══════════════════════════════════════════════════════
describe("Questionnaire Gleason 'or' format - Regression", () => {
  it("Age 85, T1 or T2, Gleason '4+4 or 3+5 or 5+3', PSA 7 → Grade 4, Alive 70.53%", () => {
    // Bug: was returning Grade 1 (78.80%) instead of Grade 4 (70.53%)
    const result = simulateLookup(85, "T1 or T2", "4+4 or 3+5 or 5+3", 7);
    expect(result).not.toBeNull();
    expect(result!["Grade Group"]).toBe(4);
    expect(result!["Alive (%)"] ).toBe(70.53);
    expect(result!["PCa Death (%)"]).toBe(6.32);
    expect(result!["Other Death (%)"]).toBe(23.16);
    expect(result!["Total (N)"]).toBe(95);
  });

  it("Age 55, T2, Gleason '4+4 or 3+5 or 5+3', PSA 5 → Grade 4, Alive 98.51%", () => {
    const result = simulateLookup(55, "T2", "4+4 or 3+5 or 5+3", 5);
    expect(result).not.toBeNull();
    expect(result!["Grade Group"]).toBe(4);
    expect(result!["Alive (%)"] ).toBe(98.51);
  });

  it("Age 70, T3a, Gleason '4+5 or 5+4 or 5+5', PSA 15 → Grade 5, Alive 85.83%", () => {
    const result = simulateLookup(70, "T3a", "4+5 or 5+4 or 5+5", 15);
    expect(result).not.toBeNull();
    expect(result!["Grade Group"]).toBe(5);
    expect(result!["Alive (%)"] ).toBe(85.83);
  });

  it("Age 75, T3b, Gleason '4+5 or 5+4 or 5+5', PSA 25 → Grade 5, Alive 74.57%", () => {
    const result = simulateLookup(75, "T3b", "4+5 or 5+4 or 5+5", 25);
    expect(result).not.toBeNull();
    expect(result!["Grade Group"]).toBe(5);
    expect(result!["Alive (%)"] ).toBe(74.57);
  });
});
