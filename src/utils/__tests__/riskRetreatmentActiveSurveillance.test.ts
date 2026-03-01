import { describe, it, expect } from "vitest";
import {
  calculateAllStrategies,
  mapMriVisibility,
  getCoreLengthBucket,
  getPsaDensityBucket,
  mapGleasonScore,
} from "../riskRetreatmentUtils";

// ─── Helper to extract Active Surveillance "No treatment" percentage ───
const getASValue = (result: ReturnType<typeof calculateAllStrategies>) => {
  const as = result.activeSurveillance;
  if (as.error || as.data.length === 0) return null;
  return as.data[0].value; // "No treatment" percentage
};

// ─── Client's correct Active Surveillance data table ───
// Each row: [mriVisibility, gleasonScore, coreLengthMm, psaDensity, expectedProbability]
// probability is the raw decimal from the spreadsheet × 100 = percentage

// Reference table from client's spreadsheet (image):
//
// Not visible on MRI (Likert 1 to 3)
// Gleason 3+3
//   ≤3:         0.91  0.90  0.87  0.86  0.84
//   >3 and <6:  0.87  0.86  0.82  0.81  0.77
//   >6 and <10: 0.83  0.81  0.76  0.74  0.69
//   ≥10:        0.79  0.76  0.71  0.69  0.63
// Gleason 3+4
//   ≤3:         0.82  0.79  0.74  0.73  0.68
//   >3 and <6:  0.74  0.71  0.65  0.52  0.56
//   >6 and <10: 0.66  0.63  0.54  0.62  0.45
//   ≥10:        0.60  0.55  0.47  0.44  0.37
//
// Visible on MRI (Likert 4 or 5)
// Gleason 3+3
//   ≤3:         0.81  0.78  0.73  0.71  0.66
//   >3 and <6:  0.73  0.70  0.63  0.61  0.54
//   >6 and <10: 0.64  0.60  0.52  0.50  0.43
//   ≥10:        0.58  0.53  0.45  0.42  0.34
// Gleason 3+4
//   ≤3:         0.71  0.67  0.60  0.58  0.51
//   >3 and <6:  0.60  0.56  0.47  0.44  0.37
//   >6 and <10: 0.49  0.44  0.35  0.32  0.25
//   ≥10:        0.41  0.36  0.27  0.24  0.18

describe("Active Surveillance - Data Mapping Verification", () => {
  // ─────────────────────────────────────────────────────
  // Section 1: Input mapping helpers
  // ─────────────────────────────────────────────────────
  describe("Input Mapping Functions", () => {
    describe("mapMriVisibility", () => {
      it('maps "Yes (PI-RADS/Likert 4-5)" to visible', () => {
        expect(mapMriVisibility("Yes (PI-RADS/Likert 4-5)")).toBe("visible");
      });
      it('maps "No (PI-RADS/Likert 1-3)" to not_visible', () => {
        expect(mapMriVisibility("No (PI-RADS/Likert 1-3)")).toBe("not_visible");
      });
      it('maps "No or equivocal (PI-RADS/Likert 1-3)" to not_visible', () => {
        expect(mapMriVisibility("No or equivocal (PI-RADS/Likert 1-3)")).toBe("not_visible");
      });
      it("maps Unknown to not_visible", () => {
        expect(mapMriVisibility("Unknown")).toBe("not_visible");
      });
    });

    describe("getCoreLengthBucket", () => {
      it("returns <=3 for values <= 3", () => {
        expect(getCoreLengthBucket(2)).toBe("<=3");
        expect(getCoreLengthBucket(3)).toBe("<=3");
      });
      it("returns >3_and_<6 for values > 3 and < 6", () => {
        expect(getCoreLengthBucket(4)).toBe(">3_and_<6");
        expect(getCoreLengthBucket(5)).toBe(">3_and_<6");
      });
      it("returns >=6_and_<10 for values >= 6 and < 10", () => {
        expect(getCoreLengthBucket(6)).toBe(">=6_and_<10");
        expect(getCoreLengthBucket(9)).toBe(">=6_and_<10");
      });
      it("returns >=10 for values >= 10", () => {
        expect(getCoreLengthBucket(10)).toBe(">=10");
        expect(getCoreLengthBucket(15)).toBe(">=10");
      });
    });

    describe("getPsaDensityBucket", () => {
      it("returns <0.1 for density < 0.1", () => {
        expect(getPsaDensityBucket(1, 20)).toBe("<0.1"); // 0.05
      });
      it("returns 0.1-0.12 for density 0.1 to <0.12", () => {
        expect(getPsaDensityBucket(1.1, 10)).toBe("0.1-0.12"); // 0.11
      });
      it("returns 0.12-0.15 for density 0.12 to <0.15", () => {
        expect(getPsaDensityBucket(1.3, 10)).toBe("0.12-0.15"); // 0.13
      });
      it("returns 0.15-0.2 for density 0.15 to <0.2", () => {
        expect(getPsaDensityBucket(1.7, 10)).toBe("0.15-0.2"); // 0.17
      });
      it("returns >=0.2 for density >= 0.2", () => {
        expect(getPsaDensityBucket(2, 10)).toBe(">=0.2"); // 0.2
        expect(getPsaDensityBucket(5, 10)).toBe(">=0.2"); // 0.5
      });
    });

    describe("mapGleasonScore", () => {
      it('maps "3+3" correctly', () => {
        expect(mapGleasonScore("3+3")).toBe("3+3");
      });
      it('maps "3+4" correctly', () => {
        expect(mapGleasonScore("3+4")).toBe("3+4");
      });
      it('maps "4+3" correctly', () => {
        expect(mapGleasonScore("4+3")).toBe("4+3");
      });
      it('maps "4+4 or 3+5 or 5+3" to 4+4_or_higher', () => {
        expect(mapGleasonScore("4+4 or 3+5 or 5+3")).toBe("4+4_or_higher");
      });
    });
  });

  // ─────────────────────────────────────────────────────
  // Section 2: End-to-end Active Surveillance calculations
  // Using calculateAllStrategies with realistic patient answers
  // ─────────────────────────────────────────────────────

  // Helper to create patient answers for Active Surveillance testing
  const makeAnswers = (
    mri: string,
    gleason: string,
    coreLength: number,
    psa: number,
    volume: number
  ) => ({
    cancer_stage: "T1 or T2",
    mri_visibility: mri,
    gleason_score: gleason,
    max_cancer_core_length: coreLength,
    psa,
    prostate_volume: volume,
  });

  // PSA density test helpers - we use fixed PSA/volume combinations to get exact density buckets
  // density < 0.1:   psa=1, volume=20 => 0.05
  // density 0.1-0.12: psa=1.1, volume=10 => 0.11
  // density 0.12-0.15: psa=1.3, volume=10 => 0.13
  // density 0.15-0.2: psa=1.7, volume=10 => 0.17
  // density >= 0.2:  psa=2, volume=10 => 0.2

  const NOT_VISIBLE = "No or equivocal (PI-RADS/Likert 1-3)";
  const VISIBLE = "Yes (PI-RADS/Likert 4-5)";

  // PSA/Volume combos for each density bucket
  const DENSITY = {
    "<0.1": { psa: 1, vol: 20 },         // density = 0.05
    "0.1-0.12": { psa: 1.1, vol: 10 },   // density = 0.11
    "0.12-0.15": { psa: 1.3, vol: 10 },  // density = 0.13
    "0.15-0.2": { psa: 1.7, vol: 10 },   // density = 0.17
    ">=0.2": { psa: 6, vol: 10 },         // density = 0.6
  };

  // Core length values for each bucket
  const CORE = {
    "<=3": 2,
    ">3_and_<6": 4,
    ">=6_and_<10": 7,
    ">=10": 12,
  };

  describe("Not Visible MRI - Gleason 3+3", () => {
    const expected: Record<string, Record<string, number>> = {
      "<=3":         { "<0.1": 91, "0.1-0.12": 90, "0.12-0.15": 87, "0.15-0.2": 86, ">=0.2": 84 },
      ">3_and_<6":   { "<0.1": 87, "0.1-0.12": 86, "0.12-0.15": 82, "0.15-0.2": 81, ">=0.2": 77 },
      ">=6_and_<10": { "<0.1": 83, "0.1-0.12": 81, "0.12-0.15": 76, "0.15-0.2": 74, ">=0.2": 69 },
      ">=10":        { "<0.1": 79, "0.1-0.12": 76, "0.12-0.15": 71, "0.15-0.2": 69, ">=0.2": 63 },
    };

    for (const [coreBucket, densityMap] of Object.entries(expected)) {
      for (const [densityBucket, expectedValue] of Object.entries(densityMap)) {
        const d = DENSITY[densityBucket as keyof typeof DENSITY];
        const c = CORE[coreBucket as keyof typeof CORE];
        it(`core=${coreBucket}, density=${densityBucket} => ${expectedValue}%`, () => {
          const result = calculateAllStrategies(makeAnswers(NOT_VISIBLE, "3+3", c, d.psa, d.vol));
          expect(getASValue(result)).toBe(expectedValue);
        });
      }
    }
  });

  describe("Not Visible MRI - Gleason 3+4", () => {
    const expected: Record<string, Record<string, number>> = {
      "<=3":         { "<0.1": 82, "0.1-0.12": 79, "0.12-0.15": 74, "0.15-0.2": 73, ">=0.2": 68 },
      ">3_and_<6":   { "<0.1": 74, "0.1-0.12": 71, "0.12-0.15": 65, "0.15-0.2": 52, ">=0.2": 56 },
      ">=6_and_<10": { "<0.1": 66, "0.1-0.12": 63, "0.12-0.15": 54, "0.15-0.2": 62, ">=0.2": 45 },
      ">=10":        { "<0.1": 60, "0.1-0.12": 55, "0.12-0.15": 47, "0.15-0.2": 44, ">=0.2": 37 },
    };

    for (const [coreBucket, densityMap] of Object.entries(expected)) {
      for (const [densityBucket, expectedValue] of Object.entries(densityMap)) {
        const d = DENSITY[densityBucket as keyof typeof DENSITY];
        const c = CORE[coreBucket as keyof typeof CORE];
        it(`core=${coreBucket}, density=${densityBucket} => ${expectedValue}%`, () => {
          const result = calculateAllStrategies(makeAnswers(NOT_VISIBLE, "3+4", c, d.psa, d.vol));
          expect(getASValue(result)).toBe(expectedValue);
        });
      }
    }
  });

  describe("Visible MRI - Gleason 3+3", () => {
    const expected: Record<string, Record<string, number>> = {
      "<=3":         { "<0.1": 81, "0.1-0.12": 78, "0.12-0.15": 73, "0.15-0.2": 71, ">=0.2": 66 },
      ">3_and_<6":   { "<0.1": 73, "0.1-0.12": 70, "0.12-0.15": 63, "0.15-0.2": 61, ">=0.2": 54 },
      ">=6_and_<10": { "<0.1": 64, "0.1-0.12": 60, "0.12-0.15": 52, "0.15-0.2": 50, ">=0.2": 43 },
      ">=10":        { "<0.1": 58, "0.1-0.12": 53, "0.12-0.15": 45, "0.15-0.2": 42, ">=0.2": 34 },
    };

    for (const [coreBucket, densityMap] of Object.entries(expected)) {
      for (const [densityBucket, expectedValue] of Object.entries(densityMap)) {
        const d = DENSITY[densityBucket as keyof typeof DENSITY];
        const c = CORE[coreBucket as keyof typeof CORE];
        it(`core=${coreBucket}, density=${densityBucket} => ${expectedValue}%`, () => {
          const result = calculateAllStrategies(makeAnswers(VISIBLE, "3+3", c, d.psa, d.vol));
          expect(getASValue(result)).toBe(expectedValue);
        });
      }
    }
  });

  describe("Visible MRI - Gleason 3+4", () => {
    const expected: Record<string, Record<string, number>> = {
      "<=3":         { "<0.1": 71, "0.1-0.12": 67, "0.12-0.15": 60, "0.15-0.2": 58, ">=0.2": 51 },
      ">3_and_<6":   { "<0.1": 60, "0.1-0.12": 56, "0.12-0.15": 47, "0.15-0.2": 44, ">=0.2": 37 },
      ">=6_and_<10": { "<0.1": 49, "0.1-0.12": 44, "0.12-0.15": 35, "0.15-0.2": 32, ">=0.2": 25 },
      ">=10":        { "<0.1": 41, "0.1-0.12": 36, "0.12-0.15": 27, "0.15-0.2": 24, ">=0.2": 18 },
    };

    for (const [coreBucket, densityMap] of Object.entries(expected)) {
      for (const [densityBucket, expectedValue] of Object.entries(densityMap)) {
        const d = DENSITY[densityBucket as keyof typeof DENSITY];
        const c = CORE[coreBucket as keyof typeof CORE];
        it(`core=${coreBucket}, density=${densityBucket} => ${expectedValue}%`, () => {
          const result = calculateAllStrategies(makeAnswers(VISIBLE, "3+4", c, d.psa, d.vol));
          expect(getASValue(result)).toBe(expectedValue);
        });
      }
    }
  });

  // ─────────────────────────────────────────────────────
  // Section 3: Gleason 4+3 and above - should show not recommended
  // ─────────────────────────────────────────────────────
  describe("Gleason 4+3 and above - Not Recommended", () => {
    it("Gleason 4+3 returns no data (not recommended)", () => {
      const result = calculateAllStrategies(
        makeAnswers(NOT_VISIBLE, "4+3", 5, 5, 30)
      );
      expect(result.activeSurveillance.data.length).toBe(0);
    });

    it("Gleason 4+4 returns no data (not recommended)", () => {
      const result = calculateAllStrategies(
        makeAnswers(VISIBLE, "4+4 or 3+5 or 5+3", 5, 5, 30)
      );
      expect(result.activeSurveillance.data.length).toBe(0);
    });

    it("Gleason 4+5 returns no data (not recommended)", () => {
      const result = calculateAllStrategies(
        makeAnswers(VISIBLE, "4+5 or 5+4 or 5+5", 5, 5, 30)
      );
      expect(result.activeSurveillance.data.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────
  // Section 4: Verify max_cancer_core_length field is used (regression test for the bug)
  // ─────────────────────────────────────────────────────
  describe("Field name mapping regression test", () => {
    it("uses max_cancer_core_length field correctly (not default fallback)", () => {
      // With core length 12 (>=10 bucket), Not Visible, Gleason 3+3, density <0.1 => expected 79%
      const result = calculateAllStrategies({
        cancer_stage: "T1 or T2",
        mri_visibility: NOT_VISIBLE,
        gleason_score: "3+3",
        max_cancer_core_length: 12,
        psa: 1,
        prostate_volume: 20,
      });
      expect(getASValue(result)).toBe(79);

      // With core length 2 (<=3 bucket), same params => expected 91%
      const result2 = calculateAllStrategies({
        cancer_stage: "T1 or T2",
        mri_visibility: NOT_VISIBLE,
        gleason_score: "3+3",
        max_cancer_core_length: 2,
        psa: 1,
        prostate_volume: 20,
      });
      expect(getASValue(result2)).toBe(91);

      // These should be DIFFERENT — if the bug existed, both would return 87% (default core=5)
      expect(getASValue(result)).not.toBe(getASValue(result2));
    });

    it("uses 'No or equivocal' MRI visibility option correctly", () => {
      // Not visible: Gleason 3+3, core <=3, density <0.1 => 91%
      const resultNotVisible = calculateAllStrategies({
        cancer_stage: "T1 or T2",
        mri_visibility: "No or equivocal (PI-RADS/Likert 1-3)",
        gleason_score: "3+3",
        max_cancer_core_length: 2,
        psa: 1,
        prostate_volume: 20,
      });
      expect(getASValue(resultNotVisible)).toBe(91);

      // Visible: same params => 81%
      const resultVisible = calculateAllStrategies({
        cancer_stage: "T1 or T2",
        mri_visibility: "Yes (PI-RADS/Likert 4-5)",
        gleason_score: "3+3",
        max_cancer_core_length: 2,
        psa: 1,
        prostate_volume: 20,
      });
      expect(getASValue(resultVisible)).toBe(81);
    });
  });
});
