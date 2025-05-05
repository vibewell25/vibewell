import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsAlertService } from '@/services/analytics-alert-service';
import { Alert } from '@/services/analytics-alert-service';
import { AlertDialog } from '@/components/alerts/alert-dialog';
import { Button } from '@/components/ui/Button';
import { Alert as AlertUI, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, Bell, BellOff, MoreVertical, Edit, Trash2, Plus } from 'lucide-react';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user.id) {
      loadAlerts();
[user]);

  const loadAlerts = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    setLoading(true);
    setError(null);

    try {
      const alertService = new AnalyticsAlertService();
      const response = await alertService.getAlertsByUser(user.id || '');

      if (response.error) {
        throw new Error(response.error.message);
if (response.data) {
        setAlerts(response.data);
catch (error) {
      console.error('Error loading alerts:', error);
      setError('Failed to load alerts. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
finally {
      setLoading(false);
const handleCreateAlert = () => {
    setSelectedAlert(undefined);
    setIsDialogOpen(true);
const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
const handleDeleteAlert = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');alert: Alert) => {
    try {
      const alertService = new AnalyticsAlertService();
      const response = await alertService.deleteAlert(alert.id);

      if (response.error) {
        throw new Error(response.error.message);
// Remove from state
      setAlerts(alerts.filter((a) => a.id !== alert.id));

      toast({
        title: 'Success',
        description: 'Alert deleted successfully',
        variant: 'default',
catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
const handleToggleAlert = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');alert: Alert) => {
    try {
      const alertService = new AnalyticsAlertService();
      const updatedAlert = { ...alert, isActive: !alert.isActive };

      const response = await alertService.updateAlert(alert.id, updatedAlert);

      if (response.error) {
        throw new Error(response.error.message);
if (response.data) {
        // Update in state
        setAlerts(alerts.map((a) => (a.id === alert.id ? response.data : a)));

        toast({
          title: 'Success',
          description: `Alert ${alert.isActive ? 'disabled' : 'enabled'} successfully`,
          variant: 'default',
catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert status',
        variant: 'destructive',
const handleAlertSuccess = (alert: Alert) => {
    const existingIndex = alerts.findIndex((a) => a.id === alert.id);

    if (existingIndex >= 0) {
      // Update existing alert
      setAlerts(alerts.map((a) => (a.id === alert.id ? alert : a)));
else {
      // Add new alert
      setAlerts([...alerts, alert]);
const getMetricDisplayName = (metricType: string) => {
    const metricMap: Record<string, string> = {
      views: 'Product Views',
      uniqueVisitors: 'Unique Visitors',
      tryOns: 'Try-Ons',
      conversion: 'Conversion Rate',
      rating: 'Rating',
return metricMap[metricType] || metricType;
const getThresholdDisplay = (alert: Alert) => {
    const metric = getMetricDisplayName(alert.threshold.metricType);
    const condition = alert.threshold.condition === 'above' ? 'above' : 'below';
    let value = alert.threshold.value;

    // Add % for conversion rate
    if (alert.threshold.metricType === 'conversion') {
      value = `${value}%`;
return `${metric} ${condition} ${value}`;
const getTimeframeDisplay = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
else if (hours === 24) {
      return '1 day';
else if (hours === 168) {
      return '1 week';
else {
      return `${Math.floor(hours / 24)} days`;
const getProductSpecificText = (alert: Alert) => {
    return alert.productId ? 'Product specific' : 'All products';
const getNotificationMethodsDisplay = (alert: Alert) => {
    const methods = alert.notificationMethods.filter((m) => m.enabled).map((m) => m.type);

    if (methods.length === 0) {
      return 'None';
return methods
      .map((m) => {
        if (m === 'email') return 'Email';
        if (m === 'sms') return 'SMS';
        if (m === 'inApp') return 'In-App';
        return m;
)
      .join(', ');
const filteredAlerts =
    activeTab === 'all'
      ? alerts
      : activeTab === 'active'
        ? alerts.filter((alert) => alert.isActive)
        : alerts.filter((alert) => !alert.isActive);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AlertUI variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You must be logged in to view this page.</AlertDescription>
        </AlertUI>
      </div>
return (
    <div className="container mx-auto max-w-screen-xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Alerts</h1>
          <p className="mt-1 text-muted-foreground">
            Manage alerts for your products' performance metrics
          </p>
        </div>
        <Button onClick={handleCreateAlert}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {error && (
        <AlertUI variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </AlertUI>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Alerts</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            You have {alerts.length} alert{alerts.length !== 1 ? 's' : ''} configured.
            {activeTab === 'active' && <> {alerts.filter((a) => a.isActive).length} active.</>}
            {activeTab === 'inactive' && <> {alerts.filter((a) => !a.isActive).length} inactive.</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No alerts found</h3>
              <p className="mt-2 text-muted-foreground">
                {activeTab === 'all'
                  ? "You haven't created any alerts yet."
                  : activeTab === 'active'
                    ? "You don't have any active alerts."
                    : "You don't have any inactive alerts."}
              </p>
              {activeTab !== 'all' && (
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('all')}>
                  View all alerts
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Alert Name</TableHead>
                    <TableHead>Trigger Condition</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.name}</TableCell>
                      <TableCell>{getThresholdDisplay(alert)}</TableCell>
                      <TableCell>{getTimeframeDisplay(alert.threshold.timeframeHours)}</TableCell>
                      <TableCell>{getProductSpecificText(alert)}</TableCell>
                      <TableCell>{getNotificationMethodsDisplay(alert)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={alert.isActive ? 'default' : 'secondary'}
                          className="flex w-fit items-center gap-1"
                        >
                          {alert.isActive ? (
                            <>
                              <Bell className="h-3 w-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <BellOff className="h-3 w-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAlert(alert)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAlert(alert)}>
                              {alert.isActive ? (
                                <>
                                  <BellOff className="mr-2 h-4 w-4" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Bell className="mr-2 h-4 w-4" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteAlert(alert)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleAlertSuccess}
        alertToEdit={selectedAlert}
      />
    </div>
