import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ActivityFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export function ActivityFilter({
  onSearch,
  onFilterChange,
  onDateRangeChange,
}: ActivityFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange(value);
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter">Filter</Label>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="login">Logins</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="profile">Profile Updates</SelectItem>
            <SelectItem value="settings">Settings Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-range">Date Range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.from.toISOString().substring(0, 10)}
            onChange={e => {
              const newDate = new Date(e.target.value);
              const newRange = { from: newDate, to: dateRange.to };
              handleDateRangeChange(newRange);
            }}
            className="w-full"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateRange.to.toISOString().substring(0, 10)}
            onChange={e => {
              const newDate = new Date(e.target.value);
              const newRange = { from: dateRange.from, to: newDate };
              handleDateRangeChange(newRange);
            }}
            className="w-full"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const today = new Date();
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              handleDateRangeChange({ from: thirtyDaysAgo, to: today });
            }}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
