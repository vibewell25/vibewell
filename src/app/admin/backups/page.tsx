'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackupManager } from '@/components/admin/backup-manager';
import { BackupStatistics } from '@/components/admin/backup-statistics';
import { BackupSettings } from '@/components/admin/backup-settings';
import { PageHeader } from '@/components/page-header';
import { Database, BarChart2, Settings } from 'lucide-react';

export default function BackupsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Backup Management"
        description="Manage database backups, view statistics, and configure backup settings"
      />

      <Tabs defaultValue="backups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="backups">
            <Database className="w-4 h-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart2 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-6">
          <BackupManager />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <BackupStatistics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
