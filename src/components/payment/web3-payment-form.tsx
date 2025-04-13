'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { Web3WalletConnector } from './web3-wallet-connector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, Info, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import QRCode from 'react-qr-code';
import { Interface, Contract, parseUnits, parseEther, toUtf8Bytes, hexlify } from 'ethers';
import Image from 'next/image';

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  icon: string;
  decimals: number;
}

interface Web3PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  orderReference?: string;
  onSuccess?: (transactionHash: string, currency: string) => void;
  onError?: (error: Error) => void;
}

// Supported cryptocurrencies
const CRYPTO_OPTIONS: CryptoOption[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    icon: '/icons/ethereum.svg',
    decimals: 18
  },
  {
    id: 'usdc_ethereum',
    name: 'USD Coin (Ethereum)',
    symbol: 'USDC',
    chainId: 1,
    icon: '/icons/usdc.svg',
    decimals: 6
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    icon: '/icons/polygon.svg',
    decimals: 18
  },
  {
    id: 'usdc_polygon',
    name: 'USD Coin (Polygon)',
    symbol: 'USDC',
    chainId: 137,
    icon: '/icons/usdc.svg',
    decimals: 6
  },
  {
    id: 'usdt_ethereum',
    name: 'Tether (Ethereum)',
    symbol: 'USDT',
    chainId: 1,
    icon: '/icons/usdt.svg',
    decimals: 6
  },
  {
    id: 'dai_ethereum',
    name: 'Dai (Ethereum)',
    symbol: 'DAI',
    chainId: 1,
    icon: '/icons/dai.svg',
    decimals: 18
  },
  {
    id: 'wbtc_ethereum',
    name: 'Wrapped Bitcoin (Ethereum)',
    symbol: 'WBTC',
    chainId: 1,
    icon: '/icons/wbtc.svg',
    decimals: 8
  }
];

// Token addresses on different networks
const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
  137: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'
  }
};

export function Web3PaymentForm({
  amount,
  currency = 'USD',
  description,
  orderReference,
  onSuccess,
  onError
}: Web3PaymentFormProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'confirmed' | 'failed'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'pay' | 'confirm'>('select');

  // Fetch exchange rates when component mounts
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoadingRates(true);
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,usd-coin,tether,dai,wrapped-bitcoin&vs_currencies=usd');
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        
        const rates: Record<string, number> = {
          ETH: data['ethereum'].usd ? 1 / data['ethereum'].usd : 0,
          MATIC: data['matic-network'].usd ? 1 / data['matic-network'].usd : 0,
          USDC: data['usd-coin'].usd ? 1 / data['usd-coin'].usd : 1,
          USDT: data['tether'].usd ? 1 / data['tether'].usd : 1,
          DAI: data['dai'].usd ? 1 / data['dai'].usd : 1,
          WBTC: data['wrapped-bitcoin'].usd ? 1 / data['wrapped-bitcoin'].usd : 0
        };
        
        setExchangeRates(rates);
        
        // Set default selected crypto
        if (!selectedCrypto) {
          setSelectedCrypto(CRYPTO_OPTIONS[0]);
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        // Use fallback rates
        setExchangeRates({
          ETH: 0.0004,  // ~$2500 per ETH
          MATIC: 0.8,   // ~$1.25 per MATIC
          USDC: 1,      // 1:1 with USD
          USDT: 1,      // 1:1 with USD
          DAI: 1,       // 1:1 with USD
          WBTC: 0.00002 // ~$50,000 per BTC
        });
        setError('Could not fetch latest exchange rates. Using estimated rates.');
      } finally {
        setLoadingRates(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 60 seconds
    const interval = setInterval(fetchExchangeRates, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate crypto amount when fiat amount, selected crypto, or exchange rates change
  useEffect(() => {
    if (selectedCrypto && exchangeRates[selectedCrypto.symbol]) {
      const rate = exchangeRates[selectedCrypto.symbol];
      // Calculate amount in crypto with appropriate decimals
      const amountInCrypto = (amount * rate).toFixed(selectedCrypto.decimals === 18 ? 6 : selectedCrypto.decimals); 
      setCryptoAmount(amountInCrypto);
    }
  }, [amount, selectedCrypto, exchangeRates]);

  // Handle wallet connection
  const handleConnect = (walletProvider: any, walletAddress: string, walletChainId: number) => {
    setProvider(walletProvider);
    setAddress(walletAddress);
    setChainId(walletChainId);
    
    // Auto-select crypto based on connected chain
    if (walletChainId && !selectedCrypto) {
      const matchingCrypto = CRYPTO_OPTIONS.find(crypto => crypto.chainId === walletChainId);
      if (matchingCrypto) {
        setSelectedCrypto(matchingCrypto);
      }
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    setProvider(null);
    setAddress(null);
    setChainId(null);
    setPaymentStatus('idle');
    setTransactionHash(null);
  };

  // Handle crypto selection
  const handleCryptoSelect = (cryptoId: string) => {
    const crypto = CRYPTO_OPTIONS.find(option => option.id === cryptoId);
    if (crypto) {
      setSelectedCrypto(crypto);
      
      // Check if we need to switch networks
      if (chainId && crypto.chainId !== chainId) {
        // The Web3WalletConnector component will handle the network switch
        // when requiredChainId doesn't match connected chainId
      }
    }
  };

  // Proceed to payment step
  const proceedToPayment = () => {
    if (selectedCrypto) {
      setPaymentStep('pay');
    }
  };

  // Make payment function
  const makePayment = async () => {
    if (!provider || !address || !selectedCrypto || !cryptoAmount) {
      setError('Please connect your wallet and select a cryptocurrency.');
      return;
    }
    
    try {
      setPaymentStatus('processing');
      setError(null);
      
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      let tx;
      
      // Check if we're paying with a token or native currency
      if (selectedCrypto.symbol !== 'ETH' && selectedCrypto.symbol !== 'MATIC') {
        // Token payment (USDC, USDT, DAI, WBTC)
        const tokenAddress = TOKEN_ADDRESSES[selectedCrypto.chainId][selectedCrypto.symbol];
        if (!tokenAddress) {
          throw new Error(`Token address not found for ${selectedCrypto.symbol} on chain ${selectedCrypto.chainId}`);
        }
        
        // Using ERC20 interface
        const erc20Interface = new Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        
        const tokenContract = new Contract(tokenAddress, erc20Interface, signer);
        
        // Merchant address would usually come from the backend
        const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || '0xYourMerchantAddressHere';
        
        // Amount calculation for tokens
        const amountInWei = parseUnits(cryptoAmount, selectedCrypto.decimals);
        
        // Send transaction
        tx = await tokenContract.transfer(merchantAddress, amountInWei);
      } else {
        // Native currency payment (ETH/MATIC)
        const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || '0xYourMerchantAddressHere';
        const amountInWei = parseEther(cryptoAmount);
        
        // Send transaction
        tx = await signer.sendTransaction({
          to: merchantAddress,
          value: amountInWei,
          data: hexlify(toUtf8Bytes(`VibeWell Payment: ${orderReference || 'Order'}`))
        });
      }
      
      console.log('Transaction sent:', tx.hash);
      setTransactionHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await ethersProvider.waitForTransaction(tx.hash, 1); // Wait for 1 confirmation
      
      if (receipt.status === 1) {
        setPaymentStatus('confirmed');
        setPaymentStep('confirm');
        
        if (onSuccess) {
          onSuccess(tx.hash, selectedCrypto.symbol);
        }
      } else {
        throw new Error('Transaction failed on the blockchain');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
      setError(err.message || 'Payment failed. Please try again.');
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  const handlePaymentSuccess = async (receipt: ethers.TransactionReceipt | null) => {
    if (!receipt) {
      console.error('Payment receipt is null');
      setPaymentStatus('failed');
      return;
    }
    setPaymentStatus('confirmed');
    setTransactionHash(receipt.hash);
    // ... existing code ...
  };

  // Render payment selection step
  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Cryptocurrency</h3>
        <p className="text-sm text-muted-foreground">
          Choose which cryptocurrency you&apos;d like to pay with
        </p>
      </div>
      
      <RadioGroup 
        value={selectedCrypto?.id || ''}
        onValueChange={handleCryptoSelect}
      >
        {CRYPTO_OPTIONS.map((crypto) => (
          <div key={crypto.id} className="flex items-center space-x-2 py-2">
            <RadioGroupItem value={crypto.id} id={crypto.id} />
            <Label 
              htmlFor={crypto.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative w-6 h-6">
                <Image 
                  src={crypto.icon} 
                  alt={crypto.name} 
                  fill
                  className="object-contain"
                  sizes="24px"
                  onError={(e) => {
                    // Fallback for missing icons
                    (e.target as any).src = '/icons/default-crypto.svg';
                  }}
                />
              </div>
              <span>{crypto.name}</span>
              {loadingRates ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  ≈ {(amount * (exchangeRates[crypto.symbol] || 0)).toFixed(
                    crypto.symbol === 'USDC' ? 2 : 6
                  )} {crypto.symbol}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <Button 
        onClick={proceedToPayment} 
        disabled={!selectedCrypto || loadingRates}
        className="w-full"
      >
        Continue to Payment
      </Button>
    </div>
  );

  // Render payment execution step
  const renderPayStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Make Payment</h3>
        <p className="text-sm text-muted-foreground">
          Connect your wallet and send {cryptoAmount} {selectedCrypto?.symbol}
        </p>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Amount Due</div>
          <div className="text-2xl font-bold">{cryptoAmount} {selectedCrypto?.symbol}</div>
          <div className="text-sm text-muted-foreground">≈ {currency} {amount.toFixed(2)}</div>
        </div>
      </div>
      
      {!address ? (
        <div className="flex justify-center">
          <Web3WalletConnector 
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            requiredChainId={selectedCrypto?.chainId}
            buttonText="Connect Wallet to Pay"
          />
        </div>
      ) : (
        <>
          <Button 
            onClick={makePayment} 
            disabled={paymentStatus === 'processing' || !cryptoAmount}
            className="w-full"
          >
            {paymentStatus === 'processing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${cryptoAmount} ${selectedCrypto?.symbol}`
            )}
          </Button>
          
          {paymentStatus === 'processing' && transactionHash && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Transaction submitted. Waiting for confirmation...</p>
              <a 
                href={`${selectedCrypto?.chainId === 1 ? 'https://etherscan.io' : 'https://polygonscan.com'}/tx/${transactionHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center mt-2 text-primary hover:underline"
              >
                View on Blockchain
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render confirmation step
  const renderConfirmStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Payment Successful</h3>
        <p className="text-sm text-muted-foreground">
          Your payment of {cryptoAmount} {selectedCrypto?.symbol} has been confirmed.
        </p>
      </div>
      
      <div className="p-4 bg-muted rounded-lg text-sm">
        <div className="flex justify-between py-1">
          <span>Amount Paid:</span>
          <span>{cryptoAmount} {selectedCrypto?.symbol}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Transaction ID:</span>
          <span className="truncate max-w-[150px]">{transactionHash?.slice(0, 10)}...{transactionHash?.slice(-8)}</span>
        </div>
        <a 
          href={`${selectedCrypto?.chainId === 1 ? 'https://etherscan.io' : 'https://polygonscan.com'}/tx/${transactionHash}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center mt-2 text-primary hover:underline"
        >
          View on Blockchain
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
      
      <Button 
        onClick={() => router.push('/account/payments')}
        className="w-full"
      >
        View Payment History
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pay with Cryptocurrency</CardTitle>
        <CardDescription>
          Secure payment using blockchain technology
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loadingRates && paymentStep === 'select' && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Loading exchange rates</AlertTitle>
            <AlertDescription>Getting the latest crypto prices...</AlertDescription>
          </Alert>
        )}
        
        {paymentStep === 'select' && renderSelectStep()}
        {paymentStep === 'pay' && renderPayStep()}
        {paymentStep === 'confirm' && renderConfirmStep()}
      </CardContent>
      
      {paymentStep !== 'select' && paymentStep !== 'confirm' && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setPaymentStep('select')}
            disabled={paymentStatus === 'processing'}
          >
            Back
          </Button>
          <div className="text-xs text-muted-foreground">
            Secured by blockchain technology
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 