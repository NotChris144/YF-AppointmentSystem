import React, { useMemo } from 'react';
import { differenceInMonths, addMonths, isSameMonth } from 'date-fns';
import { Calculator, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContractBuyoutProps {
  monthlyPrice?: number;
  contractEnd?: Date;
}

interface BuyoutDetails {
  monthsLeft: number;
  totalCost: number;
  discountedAmount: number;
  maxBuyout: number;
  customerContribution: number;
  canFullyBuyout: boolean;
}

const ContractBuyout: React.FC<ContractBuyoutProps> = ({
  monthlyPrice = 0,
  contractEnd,
}) => {
  const buyoutDetails = useMemo((): BuyoutDetails | null => {
    if (!contractEnd || !monthlyPrice) return null;

    const today = new Date();
    
    // Calculate months including both start and end month
    let monthsLeft = differenceInMonths(contractEnd, today);
    
    // Add 1 to include both start and end months, unless they're the same month
    if (!isSameMonth(today, contractEnd)) {
      monthsLeft += 1;
    }
    
    // Ensure we don't go negative
    monthsLeft = Math.max(0, monthsLeft);
    
    const totalCost = monthsLeft * monthlyPrice;
    const discountedAmount = totalCost * 0.8; // 80% of total cost
    const maxBuyout = 300; // Maximum amount we can contribute
    
    // Calculate if we can fully cover the discounted amount
    const canFullyBuyout = discountedAmount <= maxBuyout;
    
    // If we can fully buyout, customer pays nothing
    const customerContribution = canFullyBuyout ? 0 : discountedAmount - maxBuyout;

    return {
      monthsLeft,
      totalCost,
      discountedAmount,
      maxBuyout,
      customerContribution,
      canFullyBuyout,
    };
  }, [contractEnd, monthlyPrice]);

  if (!buyoutDetails) return null;

  return (
    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Contract Buyout Calculator</h3>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-muted hover:text-primary cursor-help" />
          <div className="absolute right-0 w-64 p-2 mt-2 text-xs bg-card border border-border rounded-md shadow-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            We can contribute up to £300 towards your contract buyout. The buyout amount is calculated at 80% of your remaining contract value.
          </div>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Months Remaining:</span>
          <span>{buyoutDetails.monthsLeft} months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total Contract Cost:</span>
          <span>£{buyoutDetails.totalCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Discounted Amount (80%):</span>
          <span>£{buyoutDetails.discountedAmount.toFixed(2)}</span>
        </div>
        
        <div className="h-px bg-border my-2" />
        
        <div className="flex justify-between font-medium">
          <span className="text-muted">We Pay:</span>
          <span className="text-success">
            £{Math.min(buyoutDetails.discountedAmount, buyoutDetails.maxBuyout).toFixed(2)}
          </span>
        </div>
        
        {!buyoutDetails.canFullyBuyout && (
          <div className="flex justify-between font-medium">
            <span className="text-muted">Customer Pays:</span>
            <span className="text-warning">
              £{buyoutDetails.customerContribution.toFixed(2)}
            </span>
          </div>
        )}
        
        <div className={cn(
          "mt-3 p-2 rounded text-center text-sm",
          buyoutDetails.canFullyBuyout
            ? "bg-success/20 text-success"
            : "bg-warning/20 text-warning"
        )}>
          {buyoutDetails.canFullyBuyout 
            ? "✓ Full buyout available"
            : `Customer contribution of £${buyoutDetails.customerContribution.toFixed(2)} required`}
        </div>
      </div>
    </div>
  );
};

export default ContractBuyout;