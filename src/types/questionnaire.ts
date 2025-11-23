export interface Question {
    id: string;
    text: string;
    type: "radio" | "select" | "number";
    options?: (string | { label: string; value: string | number })[];
    placeholder?: string;
    unit?: string;
    validation?: { min?: number; max?: number; required?: boolean };
    required?: boolean;
}

export interface Section {
    section: string;
    questions: Question[];
}

export interface QuestionnaireData {
    questionnaire: Section[];
}

export type Answers = {
    [questionId: string]: string | number;
};

export type Errors = {
    [questionId: string]: string | undefined;
};
