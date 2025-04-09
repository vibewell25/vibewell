'use client'

import { useEffect, useRef } from 'react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Define theme colors
const themeColors = {
  blue: ['rgba(59, 130, 246, 0.5)', 'rgb(59, 130, 246)'],
  green: ['rgba(16, 185, 129, 0.5)', 'rgb(16, 185, 129)'],
  red: ['rgba(239, 68, 68, 0.5)', 'rgb(239, 68, 68)'],
  yellow: ['rgba(245, 158, 11, 0.5)', 'rgb(245, 158, 11)'],
  purple: ['rgba(139, 92, 246, 0.5)', 'rgb(139, 92, 246)'],
  indigo: ['rgba(99, 102, 241, 0.5)', 'rgb(99, 102, 241)'],
  pink: ['rgba(236, 72, 153, 0.5)', 'rgb(236, 72, 153)'],
  gray: ['rgba(156, 163, 175, 0.5)', 'rgb(156, 163, 175)'],
  cyan: ['rgba(6, 182, 212, 0.5)', 'rgb(6, 182, 212)'],
  amber: ['rgba(251, 191, 36, 0.5)', 'rgb(251, 191, 36)'],
  emerald: ['rgba(5, 150, 105, 0.5)', 'rgb(5, 150, 105)'],
  violet: ['rgba(124, 58, 237, 0.5)', 'rgb(124, 58, 237)'],
  fuchsia: ['rgba(217, 70, 239, 0.5)', 'rgb(217, 70, 239)'],
}

// Define font and grid color based on theme
const fontColor = 'rgb(107, 114, 128)' // text-gray-500
const gridColor = 'rgba(229, 231, 235, 0.5)' // border-gray-200 with opacity

interface ChartProps {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function LineChart({
  data,
  index,
  categories,
  colors = ['blue'],
  valueFormatter = (value) => value.toString(),
  height = 300,
}: ChartProps) {
  const chartRef = useRef<any>(null)

  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(item => item[index]),
    datasets: categories.map((category, i) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      data: data.map(item => item[category]),
      borderColor: themeColors[colors[i % colors.length] as keyof typeof themeColors][1],
      backgroundColor: themeColors[colors[i % colors.length] as keyof typeof themeColors][0],
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += valueFormatter(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
          callback: function(value) {
            return valueFormatter(value as number);
          }
        }
      },
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}

export function BarChart({
  data,
  index,
  categories,
  colors = ['blue'],
  valueFormatter = (value) => value.toString(),
  height = 300,
}: ChartProps) {
  const chartRef = useRef<any>(null)

  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(item => item[index]),
    datasets: categories.map((category, i) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      data: data.map(item => item[category]),
      backgroundColor: themeColors[colors[i % colors.length] as keyof typeof themeColors][0],
      borderColor: themeColors[colors[i % colors.length] as keyof typeof themeColors][1],
      borderWidth: 1,
    })),
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += valueFormatter(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
          callback: function(value) {
            return valueFormatter(value as number);
          }
        }
      },
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  )
}

interface PieChartProps {
  data: Record<string, any>[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function PieChart({
  data,
  category,
  index,
  colors = ['blue', 'green', 'red', 'yellow', 'purple'],
  valueFormatter = (value) => value.toString(),
  height = 300,
}: PieChartProps) {
  const chartRef = useRef<any>(null)

  // Get background colors based on provided color names
  const backgroundColors = colors.map(color => 
    themeColors[color as keyof typeof themeColors][0]
  )
  
  // Get border colors based on provided color names
  const borderColors = colors.map(color => 
    themeColors[color as keyof typeof themeColors][1]
  )

  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(item => item[index]),
    datasets: [
      {
        data: data.map(item => item[category]),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: fontColor,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${valueFormatter(value)} (${percentage}%)`;
          }
        }
      }
    }
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Pie ref={chartRef} data={chartData} options={options} />
    </div>
  )
} 