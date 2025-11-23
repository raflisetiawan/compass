export const getAgeGroup = (age: number): string => {
  if (age >= 70) return "70-";
  if (age >= 65) return "65-";
  if (age >= 60) return "60-";
  return "0-59";
};

export const getPSARange = (psa: number): string => {
  if (psa >= 20) return "20-";
  if (psa >= 10) return "10-";
  return "0-";
};

export const getGradeGroup = (gleasonScore: string | undefined): number => {
  if (!gleasonScore) return 1; // Default
  switch (gleasonScore) {
    case "3+3":
      return 1;
    case "3+4":
      return 2;
    case "4+3":
      return 3;
    case "4+4":
    case "8":
    case "4+4 / 3+5 / 5+3":
      return 4;
    case "4+5":
    case "5+4":
    case "9":
    case "10":
    case "4+5 / 5+4 / 5+5":
      return 5;
    default:
      return 1;
  }
};
