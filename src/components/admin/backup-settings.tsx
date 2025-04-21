'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackupConfig } from '@/lib/backup/backup-service';
import {
  backupConfig,
  storageConfig,
  encryptionConfig,
  compressionConfig,
} from '@/config/backup-config';
import { AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const backupSettingsSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  retentionPeriod: z.number().min(1).max(365),
  backupTypes: z.array(z.enum(['full', 'incremental'])).min(1),
  encryptionEnabled: z.boolean(),
  compressionEnabled: z.boolean(),
  storageLocation: z.enum(['local', 's3', 'gcs']),
  s3Config: z
    .object({
      bucket: z.string().min(1),
      region: z.string().min(1),
      path: z.string(),
    })
    .optional(),
  gcsConfig: z
    .object({
      bucket: z.string().min(1),
      path: z.string(),
    })
    .optional(),
  localConfig: z
    .object({
      path: z.string().min(1),
    })
    .optional(),
  encryption: z.object({
    algorithm: z.string(),
    keySize: z.number(),
    ivSize: z.number(),
    tagSize: z.number(),
  }),
  compression: z.object({
    algorithm: z.string(),
    level: z.number().min(1).max(9),
  }),
});

type BackupSettingsFormValues = z.infer<typeof backupSettingsSchema>;

export function BackupSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BackupSettingsFormValues>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues: {
      frequency: backupConfig.frequency,
      retentionPeriod: backupConfig.retentionPeriod,
      backupTypes: backupConfig.backupTypes,
      encryptionEnabled: backupConfig.encryptionEnabled,
      compressionEnabled: backupConfig.compressionEnabled,
      storageLocation: backupConfig.storageLocation,
      s3Config: storageConfig.s3,
      gcsConfig: storageConfig.gcs,
      localConfig: storageConfig.local,
      encryption: encryptionConfig,
      compression: compressionConfig,
    },
  });

  const onSubmit = async (values: BackupSettingsFormValues) => {
    try {
      setLoading(true);
      setError(null);

      import { updateBackupSettings } from '../../implementation-files/backup-settings-update';
      console.log('Updating backup settings:', values);

      toast({
        title: 'Settings Updated',
        description: 'Backup settings have been updated successfully',
      });
    } catch (err) {
      console.error('Error updating backup settings:', err);
      setError('Failed to update backup settings');
      toast({
        title: 'Error',
        description: 'Failed to update backup settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup Settings</CardTitle>
            <CardDescription>
              Configure automated backup settings and storage options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backup Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select backup frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to perform automated backups</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retentionPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retention Period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days to keep backups before deletion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="encryptionEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Encryption</FormLabel>
                      <FormDescription>Enable encryption for backup data</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compressionEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Compression</FormLabel>
                      <FormDescription>Enable compression for backup data</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storageLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Where to store backup files</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('storageLocation') === 's3' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="s3Config.bucket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>S3 Bucket Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="s3Config.region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AWS Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {form.watch('storageLocation') === 'gcs' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="gcsConfig.bucket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GCS Bucket Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {form.watch('storageLocation') === 'local' && (
              <FormField
                control={form.control}
                name="localConfig.path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Storage Path</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}
