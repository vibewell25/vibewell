import React from 'react';
import { format } from 'date-fns';

export interface Alert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
interface AlertListProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
const AlertList: React.FC<AlertListProps> = ({ alerts, onDismiss }) => {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'var(--error)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--text-primary)';
if (alerts.length === 0) {
    return (
      <div className="no-alerts">
        <p>No active alerts</p>
        <style jsx>{`
          .no-alerts {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
`}</style>
      </div>
return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-item">
          <div className="alert-header">
            <div className="severity" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
              {alert.severity.toUpperCase()}
            </div>
            <span className="timestamp">
              {format(new Date(alert.timestamp), 'MMM d, yyyy HH:mm:ss')}
            </span>
            {onDismiss && (
              <button
                className="dismiss-button"
                onClick={() => onDismiss(alert.id)}
                aria-label="Dismiss alert"
              >
                ×
              </button>
            )}
          </div>
          <div className="alert-content">
            <p className="message">{alert.message}</p>
            <p className="details">
              {alert.metric}: {alert.value} (Threshold: {alert.threshold})
            </p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
.alert-item {
          background-color: var(--background-secondary);
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
.alert-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
.severity {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          color: white;
.timestamp {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-left: auto;
.dismiss-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0 0.5rem;
          line-height: 1;
.dismiss-button:hover {
          color: var(--text-primary);
.alert-content {
          color: var(--text-primary);
.message {
          margin: 0 0 0.5rem 0;
          font-weight: 500;
.details {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
/* Scrollbar styling */
        .alert-list::-webkit-scrollbar {
          width: 6px;
.alert-list::-webkit-scrollbar-track {
          background: var(--background-primary);
          border-radius: 3px;
.alert-list::-webkit-scrollbar-thumb {
          background: var(--text-secondary);
          border-radius: 3px;
.alert-list::-webkit-scrollbar-thumb:hover {
          background: var(--text-primary);
`}</style>
    </div>
export default AlertList;
