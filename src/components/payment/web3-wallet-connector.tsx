'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
// Removing the vulnerable dependency
// import WalletConnectProvider from '@walletconnect/web3-provider';
import { coinbaseWallet } from 'web3modal/dist/providers/connectors';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { truncateAddress } from '@/lib/utils';

// Types for the component
interface Web3WalletConnectorProps {
  onConnect?: (provider: any, address: string, chainId: number) => void;
  onDisconnect?: () => void;
  requiredChainId?: number; // Optional required chain ID
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'; 
}

interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  explorerUrl: string;
}

// Supported networks configuration
const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io'
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com'
  },
  // Add more networks as needed
};

export function Web3WalletConnector({
  onConnect,
  onDisconnect,
  requiredChainId,
  buttonText = 'Connect Wallet',
  buttonVariant = 'default'
}: Web3WalletConnectorProps) {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [networkSwitchRequired, setNetworkSwitchRequired] = useState<boolean>(false);
  
  // Initialize Web3Modal on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const providerOptions = {
        // Using ethers directly instead of WalletConnect
        // This removes the dependency on the vulnerable package
        coinbasewallet: {
          package: coinbaseWallet,
          options: {
            appName: 'Vibewell',
            infuraId: process.env.NEXT_PUBLIC_INFURA_ID || '',
          },
        },
      };

      const modal = new Web3Modal({
        network: 'mainnet', // Default to mainnet
        cacheProvider: true, // Cache the provider for auto-connect
        providerOptions,
        theme: {
          background: '#ffffff',
          main: '#6366f1',
          secondary: '#4f46e5',
          border: '#e5e7eb',
          hover: '#f3f4f6',
        },
      });

      setWeb3Modal(modal);

      // Auto-connect if previously connected
      if (modal.cachedProvider) {
        connectWallet(modal);
      }
    }
  }, []);

  // Handle network/account changes
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
          if (onConnect && chainId) {
            onConnect(provider, accounts[0], chainId);
          }
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        
        // Check if the new chain is supported and required
        if (requiredChainId && newChainId !== requiredChainId) {
          setNetworkSwitchRequired(true);
        } else {
          setNetworkSwitchRequired(false);
          if (onConnect && address) {
            onConnect(provider, address, newChainId);
          }
        }
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        // Cleanup listeners when component unmounts
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, chainId, address, onConnect, requiredChainId]);

  // Connect wallet function
  const connectWallet = async (modal = web3Modal) => {
    try {
      setLoading(true);
      setError(null);

      if (!modal) {
        throw new Error('Web3Modal not initialized');
      }

      // Connect to wallet
      const web3Provider = await modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
      
      // Get network and account info
      const network = await ethersProvider.getNetwork();
      const accounts = await ethersProvider.listAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      setProvider(web3Provider);
      setChainId(network.chainId);
      setAddress(accounts[0]);

      // Check if connected to required network
      if (requiredChainId && network.chainId !== requiredChainId) {
        setNetworkSwitchRequired(true);
      } else if (onConnect) {
        onConnect(web3Provider, accounts[0], network.chainId);
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    
    // If using WalletConnect, explicitly disconnect
    if (provider?.disconnect) {
      await provider.disconnect();
    }
    
    setProvider(null);
    setAddress(null);
    setChainId(null);
    setNetworkSwitchRequired(false);
    
    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Switch network function
  const switchNetwork = async () => {
    if (!provider || !requiredChainId) return;
    
    try {
      setLoading(true);
      
      // For MetaMask-compatible wallets
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
      });
      
      // Network switch successful
      setNetworkSwitchRequired(false);
    } catch (err: any) {
      // If network is not added to wallet, suggest adding it
      if (err.code === 4902 && SUPPORTED_NETWORKS[requiredChainId]) {
        try {
          const network = SUPPORTED_NETWORKS[requiredChainId];
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${requiredChainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: {
                  name: network.currency,
                  symbol: network.currency,
                  decimals: 18,
                },
                rpcUrls: [process.env[`NEXT_PUBLIC_${network.name.toUpperCase().replace(' ', '_')}_RPC`] || ''],
                blockExplorerUrls: [network.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network to wallet:', addError);
          setError('Failed to add network to your wallet. Please add it manually.');
        }
      } else {
        console.error('Failed to switch network:', err);
        setError('Failed to switch network. Please try again or switch manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!address ? (
        <Button 
          onClick={() => connectWallet()} 
          disabled={loading} 
          variant={buttonVariant}
          className="flex items-center"
          data-cy="connect-wallet-button"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      ) : (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium" data-cy="wallet-address">
              {truncateAddress(address, 6)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={disconnectWallet}
              data-cy="disconnect-wallet"
            >
              Disconnect
            </Button>
          </div>
          
          {chainId && SUPPORTED_NETWORKS[chainId] && (
            <div className="text-xs text-muted-foreground">
              Connected to {SUPPORTED_NETWORKS[chainId].name}
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error connecting wallet</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Network Switch Dialog */}
      <Dialog open={networkSwitchRequired} onOpenChange={(open) => !open && disconnectWallet()}>
        <DialogContent>
          <DialogTitle>Network Switch Required</DialogTitle>
          <DialogDescription>
            {requiredChainId && SUPPORTED_NETWORKS[requiredChainId] ? (
              <>
                <p className="mb-4">
                  Please switch to {SUPPORTED_NETWORKS[requiredChainId].name} to continue.
                </p>
                <Button onClick={switchNetwork} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    'Switch Network'
                  )}
                </Button>
              </>
            ) : (
              <p className="text-red-500">
                The required network configuration is not supported.
              </p>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
} 