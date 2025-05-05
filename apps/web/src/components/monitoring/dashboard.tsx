import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Alert, Card, Grid, Typography } from '@mui/material';
import { AlertConfig, DashboardData } from '@/types/monitoring';

interface DashboardProps {
  refreshInterval?: number;
  onAlert?: (alert: AlertConfig) => void;
export {};
