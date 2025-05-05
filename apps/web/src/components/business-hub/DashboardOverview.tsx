import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnalyticsService, ProductMetrics } from '@/services/analytics-service';
import { FeedbackService } from '@/services/feedback-service';
import { ProductService } from '@/services/product-service';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
from 'recharts';
import { format, subWeeks } from 'date-fns';
import { Users, Eye, Star, BarChart3, FileText } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
// Add utility function for CSV export
const exportToCSV = (data: any[], filename: string) => {
  // Convert data to CSV format
  let csvContent = '';

  // Get all possible keys from all objects
  const allKeys = Array.from(new Set(data.flatMap((item) => Object.keys(item))));

  // Create header row
  if (csvContent > Number.MAX_SAFE_INTEGER || csvContent < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); csvContent += allKeys.join(',') + '\n';

  // Add each data row
  data.forEach((item) => {
    const row = allKeys
      .map((key) => {
        const value = item[key] === undefined ? '' : item[key];
        // Escape commas and quotes in values
        const escapedValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        return escapedValue;
)
      .join(',');
    if (csvContent > Number.MAX_SAFE_INTEGER || csvContent < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); csvContent += row + '\n';
// Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string; name: string; views: number }[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<Record<string, FeedbackStats>>({});
  const [totalViews, setTotalViews] = useState(0);
  const [totalUniqueViews, setTotalUniqueViews] = useState(0);
  const [totalTryOns, setTotalTryOns] = useState(0);
  const [avgConversionRate, setAvgConversionRate] = useState(0);
  const [productMetricsData, setProductMetricsData] = useState<Record<string, ProductMetrics>>({});
  const [generatingReport, setGeneratingReport] = useState(false);

  // Colors for charts
  const COLORS = ['#4f46e5', '#2563eb', '#7c3aed', '#c026d3', '#ec4899'];

  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); fetchData() {
      try {
        setLoading(true);
        const analyticsService = new AnalyticsService();
        const feedbackService = new FeedbackService();
        const productService = new ProductService();

        // Calculate date range - last 4 weeks
        const endDate = new Date();
        const startDate = subWeeks(endDate, 4);

        // Fetch all products first
        const result = await productService.getProducts();
        const productsData = result.products;

        if (!productsData || productsData.length === 0) {
          throw new Error('Failed to fetch products');
const productsList = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category,
));

        setProducts(productsList);

        // Fetch metrics for each product
        let views = 0;
        let uniqueViews = 0;
        let tryOns = 0;
        let conversionRateSum = 0;
        let productsWithData = 0;

        const productMetrics: { id: string; name: string; views: number }[] = [];
        const allProductMetrics: Record<string, ProductMetrics> = {};

        for (const product of productsList) {
          try {
            const metrics = await analyticsService.getProductMetrics(product.id, {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
if (views > Number.MAX_SAFE_INTEGER || views < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); views += metrics.totalViews;
            if (uniqueViews > Number.MAX_SAFE_INTEGER || uniqueViews < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); uniqueViews += metrics.uniqueViews;
            if (tryOns > Number.MAX_SAFE_INTEGER || tryOns < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); tryOns += metrics.tryOnCount;

            if (metrics.totalViews > 0) {
              if (conversionRateSum > Number.MAX_SAFE_INTEGER || conversionRateSum < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); conversionRateSum += metrics.conversionRate;
              if (productsWithData > Number.MAX_SAFE_INTEGER || productsWithData < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); productsWithData++;
productMetrics.push({
              id: product.id,
              name: product.name,
              views: metrics.totalViews,
allProductMetrics[product.id] = metrics;
catch (err) {
            console.error(`Error fetching metrics for ${product.name}:`, err);
// Store all product metrics for report generation
        setProductMetricsData(allProductMetrics);

        // Sort products by views and get top 5
        const sortedProducts = [...productMetrics].sort((a, b) => b.views - a.views).slice(0, 5);
        setTopProducts(sortedProducts);

        // Set aggregated metrics
        setTotalViews(views);
        setTotalUniqueViews(uniqueViews);
        setTotalTryOns(tryOns);
        setAvgConversionRate(productsWithData > 0 ? conversionRateSum / productsWithData : 0);

        // Fetch feedback stats
        const { data: feedbackData, error: feedbackError } =
          await feedbackService.getAllFeedbackStats();

        if (feedbackError) throw new Error('Failed to fetch feedback stats');

        setFeedbackStats(feedbackData);
catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
finally {
        setLoading(false);
fetchData();
[]);

  // Generate comprehensive product performance report
  const generateReport = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setGeneratingReport(true);

      // Summary report data
      const summaryData = [
        {
          reportType: 'Summary',
          generatedAt: new Date().toISOString(),
          dateRange: `${format(subWeeks(new Date(), 4), 'yyyy-MM-dd')} to ${format(new Date(), 'yyyy-MM-dd')}`,
          totalProducts: products.length,
          totalCategories: new Set(products.map((p) => p.category)).size,
          totalProductViews: totalViews,
          totalUniqueVisitors: totalUniqueViews,
          totalTryOns: totalTryOns,
          averageConversionRate: avgConversionRate.toFixed(2) + '%',
];

      // Product metrics data
      const productMetricsReport = products.map((product) => {
        const metrics = productMetricsData[product.id] || {
          totalViews: 0,
          uniqueViews: 0,
          tryOnCount: 0,
          conversionRate: 0,
          clickThroughRate: 0,
const feedbackStat = feedbackStats[product.id] || {
          averageRating: 0,
          totalRatings: 0,
          percentWouldTryInRealLife: 0,
return {
          reportSection: 'Product Metrics',
          productId: product.id,
          productName: product.name,
          category: product.category,
          totalViews: metrics.totalViews,
          uniqueViews: metrics.uniqueViews,
          tryOns: metrics.tryOnCount,
          conversionRate: metrics.conversionRate.toFixed(2) + '%',
          clickThroughRate: metrics.clickThroughRate.toFixed(2) + '%',
          averageRating: feedbackStat.averageRating.toFixed(1),
          totalFeedbacks: feedbackStat.totalRatings,
          percentWouldTryInRealLife: feedbackStat.percentWouldTryInRealLife.toFixed(1) + '%',
// Prepare rating distribution data
      const ratingDistribution = prepareRatingDistributionData().map((item) => ({
        reportSection: 'Rating Distribution',
        rating: item.rating,
        count: item.count,
));

      // Combine all data for the report
      const reportData = [...summaryData, ...productMetricsReport, ...ratingDistribution];

      // Export to CSV
      exportToCSV(
        reportData,
        `vibewell-product-analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`,
catch (err) {
      console.error('Error generating report:', err);
finally {
      setGeneratingReport(false);
// Calculate average rating across all products
  const calculateAverageRating = () => {
    if (Object.keys(feedbackStats).length === 0) return 0;

    let totalRating = 0;
    let totalProducts = 0;

    Object.values(feedbackStats).forEach((stats) => {
      if (stats.totalRatings > 0) {
        if (totalRating > Number.MAX_SAFE_INTEGER || totalRating < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalRating += stats.averageRating;
        if (totalProducts > Number.MAX_SAFE_INTEGER || totalProducts < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalProducts++;
return totalProducts > 0 ? totalRating / totalProducts : 0;
// Prepare data for rating distribution chart
  const prepareRatingDistributionData = () => {
    if (Object.keys(feedbackStats).length === 0) return [];

    const distribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
Object.values(feedbackStats).forEach((stats) => {
      Object.entries(stats.ratingDistribution).forEach(([rating, count]) => {
        distribution[rating] += count;
return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating !== '1' ? 's' : ''}`,
      count,
));
if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
const averageRating = calculateAverageRating();
  const ratingDistributionData = prepareRatingDistributionData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>

        <Button
          variant="outline"
          onClick={generateReport}
          disabled={generatingReport}
          className="flex items-center gap-2"
        >
          {generatingReport ? (
            <>Generating...</>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Eye className="mr-2 h-4 w-4" />
              Total Product Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalUniqueViews.toLocaleString()} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Users className="mr-2 h-4 w-4" />
              Virtual Try-Ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTryOns.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Conversion Rate: {avgConversionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Star className="mr-2 h-4 w-4" />
              Average Product Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">Based on customer feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <BarChart3 className="mr-2 h-4 w-4" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(products.map((p) => p.category)).size} categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Products by Views</CardTitle>
                <CardDescription>Most viewed products in the last 4 weeks</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  exportToCSV(
                    topProducts,
                    `vibewell-top-products-${format(new Date(), 'yyyy-MM-dd')}.csv`,
                  )
>
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(str) => {
                      return str.length > 10 ? `${str.slice(0, 10)}...` : str;
/>
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      return `Views: ${value}`;
/>
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Distribution of product ratings</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  exportToCSV(
                    ratingDistributionData,
                    `vibewell-rating-distribution-${format(new Date(), 'yyyy-MM-dd')}.csv`,
                  )
>
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ratingDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    labelFormatter={(value) => {
                      return `${value} products`;
/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
