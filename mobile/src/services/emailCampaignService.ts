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
}

export const getEmailCampaigns = async (): Promise<EmailCampaign[]> => {
  const res = await fetch(`${serverBaseUrl}/api/email-campaigns`);
  const data = await res.json();
  return data.campaigns;
};

export const createEmailCampaign = async (payload: Partial<EmailCampaign>): Promise<EmailCampaign> => {
  const res = await fetch(`${serverBaseUrl}/api/email-campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateEmailCampaign = async (id: string, payload: Partial<EmailCampaign>): Promise<EmailCampaign> => {
  const res = await fetch(`${serverBaseUrl}/api/email-campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteEmailCampaign = async (id: string): Promise<void> => {
  await fetch(`${serverBaseUrl}/api/email-campaigns/${id}`, { method: 'DELETE' });
};
