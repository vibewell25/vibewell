import axios from 'axios';

    import CRMService from '../crm/CRMService';

    import { User } from '../../models/User';

// Mock dependencies
jest.mock('axios');

describe('CRMService', () => {
  let crmService: typeof CRMService;
  const mockConfig = {
    salesforce: {

    clientId: 'salesforce-client-id',

    clientSecret: 'salesforce-client-secret',
      instanceUrl: 'https://test.salesforce.com',

    accessToken: 'salesforce-access-token'
hubspot: {

    apiKey: 'hubspot-api-key',

    portalId: 'hubspot-portal-id'
zendesk: {

    subdomain: 'test-company',

    apiToken: 'zendesk-api-token',
      email: 'admin@test.com'
};

  const mockContactData = {
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    company: 'Test Company',
    source: 'Website',
    customFields: {
      role: 'Developer',
      department: 'Engineering'
};

  const mockDealData = {

    contactId: 'contact-123',
    amount: 1000,
    stage: 'Proposal',
    probability: 0.7,
    expectedCloseDate: new Date('2024-03-01'),
    customFields: {
      dealType: 'New Business',
      priority: 'High'
};

  const mockTicketData = {

    contactId: 'contact-123',
    subject: 'Test Ticket',
    description: 'Test Description',
    priority: 'high' as const,
    status: 'new' as const,
    customFields: {
      category: 'Technical',
      source: 'Email'
};

  const mockUser: User = {

    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '+1234567890',
    role: 'user',
    emailVerified: true,
    authProvider: 'google',
    twoFactorEnabled: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
beforeEach(() => {
    jest.clearAllMocks();
    crmService = CRMService.getInstance(mockConfig);
describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = CRMService.getInstance(mockConfig);
      expect(instance).toBeDefined();
it('should return existing instance without config', () => {
      const instance1 = CRMService.getInstance(mockConfig);
      const instance2 = CRMService.getInstance();
      expect(instance1).toBe(instance2);
describe('Salesforce Integration', () => {
    const mockSalesforceResponse = {

    data: { id: 'sf-123', success: true }
beforeEach(() => {
      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockSalesforceResponse);
it('should create a contact in Salesforce', async () => {
      const result = await crmService.createContact(mockContactData, 'salesforce');
      expect(result).toEqual(mockSalesforceResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/services/data/v52.0/sobjects/Contact'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should create a deal in Salesforce', async () => {
      const result = await crmService.createDeal(mockDealData, 'salesforce');
      expect(result).toEqual(mockSalesforceResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/services/data/v52.0/sobjects/Opportunity'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should handle Salesforce API errors', async () => {
      const error = new Error('Salesforce API Error');
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(error);

      await expect(
        crmService.createContact(mockContactData, 'salesforce')
      ).rejects.toThrow('Salesforce API Error');
describe('HubSpot Integration', () => {
    const mockHubSpotResponse = {

    data: { id: 'hs-123', properties: {} }
beforeEach(() => {
      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockHubSpotResponse);
it('should create a contact in HubSpot', async () => {
      const result = await crmService.createContact(mockContactData, 'hubspot');
      expect(result).toEqual(mockHubSpotResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/crm/v3/objects/contacts'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should create a deal in HubSpot', async () => {
      const result = await crmService.createDeal(mockDealData, 'hubspot');
      expect(result).toEqual(mockHubSpotResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/crm/v3/objects/deals'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should handle HubSpot API errors', async () => {
      const error = new Error('HubSpot API Error');
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(error);

      await expect(
        crmService.createContact(mockContactData, 'hubspot')
      ).rejects.toThrow('HubSpot API Error');
describe('Zendesk Integration', () => {
    const mockZendeskResponse = {

    data: { user: { id: 'zd-123' } }
beforeEach(() => {
      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockZendeskResponse);
it('should create a contact in Zendesk', async () => {
      const result = await crmService.createContact(mockContactData, 'zendesk');
      expect(result).toEqual(mockZendeskResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/api/v2/users'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should create a ticket in Zendesk', async () => {
      const result = await crmService.createTicket(mockTicketData, 'zendesk');
      expect(result).toEqual(mockZendeskResponse.data);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',

    url: expect.stringContaining('/api/v2/tickets'),
        headers: expect.any(Object),
        data: expect.any(Object)
it('should handle Zendesk API errors', async () => {
      const error = new Error('Zendesk API Error');
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(error);

      await expect(
        crmService.createContact(mockContactData, 'zendesk')
      ).rejects.toThrow('Zendesk API Error');
describe('User Sync Operations', () => {
    it('should sync a user to Salesforce', async () => {
      await crmService.syncUserToCRM(mockUser, 'salesforce');
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',

    url: expect.stringContaining('/services/data/v52.0/sobjects/Contact')
));
it('should sync a user to HubSpot', async () => {
      await crmService.syncUserToCRM(mockUser, 'hubspot');
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',

    url: expect.stringContaining('/crm/v3/objects/contacts')
));
it('should sync a user to Zendesk', async () => {
      await crmService.syncUserToCRM(mockUser, 'zendesk');
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',

    url: expect.stringContaining('/api/v2/users')
));
it('should handle sync errors gracefully', async () => {
      const error = new Error('Sync failed');
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        crmService.syncUserToCRM(mockUser, 'salesforce')
      ).rejects.toThrow('Sync failed');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sync user to salesforce:', error);
      consoleSpy.mockRestore();
describe('Batch Operations', () => {

    const mockUsers = [mockUser, { ...mockUser, id: 'user-456' }];

    it('should batch sync users successfully', async () => {
      await crmService.batchSyncUsers(mockUsers, 'salesforce');
      expect(axios).toHaveBeenCalledTimes(2);
it('should handle batch sync errors gracefully', async () => {
      const error = new Error('Batch sync failed');
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        crmService.batchSyncUsers(mockUsers, 'salesforce')
      ).rejects.toThrow('Batch sync failed');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
describe('Error Handling', () => {
    it('should throw error for unsupported CRM provider', async () => {
      await expect(
        crmService.createContact(mockContactData, 'invalid' as any)
      ).rejects.toThrow('Unsupported CRM provider');
it('should throw error for missing configuration', async () => {
      const invalidConfig = { ...mockConfig };
      delete invalidConfig.salesforce;
      const service = CRMService.getInstance(invalidConfig);

      await expect(
        service.createContact(mockContactData, 'salesforce')
      ).rejects.toThrow('Salesforce configuration not found');
