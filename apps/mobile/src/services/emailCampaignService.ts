import { serverBaseUrl } from '../config';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  scheduledAt?: string;
  sent: boolean;
  createdAt: string;
  updatedAt: string;
export const getEmailCampaigns = async (): Promise<EmailCampaign[]> => {

    fetch(`${serverBaseUrl}/api/email-campaigns`);
  const data = await res.json();
  return data.campaigns;
export const createEmailCampaign = async (payload: Partial<EmailCampaign>): Promise<EmailCampaign> => {

    fetch(`${serverBaseUrl}/api/email-campaigns`, {
    method: 'POST',

    fetch(`${serverBaseUrl}/api/email-campaigns/${id}`, {
    method: 'PUT',

    fetch(`${serverBaseUrl}/api/email-campaigns/${id}`, { method: 'DELETE' });
