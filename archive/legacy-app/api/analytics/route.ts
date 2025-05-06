import { NextRequest, NextResponse } from 'next/server';

// Simpler analytics service implementation
interface AnalyticsData {
  from: Date;
  to: Date;
class AnalyticsService {
  async getRevenueAnalytics(dateRange: AnalyticsData) {
    return { total: 0, byService: [], byDay: [] };
async getAppointmentAnalytics(dateRange: AnalyticsData) {
    return { total: 0, completed: 0, cancelled: 0, byService: [], byDay: [] };
async getClientAnalytics(dateRange: AnalyticsData) {
    return { total: 0, new: 0, returning: 0, bySource: [] };
async getServiceAnalytics(dateRange: AnalyticsData) {
    return { popular: [], byBookingCount: [], byRevenue: [] };
async getPeakHourAnalytics(dateRange: AnalyticsData) {
    return { byHour: [], byDay: [] };
async getStaffPerformance(dateRange: AnalyticsData) {
    return { byBookingCount: [], byRevenue: [], utilization: [] };
const analyticsService = new AnalyticsService();

// Mock static data that can be used for development and static rendering
const MOCK_ANALYTICS_DATA = {
  revenue: { total: 5000, byService: [], byDay: [] },
  appointments: { total: 120, completed: 100, cancelled: 20, byService: [], byDay: [] },
  clients: { total: 80, new: 25, returning: 55, bySource: [] },
  services: { popular: [], byBookingCount: [], byRevenue: [] },
  peakHours: { byHour: [], byDay: [] },
  staffPerformance: { byBookingCount: [], byRevenue: [], utilization: [] },
export async function GET() {
  // Use static data for rendering
  return NextResponse.json(MOCK_ANALYTICS_DATA);
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, we would validate and store the analytics data
    console.log('Analytics event received:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded',
      eventId: 'evt_' + Math.random().toString(36).substr(2, 9)
catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to record analytics event' 
{ status: 400 });
