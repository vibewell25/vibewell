import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Trash2, X, Download, Shield } from 'lucide-react';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { DataBackup } from './data-backup';
import { ProfileVerification } from './profile-verification';
import { PrivacySettings } from './privacy-settings';

export function ProfileDeletion() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState({
    dataLoss: false,
    irreversible: false,
    backup: false,
    verification: false,
    privacy: false,
  });

  const handleDelete = async () => {
    try {
      // Simulate API call to delete account
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Account deleted successfully');
      // Redirect to home page or show success message
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleAcknowledge = (key: keyof typeof acknowledgements) => {
    setAcknowledgements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allAcknowledged = Object.values(acknowledgements).every(Boolean);
  const canDelete = allAcknowledged && confirmationText === 'DELETE MY ACCOUNT';

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <DataBackup />
        <ProfileVerification />
      </div>

      <PrivacySettings />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Warning: This action cannot be undone</p>
              <p className="text-sm">
                Deleting your account will permanently remove all your data, including:
              </p>
              <ul className="mt-2 list-inside list-disc text-sm">
                <li>Profile information</li>
                <li>Activity history</li>
                <li>Preferences and settings</li>
                <li>Connected accounts</li>
                <li>Verification status</li>
                <li>Privacy settings</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataLoss"
                  checked={acknowledgements.dataLoss}
                  onCheckedChange={() => handleAcknowledge('dataLoss')}
                />
                <div className="space-y-1">
                  <Label htmlFor="dataLoss">
                    I understand that all my data will be permanently deleted
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    This includes profile information, activity logs, and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="irreversible"
                  checked={acknowledgements.irreversible}
                  onCheckedChange={() => handleAcknowledge('irreversible')}
                />
                <div className="space-y-1">
                  <Label htmlFor="irreversible">I understand this action is irreversible</Label>
                  <p className="text-sm text-muted-foreground">
                    Once deleted, your account cannot be recovered
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="backup"
                  checked={acknowledgements.backup}
                  onCheckedChange={() => handleAcknowledge('backup')}
                />
                <div className="space-y-1">
                  <Label htmlFor="backup">I have exported my data and created a backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Make sure to download your data before proceeding
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="verification"
                  checked={acknowledgements.verification}
                  onCheckedChange={() => handleAcknowledge('verification')}
                />
                <div className="space-y-1">
                  <Label htmlFor="verification">
                    I understand my verification status will be lost
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You will need to verify your identity again if you create a new account
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={acknowledgements.privacy}
                  onCheckedChange={() => handleAcknowledge('privacy')}
                />
                <div className="space-y-1">
                  <Label htmlFor="privacy">I understand my privacy settings will be removed</Label>
                  <p className="text-sm text-muted-foreground">
                    All privacy preferences will be permanently deleted
                  </p>
                </div>
              </div>
            </div>

            {allAcknowledged && (
              <div className="space-y-2">
                <Label htmlFor="confirmation">Type "DELETE MY ACCOUNT" to confirm</Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={e => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="font-mono"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsConfirming(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowConfirmationDialog(true)}
                disabled={!canDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
