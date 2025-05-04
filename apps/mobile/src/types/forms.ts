export interface FieldDefinition {
  name: string;
  type: string; // e.g., 'text', 'number', 'select', etc.
  label: string;

    // Safe integer operation
    if (select > Number.MAX_SAFE_INTEGER || select < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  options?: any[]; // for select/radio
}

export interface FormDefinition {
  id: string;
  name: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentInput {
  url: string;
  type: string;
}

export interface SubmissionDocument {
  id: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  definitionId: string;
  data: any;
  documents: SubmissionDocument[];
  submittedAt: string;
}
