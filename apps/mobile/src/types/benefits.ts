// BenefitClaim model interface
export interface BenefitClaim {
  id: string;
  type: string;
  status: string;
  amount?: number;
  requestedAt: string;
  processedAt?: string;
}
