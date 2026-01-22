import riskRetreatmentData from "@/assets/risk_retreatment_equations.json";

// Constants
const INSUFFICIENT_DATA_MESSAGE = "There are insufficient data to provide an estimate of the need for additional treatment.";

// Type definitions
interface WaffleDataItem {
  name: string;
  value: number;
  color: string;
  borderColor?: string;
}

interface WaffleResult {
  data: WaffleDataItem[];
  error?: string;
}

interface FocalTherapyData {
  repeat: number;
  radical: number;
  both: number;
}

/**
 * Maps raw cancer stage input to lookup key
 * Handles various formats: "T1", "T2a", "T1 or T2", "T1/T2", etc.
 */
export const mapCancerStage = (stage: string): string => {
  // First, check direct mapping
  const mapping = riskRetreatmentData.mappings.cancer_stage as Record<string, string>;
  if (mapping[stage]) {
    return mapping[stage];
  }
  
  // Handle "T1 or T2" or "T1/T2" format
  const normalizedStage = stage.toLowerCase().replace(/\s/g, "");
  if (normalizedStage.includes("t1") && normalizedStage.includes("t2")) {
    return "T1/T2";
  }
  if (normalizedStage === "t1ort2" || normalizedStage === "t1/t2") {
    return "T1/T2";
  }
  
  // Check if it contains T3a or T3b
  if (normalizedStage.includes("t3b")) {
    return "T3b";
  }
  if (normalizedStage.includes("t3a")) {
    return "T3a";
  }
  
  // Check if it contains any T1 or T2 variant
  if (normalizedStage.includes("t1") || normalizedStage.includes("t2")) {
    return "T1/T2";
  }
  
  // Default fallback
  return "T1/T2";
};

/**
 * Maps MRI visibility input to lookup key
 */
export const mapMriVisibility = (mri: string): string => {
  const mapping = riskRetreatmentData.mappings.mri_visibility as Record<string, string>;
  return mapping[mri] || "not_visible";
};

/**
 * Determines PSA bucket based on PSA value
 */
export const getPsaBucket = (psa: number): string => {
  if (psa < 10) return "<10";
  if (psa <= 20) return "10-20";
  return ">20";
};

/**
 * Calculates PSA density and returns the appropriate bucket
 */
export const getPsaDensityBucket = (psa: number, volume: number): string => {
  if (!volume || volume === 0) return ">=0.2";
  
  const density = psa / volume;
  
  if (density < 0.1) return "<0.1";
  if (density < 0.12) return "0.1-0.12";
  if (density < 0.15) return "0.12-0.15";
  if (density < 0.2) return "0.15-0.2";
  return ">=0.2";
};

/**
 * Maps max core length to bucket
 */
export const getCoreLengthBucket = (length: number): string => {
  if (length <= 3) return "<=3";
  if (length < 6) return ">3_and_<6";
  if (length < 10) return ">=6_and_<10";
  return ">=10";
};

/**
 * Normalizes Gleason score to JSON key format
 */
export const mapGleasonScore = (gleason: string): string => {
  // Handle various gleason formats
  const normalizedGleason = gleason.replace(/\s/g, "");
  
  if (normalizedGleason.includes("4+4") || 
      normalizedGleason.includes("4+5") || 
      normalizedGleason.includes("5+4") || 
      normalizedGleason.includes("5+5") ||
      normalizedGleason.includes("5+3") ||
      normalizedGleason.includes("3+5")) {
    return "4+4_or_higher";
  }
  
  if (normalizedGleason.includes("3+3")) return "3+3";
  if (normalizedGleason.includes("3+4")) return "3+4";
  if (normalizedGleason.includes("4+3")) return "4+3";
  
  return "3+3"; // Default fallback
};

/**
 * Calculate waffle data for Active Surveillance strategy
 */
const calculateActiveSurveillance = (
  mriVisibility: string,
  gleasonScore: string,
  coreLengthBucket: string,
  densityBucket: string
): WaffleResult => {
  const data = riskRetreatmentData.strategies.active_surveillance.data as Record<string, unknown>;
  
  try {
    const mriData = data[mriVisibility] as Record<string, unknown>;
    if (!mriData) {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const gleasonData = mriData[gleasonScore];
    if (typeof gleasonData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const coreLengthData = (gleasonData as Record<string, Record<string, number>>)?.[coreLengthBucket];
    if (!coreLengthData) {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const value = coreLengthData[densityBucket];
    if (value === undefined) {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const noTreatment = Math.round(value * 100);
    const progression = 100 - noTreatment;
    
    return {
      data: [
        { name: "No treatment (i.e. Active surveillance only)", value: noTreatment, color: "#1b5e20" },
        { name: "First treatment only (i.e. Focal therapy, Prostatectomy, Radiotherapy)", value: progression, color: "#90EE90" },
      ],
    };
  } catch {
    return { data: [], error: "Unable to calculate Active Surveillance prediction" };
  }
};

/**
 * Calculate waffle data for Focal Therapy strategy
 */
const calculateFocalTherapy = (
  stageBucket: string,
  gleasonScore: string,
  psaBucket: string
): WaffleResult => {
  const data = riskRetreatmentData.strategies.focal_therapy.data as Record<string, unknown>;
  
  try {
    const stageData = data[stageBucket];
    if (typeof stageData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const gleasonData = (stageData as Record<string, unknown>)?.[gleasonScore];
    if (typeof gleasonData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const psaData = (gleasonData as Record<string, FocalTherapyData>)?.[psaBucket];
    if (!psaData || typeof psaData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const repeat = psaData.repeat;
    const radical = psaData.radical;
    const both = psaData.both;
    const success = 100 - (repeat + radical + both);
    
    return {
      data: [
        { name: "First treatment only (i.e. Focal therapy, Prostatectomy, Radiotherapy)", value: success, color: "#90EE90" },
        { name: "Second round of additional focal treatment", value: repeat, color: "#FFEB3B" },
        { name: "Progressed to radiotherapy or surgery after a second round of additional focal therapy", value: both, color: "#FFEB3B", borderColor: "#FF9800" },
        { name: "Progressed to different treatment", value: radical, color: "#FF9800" },
      ],
    };
  } catch {
    return { data: [], error: "Unable to calculate Focal Therapy prediction" };
  }
};

/**
 * Calculate waffle data for Radiotherapy or Surgery strategy
 */
const calculateRadiotherapyOrSurgery = (
  strategy: "radiotherapy" | "surgery",
  stageBucket: string,
  gleasonScore: string,
  psaBucket: string
): WaffleResult => {
  const strategyData = riskRetreatmentData.strategies[strategy].data as Record<string, unknown>;
  
  try {
    const stageData = strategyData[stageBucket];
    if (typeof stageData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const gleasonData = (stageData as Record<string, unknown>)?.[gleasonScore];
    if (typeof gleasonData === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const salvageValue = (gleasonData as Record<string, number>)?.[psaBucket];
    if (salvageValue === undefined || typeof salvageValue === "string") {
      return { data: [], error: INSUFFICIENT_DATA_MESSAGE };
    }
    
    const success = 100 - salvageValue;
    
    return {
      data: [
        { name: "First treatment only (i.e. Focal therapy, Prostatectomy, Radiotherapy)", value: success, color: "#90EE90" },
        { name: "Progressed to different treatment", value: salvageValue, color: "#FF9800" },
      ],
    };
  } catch {
    return { data: [], error: `Unable to calculate ${strategy === "radiotherapy" ? "Radiotherapy" : "Surgery"} prediction` };
  }
};

export interface PatientAnswers {
  cancer_stage?: string;
  t_stage?: string;
  mri_pirad_score?: string;
  mri_visibility?: string;
  psa?: string | number;
  prostate_size?: string | number;
  prostate_volume?: string | number;
  gleason_score?: string;
  gleason?: string;
  max_core_length?: string | number;
  maximal_cancer_core_length?: string | number;
}

/**
 * Main function to calculate waffle data for all treatment strategies
 */
export const calculateAllStrategies = (answers: PatientAnswers) => {
  // Normalize inputs
  const cancerStage = mapCancerStage(answers.cancer_stage || answers.t_stage || "T2");
  const mriVisibility = mapMriVisibility(answers.mri_pirad_score || answers.mri_visibility || "");
  const psa = parseFloat(String(answers.psa || 10));
  const prostateVolume = parseFloat(String(answers.prostate_size || answers.prostate_volume || 30));
  const gleasonScore = mapGleasonScore(answers.gleason_score || answers.gleason || "3+3");
  const maxCoreLength = parseFloat(String(answers.max_core_length || answers.maximal_cancer_core_length || 5));
  
  // Calculate lookup keys
  const stageBucket = cancerStage;
  const psaBucket = getPsaBucket(psa);
  const densityBucket = getPsaDensityBucket(psa, prostateVolume);
  const coreLengthBucket = getCoreLengthBucket(maxCoreLength);
  
  return {
    activeSurveillance: calculateActiveSurveillance(mriVisibility, gleasonScore, coreLengthBucket, densityBucket),
    focalTherapy: calculateFocalTherapy(stageBucket, gleasonScore, psaBucket),
    surgery: calculateRadiotherapyOrSurgery("surgery", stageBucket, gleasonScore, psaBucket),
    radiotherapy: calculateRadiotherapyOrSurgery("radiotherapy", stageBucket, gleasonScore, psaBucket),
  };
};
