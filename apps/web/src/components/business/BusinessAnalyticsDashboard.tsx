import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { downloadCSV } from '@/lib/utils/export';

interface BusinessAnalytics {
  revenue: {
    total: number;
    trend: Array<{ date: string; amount: number }>;
    byService: Array<{ service: string; amount: number }>;
bookings: {
    total: number;
    trend: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
interface Props {
  businessId: string;
export {};
