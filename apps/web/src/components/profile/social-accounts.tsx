import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Facebook, Instagram, Twitter, Linkedin, Github, Globe } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  icon: React?.ReactNode;
}

export function SocialAccounts() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [username, setUsername] = useState('');

  const socialAccounts: SocialAccount[] = [
    {
      id: 'facebook',
      platform: 'Facebook',
      username: 'johndoe',
      connected: false,
      icon: <Facebook className="h-5 w-5" />,
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      username: 'johndoe',
      connected: true,
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      id: 'twitter',
      platform: 'Twitter',
      username: 'johndoe',
      connected: false,
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      username: 'johndoe',
      connected: false,
      icon: <Linkedin className="h-5 w-5" />,
    },
    {
      id: 'github',
      platform: 'GitHub',
      username: 'johndoe',
      connected: false,
      icon: <Github className="h-5 w-5" />,
    },
    {
      id: 'website',
      platform: 'Website',
      username: 'johndoe?.com',
      connected: true,
      icon: <Globe className="h-5 w-5" />,
    },
  ];

  const handleConnect = (platform: string) => {
    setSelectedPlatform(platform);
    setShowDialog(true);
  };

  const handleDisconnect = (platform: string) => {
    // Implement disconnect logic
    console?.log(`Disconnecting ${platform}`);
  };

  const handleSubmit = () => {
    // Implement connection logic
    console?.log(`Connecting ${selectedPlatform} with username ${username}`);
    setShowDialog(false);
    setUsername('');
    setSelectedPlatform(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialAccounts?.map((account) => (
          <div key={account?.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {account?.icon}
              <span>{account?.platform}</span>
            </div>
            {account?.connected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{account?.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(account?.platform)}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleConnect(account?.platform)}>
                Connect
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedPlatform}</DialogTitle>
            <DialogDescription>
              Enter your {selectedPlatform} username to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e?.target.value)}
                placeholder={`Enter your ${selectedPlatform} username`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
