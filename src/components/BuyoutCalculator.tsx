import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import useDevice from '../hooks/useDevice';
import { motion, AnimatePresence } from 'framer-motion';

interface BuyoutBreakdown {
  monthlyBill: number;
  monthsRemaining: number;
  totalWithVAT: number;
  vatAmount: number;
  totalExVAT: number;
  contribution: number;
  customerPayment: number;
}

const BuyoutCalculator: React.FC = () => {
  const { isMobile } = useDevice();
  const [provider, setProvider] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom'>('preset');
  const [contractLength, setContractLength] = useState('6');
  const [customDate, setCustomDate] = useState('');

  const BUYOUT_CONTRIBUTION = 300; // £300 contribution
  const VAT_RATE = 0.20; // 20% VAT

  const providers = ['BT', 'Sky', 'TalkTalk', 'Virgin Media', 'Vodafone', 'Other'];
  const presetPeriods = [
    { label: isMobile ? '6M' : '6 Months', value: '6' },
    { label: isMobile ? '12M' : '12 Months', value: '12' },
    { label: isMobile ? '18M' : '18 Months', value: '18' },
    { label: isMobile ? '24M' : '24 Months', value: '24' }
  ];

  const calculateMonthsRemaining = () => {
    if (contractEndType === 'preset') {
      return parseInt(contractLength);
    } else if (customDate) {
      const end = new Date(customDate);
      const now = new Date();
      const months = (end.getFullYear() - now.getFullYear()) * 12 + 
                    (end.getMonth() - now.getMonth());
      return Math.max(0, months);
    }
    return 0;
  };

  const calculateBreakdown = (): BuyoutBreakdown => {
    const monthlyAmount = parseFloat(monthlyBill) || 0;
    const months = calculateMonthsRemaining();
    const totalWithVAT = monthlyAmount * months;
    const totalExVAT = totalWithVAT / (1 + VAT_RATE);
    const vatAmount = totalWithVAT - totalExVAT;
    const customerPayment = Math.max(0, totalExVAT - BUYOUT_CONTRIBUTION);
    
    return {
      monthlyBill: monthlyAmount,
      monthsRemaining: months,
      totalWithVAT,
      vatAmount,
      totalExVAT,
      contribution: Math.min(BUYOUT_CONTRIBUTION, totalExVAT),
      customerPayment
    };
  };

  const breakdown = calculateBreakdown();
  const canBuyoutInFull = breakdown.customerPayment === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Contract Buyout Calculator</h2>
      <p className="text-gray-400">
        Calculate your contract buyout costs and potential savings.
      </p>
      
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md text-white"
            >
              <option value="">Select Provider</option>
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Monthly Bill */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Bill
            </label>
            {isEditingBill ? (
              <input
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                onBlur={() => setIsEditingBill(false)}
                className="w-full bg-gray-700 border-gray-600 rounded-md text-white"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingBill(true)}
                className="cursor-pointer p-2 bg-gray-700 rounded-md text-white"
              >
                £{monthlyBill || '0.00'}
              </div>
            )}
          </div>

          {/* Contract End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contract End Date
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setContractEndType('preset')}
                  className={`px-4 py-2 rounded-md ${
                    contractEndType === 'preset'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Preset
                </button>
                <button
                  onClick={() => setContractEndType('custom')}
                  className={`px-4 py-2 rounded-md ${
                    contractEndType === 'custom'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {contractEndType === 'preset' ? (
                <div className="grid grid-cols-2 gap-2">
                  {presetPeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setContractLength(period.value)}
                      className={`px-4 py-2 rounded-md ${
                        contractLength === period.value
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 rounded-md text-white"
                />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Monthly Bill</span>
                <span className="text-white">£{breakdown.monthlyBill.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Months Remaining</span>
                <span className="text-white">{breakdown.monthsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total (inc. VAT)</span>
                <span className="text-white">£{breakdown.totalWithVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">VAT Amount</span>
                <span className="text-white">£{breakdown.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total (ex. VAT)</span>
                <span className="text-white">£{breakdown.totalExVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Our Contribution</span>
                <span>£{breakdown.contribution.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-white">You Pay</span>
                <span className={canBuyoutInFull ? 'text-green-400' : 'text-white'}>
                  £{breakdown.customerPayment.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyoutCalculator;
