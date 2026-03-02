import { describe, it, expect } from "vitest";
import erectileFunctionData from "../../assets/erectile_function_with_assist.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type ErectileFunctionOutcome = {
  N: number;
  "Firm for intercourse - no assist": number;
  "Firm for intercourse - with assist": number;
  "Firm for masturbation - no assist": number;
  "Firm for masturbation - with assist": number;
  "Not firm or none - no assist": number;
  "Not firm or none - with assist": number;
};

type EFData = {
  [treatment: string]: {
    Total: number;
    "Baseline quality of erection": {
      [baseline: string]: ErectileFunctionOutcome;
    };
  };
};

const efData = erectileFunctionData as EFData;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps questionnaire answers to the baselineStatus key used in the JSON lookup.
 * This mirrors the logic in ErectileFunctionPage.tsx and erectileFunction.ts.
 */
const mapToBaselineStatus = (
  erectionQuality: string,
  sexMedication: string
): string => {
  const useMedication = sexMedication === "Yes";

  if (erectionQuality === "Firm enough for intercourse") {
    return useMedication
      ? "Firm for intercourse - with assist"
      : "Firm for intercourse - no assist";
  }
  if (erectionQuality === "Firm enough for masturbation and foreplay only") {
    return useMedication
      ? "Firm for masturbation - with assist"
      : "Firm for masturbation - no assist";
  }
  if (
    erectionQuality === "Not firm enough for any sexual activity" ||
    erectionQuality === "None at all"
  ) {
    return useMedication
      ? "Not firm or none - with assist"
      : "Not firm or none - no assist";
  }
  return "Firm for intercourse - no assist"; // fallback
};

/**
 * Looks up the outcome row for a given treatment and baseline status.
 */
const getOutcome = (
  treatment: string,
  baselineStatus: string
): ErectileFunctionOutcome | undefined => {
  return efData[treatment]?.["Baseline quality of erection"]?.[baselineStatus];
};

// ─── Treatments ───────────────────────────────────────────────────────────────

const TREATMENTS = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

// ─── Section 1: Baseline status mapping ──────────────────────────────────────

describe("Erectile Function - Baseline Status Mapping", () => {
  describe("Firm enough for intercourse", () => {
    it("maps to 'Firm for intercourse - no assist' when sex_medication is No", () => {
      expect(mapToBaselineStatus("Firm enough for intercourse", "No")).toBe(
        "Firm for intercourse - no assist"
      );
    });
    it("maps to 'Firm for intercourse - with assist' when sex_medication is Yes", () => {
      expect(mapToBaselineStatus("Firm enough for intercourse", "Yes")).toBe(
        "Firm for intercourse - with assist"
      );
    });
  });

  describe("Firm enough for masturbation and foreplay only", () => {
    it("maps to 'Firm for masturbation - no assist' when sex_medication is No", () => {
      expect(
        mapToBaselineStatus("Firm enough for masturbation and foreplay only", "No")
      ).toBe("Firm for masturbation - no assist");
    });
    it("maps to 'Firm for masturbation - with assist' when sex_medication is Yes", () => {
      expect(
        mapToBaselineStatus("Firm enough for masturbation and foreplay only", "Yes")
      ).toBe("Firm for masturbation - with assist");
    });
  });

  describe("Not firm enough for any sexual activity", () => {
    it("maps to 'Not firm or none - no assist' when sex_medication is No", () => {
      expect(
        mapToBaselineStatus("Not firm enough for any sexual activity", "No")
      ).toBe("Not firm or none - no assist");
    });
    it("maps to 'Not firm or none - with assist' when sex_medication is Yes", () => {
      expect(
        mapToBaselineStatus("Not firm enough for any sexual activity", "Yes")
      ).toBe("Not firm or none - with assist");
    });
  });

  describe("None at all", () => {
    it("maps to 'Not firm or none - no assist' when sex_medication is No", () => {
      expect(mapToBaselineStatus("None at all", "No")).toBe(
        "Not firm or none - no assist"
      );
    });
    it("maps to 'Not firm or none - with assist' when sex_medication is Yes", () => {
      expect(mapToBaselineStatus("None at all", "Yes")).toBe(
        "Not firm or none - with assist"
      );
    });
  });

  it("'Not firm' and 'None at all' both map to the same 'Not firm or none' key (no assist)", () => {
    const notFirm = mapToBaselineStatus("Not firm enough for any sexual activity", "No");
    const noneAtAll = mapToBaselineStatus("None at all", "No");
    expect(notFirm).toBe(noneAtAll);
    expect(notFirm).toBe("Not firm or none - no assist");
  });

  it("'Not firm' and 'None at all' both map to the same 'Not firm or none' key (with assist)", () => {
    const notFirm = mapToBaselineStatus("Not firm enough for any sexual activity", "Yes");
    const noneAtAll = mapToBaselineStatus("None at all", "Yes");
    expect(notFirm).toBe(noneAtAll);
    expect(notFirm).toBe("Not firm or none - with assist");
  });
});

// ─── Section 2: JSON structure validation ────────────────────────────────────

describe("Erectile Function JSON - Structure", () => {
  const EXPECTED_BASELINES = [
    "Firm for intercourse - no assist",
    "Firm for intercourse - with assist",
    "Firm for masturbation - no assist",
    "Firm for masturbation - with assist",
    "Not firm or none - no assist",
    "Not firm or none - with assist",
  ];
  const OUTCOME_KEYS = [
    "Firm for intercourse - no assist",
    "Firm for intercourse - with assist",
    "Firm for masturbation - no assist",
    "Firm for masturbation - with assist",
    "Not firm or none - no assist",
    "Not firm or none - with assist",
  ];

  TREATMENTS.forEach((treatment) => {
    describe(treatment, () => {
      it("has all 6 expected baseline keys", () => {
        const baselines = Object.keys(
          efData[treatment]["Baseline quality of erection"]
        );
        EXPECTED_BASELINES.forEach((key) => {
          expect(baselines).toContain(key);
        });
      });

      EXPECTED_BASELINES.forEach((baseline) => {
        it(`baseline '${baseline}' has all 6 outcome keys and N > 0`, () => {
          const outcome = getOutcome(treatment, baseline);
          expect(outcome).toBeDefined();
          expect(outcome!.N).toBeGreaterThan(0);
          OUTCOME_KEYS.forEach((key) => {
            expect(outcome).toHaveProperty(key);
            expect(typeof outcome![key as keyof ErectileFunctionOutcome]).toBe("number");
          });
        });

        it(`baseline '${baseline}' percentages sum to approximately 100`, () => {
          const outcome = getOutcome(treatment, baseline)!;
          const sum =
            outcome["Firm for intercourse - no assist"] +
            outcome["Firm for intercourse - with assist"] +
            outcome["Firm for masturbation - no assist"] +
            outcome["Firm for masturbation - with assist"] +
            outcome["Not firm or none - no assist"] +
            outcome["Not firm or none - with assist"];
          // Allow ±2 due to rounding in source data
          expect(sum).toBeGreaterThanOrEqual(98);
          expect(sum).toBeLessThanOrEqual(102);
        });
      });
    });
  });
});

// ─── Section 3: Data values verified against reference (erectile-function.md) ────

describe("Erectile Function - Data Verification (vs reference tables)", () => {
  // Reference: erectile-function.md Table 5 – AS (Dengan Assist)
  describe("Active Surveillance", () => {
    it("Firm for intercourse - no assist: N=59, values match Table 5 row 1", () => {
      const d = getOutcome("Active Surveillance", "Firm for intercourse - no assist")!;
      expect(d.N).toBe(59);
      expect(d["Firm for intercourse - no assist"]).toBe(68);
      expect(d["Firm for intercourse - with assist"]).toBe(5);
      expect(d["Firm for masturbation - no assist"]).toBe(15);
      expect(d["Firm for masturbation - with assist"]).toBe(2);
      expect(d["Not firm or none - no assist"]).toBe(8);
      expect(d["Not firm or none - with assist"]).toBe(2);
    });

    it("Firm for intercourse - with assist: N=6, values match Table 5 row 2", () => {
      const d = getOutcome("Active Surveillance", "Firm for intercourse - with assist")!;
      expect(d.N).toBe(6);
      expect(d["Firm for intercourse - no assist"]).toBe(0);
      expect(d["Firm for intercourse - with assist"]).toBe(17);
      expect(d["Firm for masturbation - no assist"]).toBe(0);
      expect(d["Firm for masturbation - with assist"]).toBe(17);
      expect(d["Not firm or none - no assist"]).toBe(17);
      expect(d["Not firm or none - with assist"]).toBe(50);
    });

    it("Firm for masturbation - no assist: N=25, values match Table 5 row 3", () => {
      const d = getOutcome("Active Surveillance", "Firm for masturbation - no assist")!;
      expect(d.N).toBe(25);
      expect(d["Firm for intercourse - no assist"]).toBe(8);
      expect(d["Firm for intercourse - with assist"]).toBe(8);
      expect(d["Firm for masturbation - no assist"]).toBe(52);
      expect(d["Firm for masturbation - with assist"]).toBe(12);
      expect(d["Not firm or none - no assist"]).toBe(20);
      expect(d["Not firm or none - with assist"]).toBe(0);
    });

    it("Firm for masturbation - with assist: N=7, values match Table 5 row 4", () => {
      const d = getOutcome("Active Surveillance", "Firm for masturbation - with assist")!;
      expect(d.N).toBe(7);
      expect(d["Firm for intercourse - no assist"]).toBe(0);
      expect(d["Firm for intercourse - with assist"]).toBe(0);
      expect(d["Firm for masturbation - no assist"]).toBe(0);
      expect(d["Firm for masturbation - with assist"]).toBe(29);
      expect(d["Not firm or none - no assist"]).toBe(43);
      expect(d["Not firm or none - with assist"]).toBe(29);
    });

    it("Not firm or none - no assist: N=36, values match Table 5 row 5", () => {
      const d = getOutcome("Active Surveillance", "Not firm or none - no assist")!;
      expect(d.N).toBe(36);
      expect(d["Firm for intercourse - no assist"]).toBe(17);
      expect(d["Firm for intercourse - with assist"]).toBe(0);
      expect(d["Firm for masturbation - no assist"]).toBe(8);
      expect(d["Firm for masturbation - with assist"]).toBe(0);
      expect(d["Not firm or none - no assist"]).toBe(69);
      expect(d["Not firm or none - with assist"]).toBe(6);
    });

    it("Not firm or none - with assist: N=15, values match Table 5 row 6", () => {
      const d = getOutcome("Active Surveillance", "Not firm or none - with assist")!;
      expect(d.N).toBe(15);
      expect(d["Firm for intercourse - no assist"]).toBe(0);
      expect(d["Firm for intercourse - with assist"]).toBe(0);
      expect(d["Firm for masturbation - no assist"]).toBe(0);
      expect(d["Firm for masturbation - with assist"]).toBe(13);
      expect(d["Not firm or none - no assist"]).toBe(40);
      expect(d["Not firm or none - with assist"]).toBe(47);
    });
  });

  // Reference: erectile-function.md Table 6 – Focal Therapy (Dengan Assist)
  describe("Focal Therapy", () => {
    it("Firm for intercourse - no assist: N=85, values match Table 6 row 1", () => {
      const d = getOutcome("Focal Therapy", "Firm for intercourse - no assist")!;
      expect(d.N).toBe(85);
      expect(d["Firm for intercourse - no assist"]).toBe(59);
      expect(d["Firm for intercourse - with assist"]).toBe(8);
      expect(d["Firm for masturbation - no assist"]).toBe(18);
      expect(d["Firm for masturbation - with assist"]).toBe(2);
      expect(d["Not firm or none - no assist"]).toBe(9);
      expect(d["Not firm or none - with assist"]).toBe(4);
    });

    it("Not firm or none - no assist: N=52, values match Table 6 row 5", () => {
      const d = getOutcome("Focal Therapy", "Not firm or none - no assist")!;
      expect(d.N).toBe(52);
      expect(d["Firm for intercourse - no assist"]).toBe(2);
      expect(d["Firm for intercourse - with assist"]).toBe(2);
      expect(d["Firm for masturbation - no assist"]).toBe(17);
      expect(d["Firm for masturbation - with assist"]).toBe(6);
      expect(d["Not firm or none - no assist"]).toBe(69);
      expect(d["Not firm or none - with assist"]).toBe(4);
    });

    it("Not firm or none - with assist: N=6, values match Table 6 row 6", () => {
      const d = getOutcome("Focal Therapy", "Not firm or none - with assist")!;
      expect(d.N).toBe(6);
      expect(d["Not firm or none - no assist"]).toBe(50);
      expect(d["Not firm or none - with assist"]).toBe(33);
    });
  });

  // Reference: erectile-function.md Table 7 – Surgery (Dengan Assist)
  describe("Surgery", () => {
    it("Firm for intercourse - no assist: N=131, values match Table 7 row 1", () => {
      const d = getOutcome("Surgery", "Firm for intercourse - no assist")!;
      expect(d.N).toBe(131);
      expect(d["Firm for intercourse - no assist"]).toBe(2);
      expect(d["Firm for intercourse - with assist"]).toBe(11);
      expect(d["Firm for masturbation - no assist"]).toBe(4);
      expect(d["Firm for masturbation - with assist"]).toBe(21);
      expect(d["Not firm or none - no assist"]).toBe(22);
      expect(d["Not firm or none - with assist"]).toBe(40);
    });

    it("Firm for intercourse - with assist: N=11, values match Table 7 row 2", () => {
      const d = getOutcome("Surgery", "Firm for intercourse - with assist")!;
      expect(d.N).toBe(11);
      expect(d["Firm for intercourse - with assist"]).toBe(18);
      expect(d["Firm for masturbation - with assist"]).toBe(18);
      expect(d["Not firm or none - no assist"]).toBe(0);
      expect(d["Not firm or none - with assist"]).toBe(64);
    });

    it("Not firm or none - no assist: N=58, values match Table 7 row 5", () => {
      const d = getOutcome("Surgery", "Not firm or none - no assist")!;
      expect(d.N).toBe(58);
      expect(d["Firm for intercourse - no assist"]).toBe(0);
      expect(d["Firm for intercourse - with assist"]).toBe(2);
      expect(d["Firm for masturbation - no assist"]).toBe(2);
      expect(d["Firm for masturbation - with assist"]).toBe(2);
      expect(d["Not firm or none - no assist"]).toBe(52);
      expect(d["Not firm or none - with assist"]).toBe(43);
    });

    it("Not firm or none - with assist: N=16, values match Table 7 row 6", () => {
      const d = getOutcome("Surgery", "Not firm or none - with assist")!;
      expect(d.N).toBe(16);
      expect(d["Not firm or none - no assist"]).toBe(31);
      expect(d["Not firm or none - with assist"]).toBe(56);
    });
  });

  // Reference: erectile-function.md Table 8 – EBRT/Radiotherapy (Dengan Assist)
  describe("Radiotherapy", () => {
    it("Firm for intercourse - no assist: N=64, values match Table 8 row 1", () => {
      const d = getOutcome("Radiotherapy", "Firm for intercourse - no assist")!;
      expect(d.N).toBe(64);
      expect(d["Firm for intercourse - no assist"]).toBe(20);
      expect(d["Firm for intercourse - with assist"]).toBe(5);
      expect(d["Firm for masturbation - no assist"]).toBe(5);
      expect(d["Firm for masturbation - with assist"]).toBe(2);
      expect(d["Not firm or none - no assist"]).toBe(62);
      expect(d["Not firm or none - with assist"]).toBe(6);
    });

    it("Firm for masturbation - no assist: N=51, values match Table 8 row 3", () => {
      const d = getOutcome("Radiotherapy", "Firm for masturbation - no assist")!;
      expect(d.N).toBe(51);
      expect(d["Firm for intercourse - no assist"]).toBe(2);
      expect(d["Firm for intercourse - with assist"]).toBe(0);
      expect(d["Firm for masturbation - no assist"]).toBe(24);
      expect(d["Firm for masturbation - with assist"]).toBe(2);
      expect(d["Not firm or none - no assist"]).toBe(69);
      expect(d["Not firm or none - with assist"]).toBe(4);
    });

    it("Not firm or none - no assist: N=168, values match Table 8 row 5", () => {
      const d = getOutcome("Radiotherapy", "Not firm or none - no assist")!;
      expect(d.N).toBe(168);
      expect(d["Firm for intercourse - no assist"]).toBe(1);
      expect(d["Firm for intercourse - with assist"]).toBe(0);
      expect(d["Firm for masturbation - no assist"]).toBe(4);
      expect(d["Firm for masturbation - with assist"]).toBe(1);
      expect(d["Not firm or none - no assist"]).toBe(88);
      expect(d["Not firm or none - with assist"]).toBe(6);
    });

    it("Not firm or none - with assist: N=34, values match Table 8 row 6", () => {
      const d = getOutcome("Radiotherapy", "Not firm or none - with assist")!;
      expect(d.N).toBe(34);
      expect(d["Firm for masturbation - no assist"]).toBe(3);
      expect(d["Firm for masturbation - with assist"]).toBe(3);
      expect(d["Not firm or none - no assist"]).toBe(50);
      expect(d["Not firm or none - with assist"]).toBe(44);
    });
  });
});

// ─── Section 4: End-to-end mapping (questionnaire → lookup → correct data) ───

describe("Erectile Function - End-to-end Questionnaire to Data Lookup", () => {
  // Mock a patient, map their answers, look up their data.

  it("Patient 'Firm for intercourse, no medication' → AS 68% firm intercourse no assist", () => {
    const baseline = mapToBaselineStatus("Firm enough for intercourse", "No");
    const d = getOutcome("Active Surveillance", baseline)!;
    expect(baseline).toBe("Firm for intercourse - no assist");
    expect(d["Firm for intercourse - no assist"]).toBe(68);
  });

  it("Patient 'Firm for intercourse, using medication' → AS 17% firm intercourse with assist", () => {
    const baseline = mapToBaselineStatus("Firm enough for intercourse", "Yes");
    const d = getOutcome("Active Surveillance", baseline)!;
    expect(baseline).toBe("Firm for intercourse - with assist");
    expect(d["Firm for intercourse - with assist"]).toBe(17);
  });

  it("Patient 'None at all, no medication' → Surgery 52% not firm/none no assist", () => {
    const baseline = mapToBaselineStatus("None at all", "No");
    const d = getOutcome("Surgery", baseline)!;
    expect(baseline).toBe("Not firm or none - no assist");
    expect(d["Not firm or none - no assist"]).toBe(52);
  });

  it("Patient 'Not firm, using medication' → Radiotherapy 44% not firm/none with assist", () => {
    const baseline = mapToBaselineStatus("Not firm enough for any sexual activity", "Yes");
    const d = getOutcome("Radiotherapy", baseline)!;
    expect(baseline).toBe("Not firm or none - with assist");
    expect(d["Not firm or none - with assist"]).toBe(44);
  });

  it("Patient 'Firm for masturbation, no medication' → Focal Therapy 39% firm masturbation no assist", () => {
    const baseline = mapToBaselineStatus("Firm enough for masturbation and foreplay only", "No");
    const d = getOutcome("Focal Therapy", baseline)!;
    expect(baseline).toBe("Firm for masturbation - no assist");
    expect(d["Firm for masturbation - no assist"]).toBe(39);
  });

  it("Patient 'Firm for masturbation, using medication' → Surgery 44% firm masturbation with assist", () => {
    const baseline = mapToBaselineStatus("Firm enough for masturbation and foreplay only", "Yes");
    const d = getOutcome("Surgery", baseline)!;
    expect(baseline).toBe("Firm for masturbation - with assist");
    expect(d["Firm for masturbation - with assist"]).toBe(44);
  });

  it("Assist status is NOT reversed: 'no medication' gives no-assist data row, 'yes medication' gives with-assist data row", () => {
    // No medication → should use "- no assist" baseline
    const noAssistKey = mapToBaselineStatus("Firm enough for intercourse", "No");
    expect(noAssistKey).toContain("no assist");
    expect(noAssistKey).not.toContain("with assist");

    // Yes medication → should use "- with assist" baseline
    const withAssistKey = mapToBaselineStatus("Firm enough for intercourse", "Yes");
    expect(withAssistKey).toContain("with assist");
    expect(withAssistKey).not.toContain("no assist");
  });

  it("Values differ between the two assist statuses (proves distinct data is loaded)", () => {
    const noAssistData = getOutcome("Active Surveillance", "Firm for intercourse - no assist")!;
    const withAssistData = getOutcome("Active Surveillance", "Firm for intercourse - with assist")!;
    // AS no-assist: 68% firm intercourse; with-assist: 0% firm intercourse no-assist
    expect(noAssistData["Firm for intercourse - no assist"]).toBe(68);
    expect(withAssistData["Firm for intercourse - no assist"]).toBe(0);
    expect(noAssistData.N).not.toBe(withAssistData.N);
  });
});
