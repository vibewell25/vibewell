export interface FieldDefinition {
  name: string;
  type: string; // e.g., 'text', 'number', 'select', etc.
  label: string;

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
