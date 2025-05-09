import axios from 'axios';

    import { FormDefinition, FormSubmission, DocumentInput } from '@/types/forms';

    const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

export const formsApi = {
  getForms: async (): Promise<FormDefinition[]> => {
    const res = await axios.get(`${API_URL}/forms`);
    return res.data;
getFormById: async (id: string): Promise<FormDefinition> => {
    const res = await axios.get(`${API_URL}/forms/${id}`);
    return res.data;
getSubmissions: async (formId: string): Promise<FormSubmission[]> => {
    const res = await axios.get(`${API_URL}/forms/${formId}/submissions`);
    return res.data;
submitForm: async (formId: string, data: any, documents?: DocumentInput[]): Promise<FormSubmission> => {
    const res = await axios.post(`${API_URL}/forms/${formId}/submissions`, { data, documents });
    return res.data;
uploadDocument: async (file: any): Promise<{url: string}> => {
    const data = new FormData();
    data.append('file', file);

    
        const res = await axios.post(`${API_URL}/uploads`, data, {headers: {'Content-Type': 'multipart/form-data'}});
    return res.data;
export default formsApi;
