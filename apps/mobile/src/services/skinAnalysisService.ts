import { serverBaseUrl } from '../config';

// Define the interface for skin analysis results
export interface SkinCondition {
  name: string;
  severity: number;
  description: string;
export interface ProductRecommendation {
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUri?: string;
export interface Recommendation {
  title: string;
  description: string;
export interface SkinAnalysisResult {
  id: string;
  date: string;
  imageUri?: string;
  overallScore: number;
  conditions: SkinCondition[];
  recommendations: Recommendation[];
  products?: ProductRecommendation[];
export interface SkinAnalysisProgress {
  id: string;
  date: string;
  score: number;
  primaryCondition: string;
  improvementFromLast: number;
// Function to analyze skin from image
export const analyzeSkin = async (uri: string): Promise<SkinAnalysisResult> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would be a fetch call to an API endpoint
    // const formData = new FormData();
    // formData.append('image', {
    //   uri,
    //   type: 'image/jpeg',
    //   name: 'skin_image.jpg',
    // });
    // 
    // const response = await fetch(`${serverBaseUrl}/api/skin-analysis`, {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Server error during skin analysis');
    // }
    // 
    // return await response.json();
    
    // Mock response
    const result: SkinAnalysisResult = {
      id: Math.random().toString(36).substring(2, 15),
      date: new Date().toISOString(),
      imageUri: uri,
      overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      conditions: [
        {
          name: 'Dryness',
          severity: Math.floor(Math.random() * 6) + 3, // Random severity 3-8
          description: 'Your skin shows signs of dehydration. This can lead to flakiness, tightness, and increased sensitivity. Consistent hydration and moisturizing can improve this condition.'
{
          name: 'UV Damage',
          severity: Math.floor(Math.random() * 4) + 1, // Random severity 1-4
          description: 'Minor signs of sun damage are visible. This is common and can lead to premature aging if not addressed. Regular sunscreen application is essential.'
{
          name: 'Uneven Tone',
          severity: Math.floor(Math.random() * 5) + 2, // Random severity 2-6
          description: 'Some areas of your skin show uneven pigmentation. This can be caused by sun exposure, hormonal changes, or post-inflammatory hyperpigmentation.'
],
      recommendations: [
        {
          title: 'Increase Hydration',
          description: 'Use a hydrating serum containing hyaluronic acid twice daily before moisturizer. This will help your skin retain moisture throughout the day.'
{
          title: 'Sun Protection',
          description: 'Apply a broad-spectrum SPF 30+ sunscreen every morning, even on cloudy days, and reapply every 2 hours when outdoors to prevent further UV damage.'
{
          title: 'Even Skin Tone',
          description: 'Incorporate a vitamin C serum in your morning routine to brighten skin and fade dark spots. Use gentle exfoliation 2-3 times per week.'
],
      products: [
        {
          name: 'Hydro Boost Water Gel',
          brand: 'Neutrogena',
          price: 19.99,
          description: 'Lightweight gel moisturizer that delivers hydration to dry skin.',
          imageUri: 'https://example.com/images/hydro-boost.jpg'
{
          name: 'Vitamin C Brightening Serum',
          brand: 'VibeWell Essentials',
          price: 42.50,
          description: 'Stabilized 15% vitamin C formula that brightens and evens skin tone while providing antioxidant protection.',
          imageUri: 'https://example.com/images/vitamin-c-serum.jpg'
{
          name: 'Ultra Light Daily UV Defense SPF 50',
          brand: 'SunShield',
          price: 36.00,
          description: 'Lightweight, non-greasy sunscreen that protects against UVA and UVB rays without clogging pores.',
          imageUri: 'https://example.com/images/sunscreen.jpg'
]
return result;
catch (error) {
    console.error('Error analyzing skin:', error);
    throw new Error('Failed to analyze skin image');
// Function to get skin analysis history
export const getSkinAnalysisHistory = async (): Promise<SkinAnalysisProgress[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would be a fetch call to an API endpoint
    // const response = await fetch(`${serverBaseUrl}/api/skin-analysis/history`, {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Server error fetching history');
    // }
    // 
    // return await response.json();
    
    // Mock history data for the last 90 days
    const history: SkinAnalysisProgress[] = [];
    
    // Create entries for every ~15 days in the past 90 days
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 15 + Math.floor(Math.random() * 5)));
      
      // Randomize improvement (higher chance of improvement for newer entries)
      const improvementChance = i < 3 ? 0.7 : 0.4;
      const improvementValue = Math.random() > improvementChance 
        ? -1 * (Math.floor(Math.random() * 8) + 1) 
        : Math.floor(Math.random() * 10) + 1;
      
      history.push({
        id: Math.random().toString(36).substring(2, 15),
        date: date.toISOString(),
        score: Math.max(40, Math.min(95, 65 + improvementValue + (i < 3 ? 10 : 0))),
        primaryCondition: i % 3 === 0 ? 'Dryness' : i % 3 === 1 ? 'UV Damage' : 'Uneven Tone',
        improvementFromLast: i === 0 ? 0 : improvementValue,
// Sort by date, most recent first
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
catch (error) {
    console.error('Error fetching skin analysis history:', error);
    throw new Error('Failed to load skin analysis history');
// Function to get a specific skin analysis result
export const getSkinAnalysisResult = async (id: string): Promise<SkinAnalysisResult> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would be a fetch call to an API endpoint
    // const response = await fetch(`${serverBaseUrl}/api/skin-analysis/${id}`, {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Server error fetching analysis result');
    // }
    // 
    // return await response.json();
    
    // Mock detailed result
    return {
      id,
      date: new Date().toISOString(),
      imageUri: 'https://example.com/images/skin_analysis_sample.jpg',
      overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      conditions: [
        {
          name: 'Dryness',
          severity: Math.floor(Math.random() * 6) + 3, // Random severity 3-8
          description: 'Your skin shows signs of dehydration. This can lead to flakiness, tightness, and increased sensitivity. Consistent hydration and moisturizing can improve this condition.'
{
          name: 'UV Damage',
          severity: Math.floor(Math.random() * 4) + 1, // Random severity 1-4
          description: 'Minor signs of sun damage are visible. This is common and can lead to premature aging if not addressed. Regular sunscreen application is essential.'
{
          name: 'Uneven Tone',
          severity: Math.floor(Math.random() * 5) + 2, // Random severity 2-6
          description: 'Some areas of your skin show uneven pigmentation. This can be caused by sun exposure, hormonal changes, or post-inflammatory hyperpigmentation.'
],
      recommendations: [
        {
          title: 'Increase Hydration',
          description: 'Use a hydrating serum containing hyaluronic acid twice daily before moisturizer. This will help your skin retain moisture throughout the day.'
{
          title: 'Sun Protection',
          description: 'Apply a broad-spectrum SPF 30+ sunscreen every morning, even on cloudy days, and reapply every 2 hours when outdoors to prevent further UV damage.'
{
          title: 'Even Skin Tone',
          description: 'Incorporate a vitamin C serum in your morning routine to brighten skin and fade dark spots. Use gentle exfoliation 2-3 times per week.'
{
          title: 'Consistent Routine',
          description: 'Follow a consistent skincare routine morning and night to improve overall skin health and maximize the benefits of your products.'
],
      products: [
        {
          name: 'Hydro Boost Water Gel',
          brand: 'Neutrogena',
          price: 19.99,
          description: 'Lightweight gel moisturizer that delivers hydration to dry skin.',
          imageUri: 'https://example.com/images/hydro-boost.jpg'
{
          name: 'Vitamin C Brightening Serum',
          brand: 'VibeWell Essentials',
          price: 42.50,
          description: 'Stabilized 15% vitamin C formula that brightens and evens skin tone while providing antioxidant protection.',
          imageUri: 'https://example.com/images/vitamin-c-serum.jpg'
{
          name: 'Ultra Light Daily UV Defense SPF 50',
          brand: 'SunShield',
          price: 36.00,
          description: 'Lightweight, non-greasy sunscreen that protects against UVA and UVB rays without clogging pores.',
          imageUri: 'https://example.com/images/sunscreen.jpg'
]
catch (error) {
    console.error('Error fetching skin analysis result:', error);
    throw new Error('Failed to load skin analysis details');
