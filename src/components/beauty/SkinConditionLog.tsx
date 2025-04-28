import { useState, useEffect } from 'react';
import { Card, Button, Input, Slider } from '@/components/ui';
import { logSkinCondition, getSkinConditionLogs } from '@/lib/api/beauty';
import { SkinConcern } from '@/lib/api/beauty';

const skinConcerns: SkinConcern[] = [
  'acne',
  'dryness',
  'oiliness',
  'redness',
  'sensitivity',
  'dark_spots',
  'fine_lines',
  'other',
];

export default function SkinConditionLogComponent() {
  const [logs, setLogs] = useState<SkinConditionLog[]>([]);
  const [showNewLog, setShowNewLog] = useState(false);
  const [newLog, setNewLog] = useState<Omit<SkinConditionLog, 'id' | 'userId'>>({
    date: new Date().toISOString().split('T')[0],
    concerns: [],
    mood: 3,
    stress: 3,
    sleep: 3,
    hydration: 3,
    notes: '',
    photos: [],
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const userLogs = await getSkinConditionLogs();
      setLogs(userLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleConcernToggle = (concern: SkinConcern) => {
    setNewLog((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  const handleSubmit = async () => {
    try {
      await logSkinCondition(newLog);
      setShowNewLog(false);
      setNewLog({
        date: new Date().toISOString().split('T')[0],
        concerns: [],
        mood: 3,
        stress: 3,
        sleep: 3,
        hydration: 3,
        notes: '',
        photos: [],
      });
      loadLogs();
    } catch (error) {
      console.error('Error creating log:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skin Condition Log</h2>
        <Button onClick={() => setShowNewLog(!showNewLog)}>
          {showNewLog ? 'Cancel' : 'New Log'}
        </Button>
      </div>

      {showNewLog && (
        <Card className="space-y-4 p-6">
          <Input
            type="date"
            label="Date"
            value={newLog.date}
            onChange={(e) => setNewLog((prev) => ({ ...prev, date: e.target.value }))}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Skin Concerns</label>
            <div className="flex flex-wrap gap-2">
              {skinConcerns.map((concern) => (
                <Button
                  key={concern}
                  variant={newLog.concerns.includes(concern) ? 'default' : 'outline'}
                  onClick={() => handleConcernToggle(concern)}
                >
                  {concern.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Mood (1-5)</label>
              <Slider
                value={[newLog.mood]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setNewLog((prev) => ({ ...prev, mood: value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stress Level (1-5)</label>
              <Slider
                value={[newLog.stress]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setNewLog((prev) => ({ ...prev, stress: value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Sleep Quality (1-5)</label>
              <Slider
                value={[newLog.sleep]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setNewLog((prev) => ({ ...prev, sleep: value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Hydration Level (1-5)</label>
              <Slider
                value={[newLog.hydration]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setNewLog((prev) => ({ ...prev, hydration: value }))}
              />
            </div>
          </div>

          <Input
            label="Notes"
            value={newLog.notes || ''}
            onChange={(e) => setNewLog((prev) => ({ ...prev, notes: e.target.value }))}
          />

          <Button onClick={handleSubmit}>Save Log</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {logs.map((log) => (
          <Card key={log.id} className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold">{new Date(log.date).toLocaleDateString()}</h3>
            </div>

            {log.concerns.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Concerns</h4>
                <div className="flex flex-wrap gap-2">
                  {log.concerns.map((concern) => (
                    <span key={concern} className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                      {concern.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mood</p>
                <p className="font-medium">{log.mood}/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stress</p>
                <p className="font-medium">{log.stress}/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sleep</p>
                <p className="font-medium">{log.sleep}/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hydration</p>
                <p className="font-medium">{log.hydration}/5</p>
              </div>
            </div>

            {log.notes && (
              <div>
                <h4 className="mb-1 text-sm font-medium">Notes</h4>
                <p className="text-gray-600">{log.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
