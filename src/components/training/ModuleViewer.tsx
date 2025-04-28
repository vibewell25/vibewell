'use client';;
import { useState, useEffect } from 'react';
import { Card, Button, TextArea, FileUpload } from '@/components/ui';
import { createOrUpdateProgress, getModuleProgress } from '@/lib/api/training';
import { TrainingModuleType } from '@prisma/client';

interface ModuleViewerProps {
  moduleId: string;
  staffId: string;
  module: {
    id: string;
    name: string;
    description: string;
    type: TrainingModuleType;
    content: any;
    duration: number;
  };
}

export default function ModuleViewer({ moduleId, staffId, module }: ModuleViewerProps) {
  const [progress, setProgress] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (progress?.status === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [progress?.status]);

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await getModuleProgress(moduleId, staffId);
        setProgress(data);
        if (data) {
          setNotes(data.notes || '');
          setTimeSpent(data.timeSpent || 0);
        }
      } catch (error) {
        console.error('Error loading module progress:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [moduleId, staffId]);

  const handleStart = async () => {
    try {
      const updated = await createOrUpdateProgress({
        moduleId,
        staffId,
        status: 'IN_PROGRESS',
        timeSpent: 0,
        notes: '',
      });
      setProgress(updated);
    } catch (error) {
      console.error('Error starting module:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const evidenceUrls = await Promise.all(
        evidence.map(async (file) => {
          // Here you would implement your file upload logic
          // and return the URL of the uploaded file
          return `/uploads/${file.name}`;
        }),
      );

      const updated = await createOrUpdateProgress({
        moduleId,
        staffId,
        status: 'COMPLETED',
        timeSpent,
        notes,
        evidence: evidenceUrls,
      });
      setProgress(updated);
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const ModuleContent = () => {
    switch (module.type) {
      case 'VIDEO':
        return (
          <div className="aspect-video rounded-lg bg-black">
            <video src={module.content.videoUrl} controls className="h-full w-full" />
          </div>
        );
      case 'DOCUMENT':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: module.content.html }} />
          </div>
        );
      case 'QUIZ':
        return (
          <div className="space-y-4">
            {module.content.questions.map((q: any, i: number) => (
              <Card key={i} className="p-4">
                <h3 className="mb-2 font-medium">{q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((option: string, j: number) => (
                    <label key={j} className="flex items-center space-x-2">
                      <input type="radio" name={`q${i}`} value={j} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        );
      default:
        return <div>Unsupported module type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{module.name}</h1>
            <p className="mt-1 text-gray-500">{module.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!progress && <Button onClick={handleStart}>Start Module</Button>}
            {progress?.status === 'IN_PROGRESS' && (
              <Button onClick={handleComplete}>Complete Module</Button>
            )}
          </div>
        </div>

        {progress?.status === 'IN_PROGRESS' && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Time spent: {Math.round(timeSpent)} minutes</p>
          </div>
        )}
      </Card>

      {progress?.status === 'IN_PROGRESS' && (
        <Card className="p-6">
          <ModuleContent />
        </Card>
      )}

      {progress?.status === 'IN_PROGRESS' && (
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Notes & Evidence</h2>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about what you've learned..."
            rows={4}
          />
          <FileUpload
            accept="image/*,application/pdf"
            multiple
            onChange={setEvidence}
            value={evidence}
          />
        </Card>
      )}
    </div>
  );
}
