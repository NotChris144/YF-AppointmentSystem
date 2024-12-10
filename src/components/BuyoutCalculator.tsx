import React, { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, X } from 'lucide-react';
import useDevice from '../hooks/useDevice';
import { motion, AnimatePresence } from 'framer-motion';
import NumberPad from './ui/NumberPad';
import NumberInput from './ui/NumberInput';
import { cn } from '../lib/utils';

interface BuyoutBreakdown {
  monthlyBill: number;
  monthsRemaining: number;
  totalCost: number;
  totalExVAT: number;
  vatAmount: number;
  contribution: number;
  customerPayment: number;
}

const BuyoutCalculator: React.FC = () => {
  const { isMobile } = useDevice();
  const [provider, setProvider] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('0');
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom' | null>(null);
  const [contractLength, setContractLength] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const BUYOUT_CONTRIBUTION = 300; // £300 contribution
  const VAT_RATE = 0.20; // 20% VAT

  const providers = ['BT', 'Sky', 'TalkTalk', 'Virgin Media', 'Vodafone', 'Other'];
  const presetPeriods = [
    { label: isMobile ? '6M' : '6 Months', value: '6' },
    { label: isMobile ? '12M' : '12 Months', value: '12' },
    { label: isMobile ? '18M' : '18 Months', value: '18' },
    { label: isMobile ? '24M' : '24 Months', value: '24' }
  ];

  const handlePresetPeriodClick = (value: string) => {
    if (contractLength === value && contractEndType === 'preset') {
      setContractLength(null);
      setContractEndType(null);
    } else {
      setContractLength(value);
      setContractEndType('preset');
      // Update custom date to reflect the selected period
      const date = new Date();
      date.setMonth(date.getMonth() + parseInt(value));
      setCustomDate(date.toISOString().split('T')[0]);
    }
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
    setContractEndType('custom');
    // Calculate and set contract length based on custom date
    const end = new Date(e.target.value);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + 
                  (end.getMonth() - now.getMonth());
    setContractLength(Math.max(0, months).toString());
  };

  const handleProviderClick = (selectedProvider: string) => {
    if (provider === selectedProvider) {
      setProvider('');
    } else {
      setProvider(selectedProvider);
    }
  };

  const calculateMonthsRemaining = () => {
    if (!contractEndType) return 0;
    if (contractEndType === 'preset') {
      return parseInt(contractLength || '0');
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
    const totalCost = monthlyAmount * months;
    const totalExVAT = totalCost * (1 - VAT_RATE);
    const vatAmount = totalCost - totalExVAT;
    const customerPayment = Math.max(0, totalExVAT - BUYOUT_CONTRIBUTION);
    
    return {
      monthlyBill: monthlyAmount,
      monthsRemaining: months,
      totalCost,
      totalExVAT,
      vatAmount,
      contribution: Math.min(BUYOUT_CONTRIBUTION, totalExVAT),
      customerPayment
    };
  };

  const breakdown = calculateBreakdown();
  const canBuyoutInFull = breakdown.customerPayment === 0;

  const handleBillChange = (value: string) => {
    setMonthlyBill(value);
  };

  const toggleBillEdit = () => {
    setIsEditingBill(!isEditingBill);
  };

  useEffect(() => {
    const hasRequiredFields = monthlyBill !== '' && contractLength !== null;
    setShowBreakdown(hasRequiredFields);
    if (hasRequiredFields) {
      // Reset animation sequence
      setAnimationStep(0);
      const timer = setInterval(() => {
        setAnimationStep(prev => {
          if (prev >= 7) { // Total number of animated elements
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 200); // Delay between each animation
      return () => clearInterval(timer);
    }
  }, [monthlyBill, contractLength]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      {/* Monthly Bill Input */}
      <div className="relative">
        <div 
          className={cn(
            "w-full p-4 rounded-lg bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors",
            "flex items-center justify-between"
          )}
          onClick={toggleBillEdit}
        >
          <div>
            <label className="text-sm text-gray-400">Monthly Bill</label>
            <div className="text-2xl font-bold">£{parseFloat(monthlyBill).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <Edit2 className="w-5 h-5 text-gray-400" />
        </div>

        {/* Number Pad Modal */}
        <AnimatePresence>
          {isEditingBill && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={toggleBillEdit}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-2xl"
              >
                <div className="flex justify-between items-center p-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold">Enter Monthly Bill</h3>
                  <button
                    onClick={toggleBillEdit}
                    className="p-2 hover:bg-card/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <NumberPad
                  value={monthlyBill}
                  onChange={handleBillChange}
                  maxValue={999.99}
                  minValue={0}
                  prefix="£"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Provider Selection */}
      <motion.div
        className="space-y-4 rounded-xl bg-card/50 p-4 sm:p-6"
        animate={{ opacity: 1 }}
      >
        <h3 className="text-lg font-medium">Who's your provider?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {providers.map(p => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(p)}
              className={`p-4 rounded-xl border-2 transition-all ${
                provider === p
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-transparent bg-card/50 hover:border-primary/20'
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Contract Length */}
      <motion.div
        className="rounded-xl bg-card/50 p-4 sm:p-6 space-y-4"
        animate={{ opacity: monthlyBill ? 1 : 0.8 }}
      >
        <h3 className="text-lg font-medium">Contract Length</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presetPeriods.map(period => (
            <motion.button
              key={period.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePresetPeriodClick(period.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                contractEndType === 'preset' && contractLength === period.value
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-transparent bg-card/50 hover:border-primary/20'
              }`}
            >
              {period.label}
            </motion.button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="date"
            value={customDate}
            onChange={handleCustomDateChange}
            className={`w-full p-4 rounded-lg bg-transparent border transition-all ${
              contractEndType === 'custom'
                ? 'border-primary bg-primary/5'
                : 'border-border/50'
            } focus:border-primary focus:ring-0 text-base`}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            className={`p-4 sm:p-6 rounded-xl border-2 space-y-4 ${
              canBuyoutInFull 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-yellow-500/5 border-yellow-500/20'
            }`}
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Breakdown</h3>
            </div>

            <motion.div className="space-y-4 overflow-hidden">
              <div className="grid gap-3">
                {[
                  {
                    label: "Monthly Bill",
                    value: `£${breakdown.monthlyBill.toFixed(2)}`,
                    step: 0
                  },
                  {
                    label: "Months Remaining",
                    value: breakdown.monthsRemaining,
                    step: 1
                  },
                  {
                    label: "Total Cost",
                    value: `£${breakdown.totalCost.toFixed(2)}`,
                    step: 2
                  },
                  {
                    label: "Total Cost - VAT",
                    value: `£${breakdown.totalExVAT.toFixed(2)}`,
                    step: 3
                  },
                  {
                    label: "VAT Amount",
                    value: `£${breakdown.vatAmount.toFixed(2)}`,
                    step: 4
                  },
                  {
                    label: "Our Contribution",
                    value: `-£${breakdown.contribution.toFixed(2)}`,
                    isGreen: true,
                    step: 5
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex justify-between items-center p-4 rounded-lg bg-black/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: animationStep >= item.step ? 1 : 0,
                      x: animationStep >= item.step ? 0 : -20
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-medium ${item.isGreen ? 'text-green-500' : ''}`}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="pt-6"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: animationStep >= 6 ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <span className="text-lg font-medium mb-2 block">Final Payment</span>
                  <span className={`text-3xl font-bold block mb-3 ${canBuyoutInFull ? 'text-green-500' : 'text-yellow-500'}`}>
                    £{breakdown.customerPayment.toFixed(2)}
                  </span>
                  <motion.p
                    className={`text-sm ${canBuyoutInFull ? 'text-green-600/80' : 'text-yellow-600/80'}`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: animationStep >= 7 ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {canBuyoutInFull 
                      ? 'Great news! We\'ll cover your entire buyout cost.'
                      : 'Additional payment needed to complete your buyout.'}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyoutCalculator;
