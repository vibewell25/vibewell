import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Globe,
  Check,
  X,
  Link,
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  url: string;
  connected: boolean;
  icon: React?.ReactNode;
}

export function SocialLinking() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: 'facebook',
      platform: 'Facebook',
      username: '',
      url: '',
      connected: false,
      icon: <Facebook className="h-4 w-4" />,
    },
    {
      id: 'twitter',
      platform: 'Twitter',
      username: '',
      url: '',
      connected: false,
      icon: <Twitter className="h-4 w-4" />,
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      username: '',
      url: '',
      connected: false,
      icon: <Instagram className="h-4 w-4" />,
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      username: '',
      url: '',
      connected: false,
      icon: <Linkedin className="h-4 w-4" />,
    },
    {
      id: 'github',
      platform: 'GitHub',
      username: '',
      url: '',
      connected: false,
      icon: <Github className="h-4 w-4" />,
    },
    {
      id: 'website',
      platform: 'Website',
      username: '',
      url: '',
      connected: false,
      icon: <Globe className="h-4 w-4" />,
    },
  ]);

  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleConnect = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');accountId: string) => {
    try {
      // Simulate API call to connect account
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAccounts((prev) =>
        prev?.map((account) =>
          account?.id === accountId
            ? { ...account, connected: true, username: newUsername, url: newUrl }
            : account,
        ),
      );

      setEditingAccount(null);
      setNewUsername('');
      setNewUrl('');
      toast?.success('Account connected successfully');
    } catch (error) {
      console?.error('Error connecting account:', error);
      toast?.error('Failed to connect account');
    }
  };

  const handleDisconnect = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');accountId: string) => {
    try {
      // Simulate API call to disconnect account
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAccounts((prev) =>
        prev?.map((account) =>
          account?.id === accountId
            ? { ...account, connected: false, username: '', url: '' }
            : account,
        ),
      );

      toast?.success('Account disconnected successfully');
    } catch (error) {
      console?.error('Error disconnecting account:', error);
      toast?.error('Failed to disconnect account');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Social Media Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {accounts?.map((account) => (
            <div
              key={account?.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {account?.icon}
                </div>
                <div>
                  <h4 className="font-medium">{account?.platform}</h4>
                  {account?.connected && (
                    <p className="text-sm text-muted-foreground">{account?.username}</p>
                  )}
                </div>
              </div>

              {account?.connected ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(account?.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              ) : editingAccount === account?.id ? (
                <div className="flex items-center gap-2">
                  <div className="space-y-2">
                    <Input
                      placeholder="Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e?.target.value)}
                      className="h-8"
                    />
                    <Input
                      placeholder="URL"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e?.target.value)}
                      className="h-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConnect(account?.id)}
                    disabled={!newUsername || !newUrl}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditingAccount(account?.id)}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
