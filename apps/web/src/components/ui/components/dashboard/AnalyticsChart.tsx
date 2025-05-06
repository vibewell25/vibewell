import React from 'react';

const AnalyticsChart: React.FC = () => {
  // This would normally implement a chart using a library like recharts, chart.js, etc.
  // For simplicity, we'll create a mock chart visualization
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Mock data - in a real app, this would come from props or an API
  const data = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 16500 },
    { month: 'Mar', revenue: 14800 },
    { month: 'Apr', revenue: 17200 },
    { month: 'May', revenue: 18500 },
    { month: 'Jun', revenue: 19900 },
    { month: 'Jul', revenue: 22000 },
    { month: 'Aug', revenue: 21300 },
    { month: 'Sep', revenue: 23500 },
    { month: 'Oct', revenue: 24500 },
    { month: 'Nov', revenue: 25300 },
    { month: 'Dec', revenue: 27000 },
  ];
  
  // Find the maximum revenue to scale the chart properly
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  
  return (
    <div className="h-64 w-full">
      <div className="flex h-full items-end">
        {data.map((item, index) => {
          const barHeight = (item.revenue / maxRevenue) * 100;
          
          return (
            <div key={index} className="flex flex-1 flex-col items-center justify-end">
              <div 
                className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600" 
                style={{ height: `${barHeight}%` }}
              ></div>
              <div className="mt-2 text-xs text-gray-500">{item.month}</div>
            </div>
)}
      </div>
      
      <div className="mt-4 flex justify-between">
        <div className="text-sm text-gray-500">Last 12 months</div>
        <div className="text-sm font-medium text-gray-700">Total: $245,000</div>
      </div>
    </div>
export default AnalyticsChart; 