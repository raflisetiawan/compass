export type User = {
  uid?: string;
  role: 'staff' | 'patient';
  accessCode?: string;
};

export type ClinicalParameters = { [key: string]: string | number };
export type BaselineFunction = { [key: string]: string | number };
export type ModalContentType = null | "clinical" | "baseline";

export interface SurvivalData {
  "Age Group": string;
  "T Stage": number | string;
  "Grade Group": number;
  PSA: string;
  "Total (N)": number | string;
  "Alive (n)": number | string;
  "Alive (%)": number | string;
  "PCa Death (n)": number | string;
  "PCa Death (%)": number | string;
  "Other Death (n)": number | string;
  "Other Death (%)": number | string;
}
