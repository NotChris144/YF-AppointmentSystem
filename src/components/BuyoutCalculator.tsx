import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface ProviderDetails {
  currentProvider: string;
  monthlyBill: number;
  contractMonthsLeft: number;
  etf: number;
}

const BuyoutCalculator: React.FC = () => {
  const [details, setDetails] = useState<ProviderDetails>({
    currentProvider: '',
    monthlyBill: 0,
    contractMonthsLeft: 0,
    etf: 0,
  });

  const calculateBuyout = () => {
    const { monthlyBill, contractMonthsLeft, etf } = details;
    return (monthlyBill * contractMonthsLeft) + etf;
  };

  return (
    <div className="w-full p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Buyout Calculator</h2>
      </div>
      
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Current Provider
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-md border border-input bg-background"
            value={details.currentProvider}
            onChange={(e) => setDetails({ ...details, currentProvider: e.target.value })}
            placeholder="e.g., AT&T, Verizon"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Monthly Bill ($)
          </label>
          <input
            type="number"
            className="w-full p-2 rounded-md border border-input bg-background"
            value={details.monthlyBill || ''}
            onChange={(e) => setDetails({ ...details, monthlyBill: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Months Left in Contract
          </label>
          <input
            type="number"
            className="w-full p-2 rounded-md border border-input bg-background"
            value={details.contractMonthsLeft || ''}
            onChange={(e) => setDetails({ ...details, contractMonthsLeft: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Early Termination Fee ($)
          </label>
          <input
            type="number"
            className="w-full p-2 rounded-md border border-input bg-background"
            value={details.etf || ''}
            onChange={(e) => setDetails({ ...details, etf: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="mt-6 p-4 bg-muted/10 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Estimated Buyout Cost</p>
            <p className="text-3xl font-bold text-primary">
              ${calculateBuyout().toFixed(2)}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BuyoutCalculator;
