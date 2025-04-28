import React, { useState } from 'react';
import type { NextPage } from 'next';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CalendarSettings: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/calendar/ics/import', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) alert('ICS imported successfully');
    else alert('Failed to import ICS');
  };

  const handleExport = async () => {
    const res = await fetch('/api/calendar/ics/export');
    if (!res.ok) {
      alert('Failed to export ICS');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Calendar Settings</h1>
      <Card className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Import ICS</h2>
        <input type="file" accept=".ics" onChange={handleFileChange} />
        <Button onClick={handleImport}>Import</Button>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold mb-2">Export ICS</h2>
        <Button onClick={handleExport}>Download ICS</Button>
      </Card>
    </div>
  );
};

export default CalendarSettings;
