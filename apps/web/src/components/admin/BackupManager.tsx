import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BackupService, BackupMetadata } from '@/lib/backup/backup-service';
import { backupConfig } from '@/config/backup-config';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const backupService = new BackupService(backupConfig);

export function BackupManager() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  useEffect(() => {
    loadBackups();
[]);

  const loadBackups = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setLoading(true);
      const { data, error } = await backupService.backupClient
        .from('backup_metadata')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
catch (err) {
      console.error('Error loading backups:', err);
      setError('Failed to load backups');
finally {
      setLoading(false);
const handleCreateBackup = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');type: 'full' | 'incremental') => {
    try {
      setBackupInProgress(true);
      setError(null);
      const backup = await backupService.createBackup(type);
      setBackups((prev) => [backup, ...prev]);
      toast({
        title: 'Backup Created',
        description: `Successfully created ${type} backup`,
catch (err) {
      console.error('Error creating backup:', err);
      setError('Failed to create backup');
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
finally {
      setBackupInProgress(false);
const handleRestoreBackup = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!selectedBackup) return;

    try {
      setRestoreInProgress(true);
      setError(null);
      await backupService.restoreFromBackup(selectedBackup);
      toast({
        title: 'Backup Restored',
        description: 'Successfully restored from backup',
catch (err) {
      console.error('Error restoring backup:', err);
      setError('Failed to restore backup');
      toast({
        title: 'Error',
        description: 'Failed to restore from backup',
        variant: 'destructive',
finally {
      setRestoreInProgress(false);
const getStatusBadge = (status: BackupMetadata['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      in_progress: { color: 'bg-blue-500', icon: RefreshCw },
      completed: { color: 'bg-green-500', icon: CheckCircle },
      failed: { color: 'bg-red-500', icon: XCircle },
const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-4 w-4" />
        {status}
      </Badge>
return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backup Manager</CardTitle>
          <CardDescription>Manage database backups and restore points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => handleCreateBackup('full')} disabled={backupInProgress}>
                <Upload className="mr-2 h-4 w-4" />
                Create Full Backup
              </Button>
              <Button
                onClick={() => handleCreateBackup('incremental')}
                disabled={backupInProgress}
                variant="secondary"
              >
                <Upload className="mr-2 h-4 w-4" />
                Create Incremental Backup
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{backup.id}</TableCell>
                    <TableCell>
                      <Badge variant={backup.type === 'full' ? 'default' : 'secondary'}>
                        {backup.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(backup.timestamp), 'PPpp')}</TableCell>
                    <TableCell>{(backup.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBackup(backup.id)}
                        disabled={backup.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <Select
              value={selectedBackup || ''}
              onValueChange={setSelectedBackup}
              disabled={restoreInProgress}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select backup to restore" />
              </SelectTrigger>
              <SelectContent>
                {backups
                  .filter((b) => b.status === 'completed')
                  .map((backup) => (
                    <SelectItem key={backup.id} value={backup.id}>
                      {backup.type} - {format(new Date(backup.timestamp), 'PPpp')}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleRestoreBackup}
              disabled={!selectedBackup || restoreInProgress}
              variant="destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Restore Selected Backup
            </Button>
          </div>
          <Button onClick={loadBackups} variant="outline" disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {(backupInProgress || restoreInProgress) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>{backupInProgress ? 'Backup in progress...' : 'Restore in progress...'}</span>
                <Progress value={45} className="w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
