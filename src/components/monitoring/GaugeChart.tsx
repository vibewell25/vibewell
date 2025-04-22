import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface GaugeChartProps {
  value: number;
  maxValue: number;
  label: string;
  severity: 'low' | 'medium' | 'high';
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, maxValue, label, severity }) => {
  const normalizedValue = Math.min(Math.max(value, 0), maxValue);
  const percentage = (normalizedValue / maxValue) * 100;

  const data = [
    { name: 'value', value: percentage },
    { name: 'empty', value: 100 - percentage }
  ];

  const COLORS = {
    low: '#4CAF50',    // Green
    medium: '#FFA726', // Orange
    high: '#EF5350'    // Red
  };

  return (
    <div className="gauge-chart">
      <div className="chart-container">
        <PieChart width={150} height={150}>
          <Pie
            data={data}
            cx={75}
            cy={75}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={70}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={COLORS[severity]} />
            <Cell fill="#e0e0e0" />
          </Pie>
        </PieChart>
        <div className="gauge-value">
          <span className="value">{Math.round(percentage)}%</span>
          <span className="label">{label}</span>
        </div>
      </div>

      <style jsx>{`
        .gauge-chart {
          position: relative;
          width: 150px;
          margin: 0 auto;
        }

        .chart-container {
          position: relative;
        }

        .gauge-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .label {
          display: block;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default GaugeChart; 