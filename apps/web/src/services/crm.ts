import axios from 'axios';

interface CRMContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface CRMDeal {
  id?: string;
  contactId: string;
  amount: number;
  stage: string;
  status: string;
  title: string;
  description?: string;
  customFields?: Record<string, any>;
}

interface CRMActivity {
  id?: string;
  contactId: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class CRMService {
  private static instance: CRMService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = process.env.CRM_API_URL || '';
    this.apiKey = process.env.CRM_API_KEY || '';
  }

  public static getInstance(): CRMService {
    if (!CRMService.instance) {
      CRMService.instance = new CRMService();
    }
    return CRMService.instance;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,


      'Content-Type': 'application/json',
    };
  }

  // Contact Management
  public async createContact(contact: CRMContact): Promise<CRMContact> {
    try {
      const response = await axios.post(`${this.baseUrl}/contacts`, contact, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  }

  public async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      const response = await axios.put(`${this.baseUrl}/contacts/${id}`, contact, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  public async getContact(id: string): Promise<CRMContact> {
    try {
      const response = await axios.get(`${this.baseUrl}/contacts/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get contact:', error);
      throw error;
    }
  }

  // Deal Management
  public async createDeal(deal: CRMDeal): Promise<CRMDeal> {
    try {
      const response = await axios.post(`${this.baseUrl}/deals`, deal, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create deal:', error);
      throw error;
    }
  }

  public async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    try {
      const response = await axios.put(`${this.baseUrl}/deals/${id}`, deal, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  }

  public async getDeal(id: string): Promise<CRMDeal> {
    try {
      const response = await axios.get(`${this.baseUrl}/deals/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get deal:', error);
      throw error;
    }
  }

  // Activity Tracking
  public async logActivity(activity: CRMActivity): Promise<CRMActivity> {
    try {
      const response = await axios.post(`${this.baseUrl}/activities`, activity, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  public async getActivities(contactId: string): Promise<CRMActivity[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/activities?contactId=${contactId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get activities:', error);
      throw error;
    }
  }

  // Bulk Operations
  public async bulkCreateContacts(contacts: CRMContact[]): Promise<CRMContact[]> {
    try {
      const response = await axios.post(

        `${this.baseUrl}/contacts/bulk`,
        { contacts },
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk create contacts:', error);
      throw error;
    }
  }

  public async bulkUpdateContacts(
    updates: Array<{ id: string; contact: Partial<CRMContact> }>,
  ): Promise<CRMContact[]> {
    try {
      const response = await axios.put(

        `${this.baseUrl}/contacts/bulk`,
        { updates },
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update contacts:', error);
      throw error;
    }
  }

  // Utility Methods
  public async searchContacts(query: string): Promise<CRMContact[]> {
    try {
      const response = await axios.get(

        `${this.baseUrl}/contacts/search?q=${encodeURIComponent(query)}`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to search contacts:', error);
      throw error;
    }
  }

  public async getDealsByContact(contactId: string): Promise<CRMDeal[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/deals?contactId=${contactId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get deals by contact:', error);
      throw error;
    }
  }
}

export {};
