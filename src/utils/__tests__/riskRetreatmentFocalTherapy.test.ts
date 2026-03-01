import { describe, it, expect } from "vitest";
import { calculateAllStrategies } from "../riskRetreatmentUtils";

// ─── Helper ───
const getFocalResult = (result: ReturnType<typeof calculateAllStrategies>) =>
  result.focalTherapy;

const makeAnswers = (stage: string, gleason: string, psa: number) => ({
  cancer_stage: stage,
  mri_visibility: "No or equivocal (PI-RADS/Likert 1-3)",
  gleason_score: gleason,
  max_cancer_core_length: 5,
  psa,
  prostate_volume: 30,
});

describe("Focal Therapy - Data & Error Message Verification", () => {
  // ─────────────────────────────────────────────────────
  // Section 1: Valid data returns (T1/T2 and T3a)
  // ─────────────────────────────────────────────────────
  describe("T1/T2 - Valid data", () => {
    const cases = [
      { gleason: "3+3", psa: 5, expected: { repeat: 7, radical: 10, both: 7 } },
      { gleason: "3+3", psa: 15, expected: { repeat: 7, radical: 10, both: 7 } },
      { gleason: "3+3", psa: 25, expected: { repeat: 7, radical: 10, both: 7 } },
      { gleason: "3+4", psa: 5, expected: { repeat: 8, radical: 10, both: 8 } },
      { gleason: "3+4", psa: 15, expected: { repeat: 8, radical: 10, both: 8 } },
      { gleason: "3+4", psa: 25, expected: { repeat: 8, radical: 10, both: 8 } },
      { gleason: "4+3", psa: 5, expected: { repeat: 10, radical: 17, both: 4 } },
      { gleason: "4+3", psa: 15, expected: { repeat: 10, radical: 17, both: 4 } },
      { gleason: "4+3", psa: 25, expected: { repeat: 10, radical: 17, both: 4 } },
    ];

    for (const { gleason, psa, expected } of cases) {
      it(`Gleason ${gleason}, PSA ${psa} => repeat=${expected.repeat}%, radical=${expected.radical}%, both=${expected.both}%`, () => {
        const result = getFocalResult(calculateAllStrategies(makeAnswers("T1 or T2", gleason, psa)));
        expect(result.error).toBeUndefined();
        expect(result.data.length).toBe(4);
        // data[1] = repeat, data[3] = radical, data[2] = both
        expect(result.data[1].value).toBe(expected.repeat);
        expect(result.data[3].value).toBe(expected.radical);
        expect(result.data[2].value).toBe(expected.both);
      });
    }
  });

  describe("T3a - Valid data", () => {
    const cases = [
      { gleason: "3+3", psa: 5, expected: { repeat: 7, radical: 10, both: 7 } },
      { gleason: "3+4", psa: 5, expected: { repeat: 8, radical: 10, both: 8 } },
      { gleason: "4+3", psa: 5, expected: { repeat: 10, radical: 17, both: 4 } },
    ];

    for (const { gleason, psa, expected } of cases) {
      it(`Gleason ${gleason}, PSA ${psa} => repeat=${expected.repeat}%, radical=${expected.radical}%, both=${expected.both}%`, () => {
        const result = getFocalResult(calculateAllStrategies(makeAnswers("T3a", gleason, psa)));
        expect(result.error).toBeUndefined();
        expect(result.data.length).toBe(4);
        expect(result.data[1].value).toBe(expected.repeat);
        expect(result.data[3].value).toBe(expected.radical);
        expect(result.data[2].value).toBe(expected.both);
      });
    }
  });

  // ─────────────────────────────────────────────────────
  // Section 2: Gleason 4+4 or higher - Not recommended (any T stage)
  // ─────────────────────────────────────────────────────
  describe("Gleason 4+4 or above - Not recommended error message", () => {
    const expectedMessage = "Focal therapy is not routinely recommended for prostate cancer of Gleason grade 4+4 or above";

    const stages = ["T1 or T2", "T3a", "T3b"];
    const gleasonScores = ["4+4 or 3+5 or 5+3", "4+5 or 5+4 or 5+5"];
    const psaValues = [5, 15, 25]; // <10, 10-20, >20

    for (const stage of stages) {
      for (const gleason of gleasonScores) {
        for (const psa of psaValues) {
          it(`${stage}, ${gleason}, PSA ${psa} => Gleason error message`, () => {
            const result = getFocalResult(calculateAllStrategies(makeAnswers(stage, gleason, psa)));
            expect(result.data.length).toBe(0);
            expect(result.error).toBe(expectedMessage);
          });
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────
  // Section 3: T3b with Gleason 3+3, 3+4, 4+3 - Stage error message
  // ─────────────────────────────────────────────────────
  describe("T3b with Gleason ≤4+3 - Stage not recommended error message", () => {
    const expectedMessage = "Focal therapy is not routinely recommended for prostate cancer of stage T3b and above";

    const gleasonScores = ["3+3", "3+4", "4+3"];
    const psaValues = [5, 15, 25];

    for (const gleason of gleasonScores) {
      for (const psa of psaValues) {
        it(`T3b, ${gleason}, PSA ${psa} => stage error message`, () => {
          const result = getFocalResult(calculateAllStrategies(makeAnswers("T3b", gleason, psa)));
          expect(result.data.length).toBe(0);
          expect(result.error).toBe(expectedMessage);
        });
      }
    }
  });
});
