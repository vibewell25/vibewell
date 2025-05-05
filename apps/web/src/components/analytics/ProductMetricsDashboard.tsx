import { useEffect, useState } from 'react';
import { AnalyticsService, ProductMetrics } from '@/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
from 'recharts';
import { ArrowUp, ArrowDown, Download, Search } from 'lucide-react';
import { ProductService } from '@/services/product-service';
import { Input } from '@/components/ui/Input';

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
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
interface ProductMetricsDashboardProps {
  productId?: string; // Optional - if provided, show data for a specific product only
export default function ProductMetricsDashboard({ productId }: ProductMetricsDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(productId || null);
  const [metrics, setMetrics] = useState<Record<string, ProductMetrics>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Colors for charts
  const COLORS = ['#4f46e5', '#2563eb', '#7c3aed', '#c026d3', '#ec4899', '#10b981'];

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const end = new Date();
    let start;

    switch (timeRange) {
      case 'day':
        start = subDays(end, 1);
        break;
      case 'month':
        start = subMonths(end, 1);
        break;
      case 'week':
      default:
        start = subWeeks(end, 1);
        break;
return {
      start: start.toISOString(),
      end: end.toISOString(),
// Fetch products
  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); fetchProducts() {
      try {
        const productService = new ProductService();
        const { data, error } = await productService.getAllProducts();

        if (error) throw error;

        const productList = data.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
));

        setProducts(productList);

        // If no product is selected and we have products, select the first one
        if (!selectedProductId && productList.length > 0 && !productId) {
          setSelectedProductId(productList[0].id);
catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
fetchProducts();
[]);

  // Fetch metrics whenever the selected product or time range changes
  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); fetchMetrics() {
      if (!selectedProductId && !productId) return;

      setLoading(true);
      setError(null);

      try {
        const analyticsService = new AnalyticsService();
        const { start, end } = getDateRange();

        // If a specific product is selected, fetch only that product's metrics
        if (selectedProductId || productId) {
          const productIdToUse = selectedProductId || productId;
          const productMetrics = await analyticsService.getProductMetrics(productIdToUse!, {
            start,
            end,
setMetrics({
            [productIdToUse!]: productMetrics,
else {
          // Fetch metrics for all products (simplified for this example)
          // In a real implementation, you might want a separate endpoint to get all metrics at once
          const metricsMap: Record<string, ProductMetrics> = {};

          for (const product of products) {
            const productMetrics = await analyticsService.getProductMetrics(product.id, {
              start,
              end,
metricsMap[product.id] = productMetrics;
setMetrics(metricsMap);
catch (err) {
        console.error('Error fetching product metrics:', err);
        setError('Failed to load metrics data');
finally {
        setLoading(false);
fetchMetrics();
[selectedProductId, timeRange]);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
// Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
if (loading && Object.keys(metrics).length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
const selectedMetrics = selectedProductId ? metrics[selectedProductId] : null;
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  if (!selectedMetrics || !selectedProduct) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Product Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a product to view metrics.</p>
        </CardContent>
      </Card>
// Prepare comparison data for views, unique views and try-ons
  const viewsComparisonData = Object.entries(metrics)
    .map(([id, productMetrics]) => {
      const product = products.find((p) => p.id === id);
      return {
        id,
        name: product.name || `Product ${id.substring(0, 6)}`,
        views: productMetrics.totalViews,
        uniqueViews: productMetrics.uniqueViews,
        tryOns: productMetrics.tryOnCount,
)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Prepare conversion and CTR data
  const conversionData = Object.entries(metrics)
    .map(([id, productMetrics]) => {
      const product = products.find((p) => p.id === id);
      return {
        id,
        name: product.name || `Product ${id.substring(0, 6)}`,
        conversion: productMetrics.conversionRate,
        ctr: productMetrics.clickThroughRate,
)
    .sort((a, b) => b.conversion - a.conversion)
    .slice(0, 10);

  // Generate mock time series data (in a real app, you would fetch this from the API)
  const generateTimeSeriesData = () => {
    const { start, end } = getDateRange();
    const startDate = new Date(start);
    const endDate = new Date(end);
    const data = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const baseViews = Math.floor(Math.random() * 100) + 50;
      data.push({
        date: format(currentDate, 'MMM dd'),
        views: baseViews,
        uniqueViews: Math.floor(baseViews * 0.7),
        tryOns: Math.floor(baseViews * 0.3),
if (timeRange === 'day') {
        // Hourly for day view
        currentDate = new Date(currentDate.setHours(currentDate.getHours() + 2));
else if (timeRange === 'week') {
        // Daily for week view
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
else {
        // Every few days for month view
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 3));
return data;
const timeSeriesData = generateTimeSeriesData();

  // Add handlers for exporting data
  const handleExportMetrics = () => {
    if (!selectedMetrics || !selectedProduct) return;

    const { start, end } = getDateRange();
    const startDate = format(new Date(start), 'yyyy-MM-dd');
    const endDate = format(new Date(end), 'yyyy-MM-dd');

    const exportData = [
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        subcategory: selectedProduct.subcategory,
        brand: selectedProduct.brand,
        totalViews: selectedMetrics.totalViews,
        uniqueViews: selectedMetrics.uniqueViews,
        tryOnCount: selectedMetrics.tryOnCount,
        conversionRate: selectedMetrics.conversionRate,
        clickThroughRate: selectedMetrics.clickThroughRate,
        timeRange: `${startDate} to ${endDate}`,
];

    exportToCSV(
      exportData,
      `product-metrics-${selectedProduct.name}-${startDate}-to-${endDate}.csv`,
const handleExportComparisonData = (dataType: 'views' | 'conversion') => {
    if (dataType === 'views' && viewsComparisonData.length > 0) {
      const { start, end } = getDateRange();
      const startDate = format(new Date(start), 'yyyy-MM-dd');
      const endDate = format(new Date(end), 'yyyy-MM-dd');

      exportToCSV(viewsComparisonData, `product-views-comparison-${startDate}-to-${endDate}.csv`);
else if (dataType === 'conversion' && conversionData.length > 0) {
      const { start, end } = getDateRange();
      const startDate = format(new Date(start), 'yyyy-MM-dd');
      const endDate = format(new Date(end), 'yyyy-MM-dd');

      exportToCSV(conversionData, `product-conversion-comparison-${startDate}-to-${endDate}.csv`);
const handleExportTimeSeriesData = () => {
    if (timeSeriesData.length > 0) {
      const { start, end } = getDateRange();
      const startDate = format(new Date(start), 'yyyy-MM-dd');
      const endDate = format(new Date(end), 'yyyy-MM-dd');

      exportToCSV(
        timeSeriesData,
        `product-${selectedProduct.name}-time-series-${startDate}-to-${endDate}.csv`,
return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              className="w-full pl-8 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-4 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className={`rounded-md px-3 py-1 text-sm ${
                  selectedProductId === product.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
`}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExportMetrics}
            title="Export current product metrics to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{selectedMetrics.totalViews}</div>
              {timeRange !== 'day' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">12%</span>
                  <span className="ml-1">vs. previous</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{selectedMetrics.uniqueViews}</div>
              {timeRange !== 'day' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">8%</span>
                  <span className="ml-1">vs. previous</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Try-On Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{selectedMetrics.tryOnCount}</div>
              {timeRange !== 'day' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">3%</span>
                  <span className="ml-1">vs. previous</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:inline-grid md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Performance Summary</CardTitle>
                  <CardDescription>
                    Metrics for {selectedProduct.name} (
                    {format(new Date(selectedMetrics.timeRange.start), 'MMM dd, yyyy')} -{' '}
                    {format(new Date(selectedMetrics.timeRange.end), 'MMM dd, yyyy')})
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportTimeSeriesData}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stackId="1"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueViews"
                      stackId="2"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                    />
                    <Area
                      type="monotone"
                      dataKey="tryOns"
                      stackId="3"
                      stroke={COLORS[2]}
                      fill={COLORS[2]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>Click-through and try-on conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium">Click-Through Rate</div>
                      <div className="text-sm font-medium">
                        {selectedMetrics.clickThroughRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(selectedMetrics.clickThroughRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium">Try-On Conversion</div>
                      <div className="text-sm font-medium">
                        {selectedMetrics.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(selectedMetrics.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Information about {selectedProduct.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="text-sm font-medium">{selectedProduct.category}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-sm text-muted-foreground">Subcategory</div>
                    <div className="text-sm font-medium">{selectedProduct.subcategory}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-sm text-muted-foreground">Brand</div>
                    <div className="text-sm font-medium">{selectedProduct.brand}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-sm text-muted-foreground">Try-On to View Ratio</div>
                    <div className="text-sm font-medium">
                      {selectedMetrics.totalViews > 0
                        ? `${((selectedMetrics.tryOnCount / selectedMetrics.totalViews) * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
                    <div className="text-sm font-medium">2m 15s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>View and conversion trends over time</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportTimeSeriesData}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke={COLORS[0]} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="uniqueViews" stroke={COLORS[1]} />
                    <Line type="monotone" dataKey="tryOns" stroke={COLORS[2]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Views Comparison</CardTitle>
                  <CardDescription>Compare views and try-ons across top products</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportComparisonData('views')}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={viewsComparisonData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Total Views" fill={COLORS[0]} />
                    <Bar dataKey="uniqueViews" name="Unique Views" fill={COLORS[1]} />
                    <Bar dataKey="tryOns" name="Try-Ons" fill={COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversion Rate Comparison</CardTitle>
                  <CardDescription>
                    Compare try-on conversion and click-through rates
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportComparisonData('conversion')}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="conversion" name="Try-On Conversion (%)" fill={COLORS[3]} />
                    <Bar dataKey="ctr" name="Click-Through Rate (%)" fill={COLORS[4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
