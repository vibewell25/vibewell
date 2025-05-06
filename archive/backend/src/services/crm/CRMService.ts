import axios from 'axios';
import type { IUser } from '../../models/User';

interface CRMConfig {
  salesforce?: {
    clientId: string;
    clientSecret: string;
    instanceUrl: string;
    accessToken: string;
hubspot?: {
    apiKey: string;
    portalId: string;
zendesk?: {
    subdomain: string;
    apiToken: string;
    email: string;
interface ContactData {
  email: string;
  name: string;
  phone?: string;
  company?: string;
  source?: string;
  customFields?: Record<string, any>;
interface DealData {
  contactId: string;
  amount: number;
  stage: string;
  probability?: number;
  expectedCloseDate?: Date;
  customFields?: Record<string, any>;
interface TicketData {
  contactId: string;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  customFields?: Record<string, any>;
class CRMService {
  private static instance: CRMService;
  private config: CRMConfig;

  private constructor(config: CRMConfig) {
    this.config = config;
public static getInstance(config?: CRMConfig): CRMService {
    if (!CRMService.instance && config) {
      CRMService.instance = new CRMService(config);
return CRMService.instance;
// Salesforce Integration
  private async salesforceRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.salesforce) {
      throw new Error('Salesforce configuration not found');
try {
      const response = await axios({
        method,
        url: `${this.config.salesforce.instanceUrl}/services/data/v52.0${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.config.salesforce.accessToken}`,
          'Content-Type': 'application/json'
data
return response.data;
catch (error) {
      console.error('Salesforce API error:', error);
      throw error;
// HubSpot Integration
  private async hubspotRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.hubspot) {
      throw new Error('HubSpot configuration not found');
try {
      const response = await axios({
        method,
        url: `https://api.hubapi.com/crm/v3${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.config.hubspot.apiKey}`,
          'Content-Type': 'application/json'
data
return response.data;
catch (error) {
      console.error('HubSpot API error:', error);
      throw error;
// Zendesk Integration
  private async zendeskRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.zendesk) {
      throw new Error('Zendesk configuration not found');
const auth = Buffer.from(`${this.config.zendesk.email}/token:${this.config.zendesk.apiToken}`).toString('base64');

    try {
      const response = await axios({
        method,
        url: `https://${this.config.zendesk.subdomain}.zendesk.com/api/v2${endpoint}`,
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
data
return response.data;
catch (error) {
      console.error('Zendesk API error:', error);
      throw error;
// Contact Management
  public async createContact(data: ContactData, provider: 'salesforce' | 'hubspot' | 'zendesk'): Promise<any> {
    switch (provider) {
      case 'salesforce':
        return this.salesforceRequest('POST', '/sobjects/Contact', {
          Email: data.email,
          Name: data.name,
          Phone: data.phone,
          ...data.customFields
case 'hubspot':
        return this.hubspotRequest('POST', '/objects/contacts', {
          properties: {
            email: data.email,
            firstname: data.name.split(' ')[0],
            lastname: data.name.split(' ').slice(1).join(' '),
            phone: data.phone,
            company: data.company,
            ...data.customFields
case 'zendesk':
        return this.zendeskRequest('POST', '/users', {
          user: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            custom_fields: data.customFields
default:
        throw new Error('Unsupported CRM provider');
// Deal Management
  public async createDeal(data: DealData, provider: 'salesforce' | 'hubspot'): Promise<any> {
    switch (provider) {
      case 'salesforce':
        return this.salesforceRequest('POST', '/sobjects/Opportunity', {
          ContactId: data.contactId,
          Amount: data.amount,
          StageName: data.stage,
          Probability: data.probability,
          CloseDate: data.expectedCloseDate,
          ...data.customFields
case 'hubspot':
        return this.hubspotRequest('POST', '/objects/deals', {
          properties: {
            amount: data.amount,
            dealstage: data.stage,
            probability: data.probability,
            closedate: data.expectedCloseDate,
            ...data.customFields
associations: [
            {
              to: { id: data.contactId },
              types: [{ category: 'HUBSPOT_DEFINED', typeId: 3 }]
]
default:
        throw new Error('Unsupported CRM provider for deals');
// Ticket Management
  public async createTicket(data: TicketData, provider: 'zendesk'): Promise<any> {
    switch (provider) {
      case 'zendesk':
        return this.zendeskRequest('POST', '/tickets', {
          ticket: {
            requester_id: data.contactId,
            subject: data.subject,
            comment: { body: data.description },
            priority: data.priority,
            status: data.status,
            custom_fields: data.customFields
default:
        throw new Error('Unsupported CRM provider for tickets');
// Sync User to CRM
  public async syncUserToCRM(user: IUser, provider: 'salesforce' | 'hubspot' | 'zendesk'): Promise<void> {
    try {
      const contactData = {
        email: user.email,
        name: user.name,
        ...(user.phoneNumber ? { phone: user.phoneNumber } : {}),
        customFields: {
          emailVerified: user.emailVerified,
          authProvider: user.authProvider,
          createdAt: user.createdAt
await this.createContact(contactData, provider);
catch (error) {
      console.error(`Failed to sync user to ${provider}:`, error);
      throw error;
// Batch Operations
  public async batchSyncUsers(users: IUser[], provider: 'salesforce' | 'hubspot' | 'zendesk'): Promise<void> {
    const batchSize = 50; // Adjust based on API limits
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(batch.map(user => this.syncUserToCRM(user, provider)));
export default CRMService; 