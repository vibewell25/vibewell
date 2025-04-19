'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Calculator, ArrowDownToLine, Plus, Copy, Trash, RotateCw } from 'lucide-react';

interface ExpenseItem {
  id: string;
  name: string;
  cost: number;
  category: 'direct' | 'indirect';
}

interface ServiceCalculation {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  expenses: ExpenseItem[];
  timeCost: number;
}

export default function ProfitCalculatorPage() {
  const [services, setServices] = useState<ServiceCalculation[]>([
    {
      id: '1',
      name: 'Basic Service',
      price: 50,
      duration: 60,
      expenses: [
        { id: '1', name: 'Product Cost', cost: 5, category: 'direct' },
        { id: '2', name: 'Disposables', cost: 2, category: 'direct' },
      ],
      timeCost: 20, // hourly rate for staff or yourself
    }
  ]);
  const [activeServiceId, setActiveServiceId] = useState('1');
  const [hourlyCost, setHourlyCost] = useState(30);
  const [hourlyOverhead, setHourlyOverhead] = useState(15);
  // Get active service
  const activeService = services.find(service => service.id === activeServiceId) || services[0];
  // Calculate total direct costs
  const calculateDirectCosts = (service: ServiceCalculation) => {
    return service.expenses
      .filter(expense => expense.category === 'direct')
      .reduce((total, expense) => total + expense.cost, 0);
  };
  // Calculate time-based costs (staff time + overhead)
  const calculateTimeCosts = (service: ServiceCalculation) => {
    const staffCost = (service.duration / 60) * service.timeCost;
    const overheadCost = (service.duration / 60) * hourlyOverhead;
    return staffCost + overheadCost;
  };
  // Calculate profit and margins
  const calculateProfit = (service: ServiceCalculation) => {
    const directCosts = calculateDirectCosts(service);
    const timeCosts = calculateTimeCosts(service);
    const totalCost = directCosts + timeCosts;
    const profit = service.price - totalCost;
    const profitMargin = (profit / service.price) * 100;
    return {
      directCosts,
      timeCosts,
      totalCost,
      profit,
      profitMargin
    };
  };
  // Add a new service
  const addService = () => {
    const newId = (Math.max(...services.map(s => parseInt(s.id)), 0) + 1).toString();
    const newService: ServiceCalculation = {
      id: newId,
      name: `Service ${newId}`,
      price: 75,
      duration: 60,
      expenses: [
        { id: '1', name: 'Product Cost', cost: 7, category: 'direct' },
        { id: '2', name: 'Disposables', cost: 3, category: 'direct' },
      ],
      timeCost: hourlyCost,
    };
    setServices([...services, newService]);
    setActiveServiceId(newId);
  };
  // Duplicate a service
  const duplicateService = (serviceId: string) => {
    const serviceToDuplicate = services.find(s => s.id === serviceId);
    if (!serviceToDuplicate) return;
    const newId = (Math.max(...services.map(s => parseInt(s.id)), 0) + 1).toString();
    const newService: ServiceCalculation = {
      ...serviceToDuplicate,
      id: newId,
      name: `${serviceToDuplicate.name} (Copy)`,
    };
    setServices([...services, newService]);
    setActiveServiceId(newId);
  };
  // Delete a service
  const deleteService = (serviceId: string) => {
    if (services.length < 1) return; // Don't allow deleting the last service
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    // Set active service to first available if the active one was deleted
    if (serviceId === activeServiceId) {
      setActiveServiceId(updatedServices[0].id);
    }
  };
  // Update service info
  const updateServiceInfo = (field: keyof ServiceCalculation, value: any) => {
    setServices(services.map(service => {
      if (service.id === activeServiceId) {
        return { ...service, [field]: value };
      }
      return service;
    }));
  };
  // Add an expense to active service
  const addExpense = (category: 'direct' | 'indirect') => {
    setServices(services.map(service => {
      if (service.id === activeServiceId) {
        const newExpenseId = (Math.max(...service.expenses.map((e: ExpenseItem) => parseInt(e.id)), 0) + 1).toString();
        return {
          ...service,
          expenses: [
            ...service.expenses,
            { 
              id: newExpenseId, 
              name: category === 'direct' ? 'Product/Supplies' : 'Other Expense', 
              cost: 0, 
              category 
            }
          ]
        };
      }
      return service;
    }));
  };
  // Update an expense
  const updateExpense = (expenseId: string, field: keyof ExpenseItem, value: any) => {
    setServices(services.map(service => {
      if (service.id === activeServiceId) {
        return {
          ...service,
          expenses: service.expenses.map((expense: ExpenseItem) => {
            if (expense.id === expenseId) {
              return { ...expense, [field]: value };
            }
            return expense;
          })
        };
      }
      return service;
    }));
  };
  // Delete an expense
  const deleteExpense = (expenseId: string) => {
    setServices(services.map(service => {
      if (service.id === activeServiceId) {
        return {
          ...service,
          expenses: service.expenses.filter((expense: ExpenseItem) => expense.id !== expenseId)
        };
      }
      return service;
    }));
  };
  // Calculate results for active service
  const results = calculateProfit(activeService);
  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profitCalculatorData', JSON.stringify({
        services,
        hourlyCost,
        hourlyOverhead
      }));
    }
  }, [services, hourlyCost, hourlyOverhead]);
  // Load data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('profitCalculatorData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setServices(data.services);
          setHourlyCost(data.hourlyCost);
          setHourlyOverhead(data.hourlyOverhead);
        } catch (e) {
          console.error('Failed to parse saved data');
        }
      }
    }
  }, []);
  // Export to CSV
  const exportToCSV = () => {
    const headers = "Service Name,Price,Duration (min),Direct Costs,Time Costs,Total Cost,Profit,Profit Margin %\n";
    const rows = services.map(service => {
      const result = calculateProfit(service);
      return `"${service.name}",${service.price},${service.duration},${result.directCosts.toFixed(2)},${result.timeCosts.toFixed(2)},${result.totalCost.toFixed(2)},${result.profit.toFixed(2)},${result.profitMargin.toFixed(2)}`;
    }).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'service_profit_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Service Profit Calculator</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Calculate the true profitability of each service you offer by accounting for all direct costs, 
          staff time, and overhead expenses. Make data-driven decisions to optimize your service menu.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <ArrowDownToLine className="h-5 w-5" />
            Export Results to CSV
          </Button>
          <Link href="/business-hub/financial-management">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Back to Financial Tools
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service selection sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>Select a service to calculate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {services.map(service => (
                  <div 
                    key={service.id} 
                    className={`p-3 border rounded-md flex justify-between items-center cursor-pointer ${
                      service.id === activeServiceId ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveServiceId(service.id)}
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">${service.price} - {service.duration} min</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateService(service.id);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {services.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteService(service.id);
                          }}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={addService} variant="outline" className="w-full flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" />
                Add New Service
              </Button>
            </CardContent>
            <CardHeader className="border-t border-gray-200 mt-6 pt-6">
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Apply to all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Staff Hourly Cost: ${hourlyCost}/hr
                  </label>
                  <input
                    type="range"
                    value={hourlyCost}
                    min={10}
                    max={100}
                    step={1}
                    onChange={(e) => setHourlyCost(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The cost of your or your staff's time per hour, including benefits
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Overhead Cost: ${hourlyOverhead}/hr
                  </label>
                  <input
                    type="range"
                    value={hourlyOverhead}
                    min={5}
                    max={100}
                    step={1}
                    onChange={(e) => setHourlyOverhead(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Rent, utilities, software, and other indirect costs per hour of operation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Main content: Service details and calculation */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Edit service information and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic service info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name</label>
                    <Input 
                      value={activeService.name} 
                      onChange={(e) => updateServiceInfo('name', e.target.value)} 
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($)</label>
                    <Input 
                      type="number" 
                      value={activeService.price} 
                      onChange={(e) => updateServiceInfo('price', Number(e.target.value))} 
                      className="w-full"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input 
                      type="number" 
                      value={activeService.duration} 
                      onChange={(e) => updateServiceInfo('duration', Number(e.target.value))} 
                      className="w-full"
                      min={1}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Staff Hourly Rate ($)</label>
                    <Input 
                      type="number" 
                      value={activeService.timeCost} 
                      onChange={(e) => updateServiceInfo('timeCost', Number(e.target.value))} 
                      className="w-full"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                {/* Direct costs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Direct Costs</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addExpense('direct')}
                      className="text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Cost
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {activeService.expenses
                      .filter(expense => expense.category === 'direct')
                      .map(expense => (
                        <div key={expense.id} className="flex items-center gap-2">
                          <Input 
                            value={expense.name} 
                            onChange={(e) => updateExpense(expense.id, 'name', e.target.value)} 
                            className="flex-grow"
                            placeholder="Cost name"
                          />
                          <div className="w-20 relative">
                            <span className="absolute inset-y-0 left-2 flex items-center">$</span>
                            <Input 
                              type="number" 
                              value={expense.cost} 
                              onChange={(e) => updateExpense(expense.id, 'cost', Number(e.target.value))} 
                              className="pl-6"
                              min={0}
                              step={0.01}
                            />
                          </div>
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="p-2 text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Direct costs are expenses directly tied to providing this service (products, supplies, etc.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Results */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Profit Analysis</span>
                <button 
                  onClick={() => {}} 
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                  title="Refresh Calculations"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </CardTitle>
              <CardDescription>
                Breakdown of costs and profitability for {activeService.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Direct Costs</span>
                        <span className="font-medium">${results.directCosts.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{width: `${(results.directCosts / activeService.price) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {((results.directCosts / activeService.price) * 100).toFixed(1)}% of price
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Time-Based Costs</span>
                        <span className="font-medium">${results.timeCosts.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{width: `${(results.timeCosts / activeService.price) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {((results.timeCosts / activeService.price) * 100).toFixed(1)}% of price
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Total Cost</span>
                        <span className="font-semibold">${results.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{width: `${(results.totalCost / activeService.price) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {((results.totalCost / activeService.price) * 100).toFixed(1)}% of price
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Profit</span>
                        <span className={`font-semibold ${results.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${results.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${results.profit < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{width: `${Math.min(Math.abs(results.profit) / activeService.price * 100, 100)}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {results.profitMargin.toFixed(1)}% profit margin
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Service Price</p>
                      <p className="text-3xl font-bold">${activeService.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                      <p className="text-3xl font-bold">${results.totalCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Profit Per Service</p>
                      <p className={`text-3xl font-bold ${results.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${results.profit.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                      <p className={`text-3xl font-bold ${results.profitMargin < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {results.profitMargin.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {results.profitMargin >= 30 ? (
                          "Excellent! This service has a healthy profit margin."
                        ) : results.profitMargin >= 15 ? (
                          "Good. This service is profitable but consider ways to increase the margin."
                        ) : results.profitMargin > 0 ? (
                          "Caution: This service has a low profit margin. Consider price increases or cost reductions."
                        ) : (
                          "Warning: This service is losing money. Immediate action needed!"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-green-200 pt-4">
              <div className="w-full">
                <p className="text-sm text-gray-600 mb-2">Profit Recommendations:</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {results.profitMargin < 15 && (
                    <li>Consider raising your price to at least ${(results.totalCost * 1.2).toFixed(2)} to achieve a 20% margin.</li>
                  )}
                  {results.directCosts / results.totalCost > 0.6 && (
                    <li>Your direct costs are high. Look for less expensive product alternatives or suppliers.</li>
                  )}
                  {activeService.duration > 60 && results.profitMargin < 20 && (
                    <li>This service takes significant time. Evaluate if you can reduce the duration without compromising quality.</li>
                  )}
                  {results.profitMargin < 0 && (
                    <li className="text-red-600 font-semibold">This service is not profitable. Consider discontinuing or significantly restructuring it.</li>
                  )}
                  {(results.profitMargin > 0 && results.profitMargin < 30) && (
                    <li>Target a profit margin of at least 30% for long-term business sustainability.</li>
                  )}
                  {results.profitMargin >= 30 && (
                    <li className="text-green-600">This service has a healthy profit margin. Consider if there are opportunities to expand or promote it more.</li>
                  )}
                </ul>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 