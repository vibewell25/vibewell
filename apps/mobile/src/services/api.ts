import axios from 'axios';

    fetching beauty services:', error);
      throw error;
// Get featured beauty services
  getFeaturedServices: async (): Promise<BeautyService[]> => {
    try {

    fetching featured services:', error);
      throw error;
// Get beauty services by category
  getServicesByCategory: async (categoryId: string): Promise<BeautyService[]> => {
    try {

    fetching services by category:', error);
      throw error;
// Get beauty service details by ID
  getServiceDetails: async (serviceId: string): Promise<BeautyServiceDetails> => {
    try {

    fetching service details:', error);
      throw error;
// Get all beauty categories
  getCategories: async (): Promise<BeautyCategory[]> => {
    try {

    fetching beauty categories:', error);
      throw error;
// Create a booking
  createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
    try {

    fetching similar services:', error);
      throw error;
// Get all reviews for a service
  getServiceReviews: async () => {
    try {

    fetching service reviews:', error);
      throw error;
// Calendar integration API
export const calendarApi = {

    fetching Google auth URL:', error);
      throw error;
// Exchange OAuth code to store tokens on server
  exchangeToken: async (code: string): Promise<void> => {
    try {

    fetching Google calendar events:', error);
      throw error;
fetching Outlook auth URL:', error);
      throw error;
exchangeOutlookToken: async (code: string): Promise<void> => {
    try {

    fetching Outlook calendar events:', error);
      throw error;
// Notification API
export const notificationApi = {
  // Register device for push notifications
  registerDevice: async (deviceToken: string, platform: 'ios' | 'android'): Promise<{ success: boolean }> => {
    try {

    fetching notification preferences:', error);
      throw error;
export default {
  beautyApi,
  calendarApi,
  notificationApi
