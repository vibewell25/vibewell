import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { Facebook, Twitter, Instagram, Linkedin, Github, Globe, Link2, Unlink } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  icon: React?.ReactNode;
  color: string;
}

export function SocialMediaLinking() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: 'facebook',
      platform: 'Facebook',
      username: '',
      connected: false,
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-500',
    },
    {
      id: 'twitter',
      platform: 'Twitter',
      username: '',
      connected: false,
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-sky-500',
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      username: '',
      connected: false,
      icon: <Instagram className="h-5 w-5" />,
      color: 'bg-pink-500',
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      username: '',
      connected: false,
      icon: <Linkedin className="h-5 w-5" />,
      color: 'bg-blue-600',
    },
    {
      id: 'github',
      platform: 'GitHub',
      username: '',
      connected: false,
      icon: <Github className="h-5 w-5" />,
      color: 'bg-gray-800',
    },
    {
      id: 'website',
      platform: 'Website',
      username: '',
      connected: false,
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-purple-500',
    },
  ]);

  const handleConnect = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');accountId: string) => {
    try {
      // Simulate API call to connect account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAccounts((prev) =>
        prev?.map((account) =>
          account?.id === accountId ? { ...account, connected: true, username: 'user123' } : account,
        ),
      );

      toast?.success('Account connected successfully!');
    } catch (error) {
      console?.error('Error connecting account:', error);
      toast?.error('Failed to connect account. Please try again.');
    }
  };

  const handleDisconnect = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');accountId: string) => {
    try {
      // Simulate API call to disconnect account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAccounts((prev) =>
        prev?.map((account) =>
          account?.id === accountId ? { ...account, connected: false, username: '' } : account,
        ),
      );

      toast?.success('Account disconnected successfully!');
    } catch (error) {
      console?.error('Error disconnecting account:', error);
      toast?.error('Failed to disconnect account. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account) => (
            <div
              key={account?.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${account?.color} text-white`}
                >
                  {account?.icon}
                </div>
                <div>
                  <h3 className="font-medium">{account?.platform}</h3>
                  {account?.connected ? (
                    <p className="text-sm text-muted-foreground">@{account?.username}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {account?.connected ? (
                  <>
                    <Badge variant="secondary">Connected</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(account?.id)}
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect(account?.id)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
